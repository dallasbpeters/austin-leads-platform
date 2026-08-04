import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { getInvoice, hasInvoiceDatabase, markInvoiceSent } from '@/lib/christmas/invoice-db'
import { sendInvoiceEmail } from '@/lib/christmas/invoice-email'
import { syncChristmasInvoiceIntegrations } from '@/lib/christmas/invoice-integrations'
import { christmasInvoiceFileName, renderChristmasInvoicePdf } from '@/lib/christmas/invoice-pdf'
import { getChristmasInvoiceSettings } from '@/lib/christmas/invoice-settings'

export const runtime = 'nodejs'
export const maxDuration = 60

/*
 * Sends a saved Christmas invoice to the customer:
 *   1. Render the PDF from the saved data
 *   2. Email via Resend (PDF attachment)
 *   3. Re-sync Zoho Sheet + WorkDrive so the emailed status is logged
 *
 * Each integration reports success/failure independently so a Zoho hiccup
 * never blocks the customer email.
 */
export async function POST(request, { params }) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasInvoiceDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  let body = {}
  try {
    body = await request.json()
  } catch {
    // Empty body is fine — defaults apply.
  }
  const to = body?.to?.trim() || invoice.customerEmail
  const message = body?.message?.trim() || ''

  const config = await getChristmasInvoiceSettings()
  let pdfBuffer
  const fileName = christmasInvoiceFileName(invoice)
  try {
    pdfBuffer = await renderChristmasInvoicePdf(invoice, { company: config })
  } catch (error) {
    console.error('[christmas/invoices] pdf render failed', error)
    return NextResponse.json({ error: `PDF generation failed: ${error.message}` }, { status: 500 })
  }

  const results = { email: null, sheet: null, workdrive: null }

  // 1. Email
  try {
    const sent = await sendInvoiceEmail({ invoice, pdfBuffer, fileName, to, message, company: config })
    await markInvoiceSent(id, { emailedTo: sent.to })
    results.email = { ok: true, to: sent.to }
  } catch (error) {
    console.error('[christmas/invoices] email failed', error)
    results.email = { ok: false, error: error.message }
  }

  // 2. Zoho Sheet + WorkDrive — re-sync so the emailed status is logged.
  {
    const fresh = await getInvoice(id)
    const integrationResults = await syncChristmasInvoiceIntegrations(fresh, config)
    results.sheet = integrationResults.sheet
    results.workdrive = integrationResults.workdrive
  }

  const updated = await getInvoice(id)
  return NextResponse.json({ invoice: updated, results })
}
