import { after, NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { syncQuoteToCrm } from '@/lib/quotes/crm'
import {
  getQuote,
  hasQuoteDatabase,
  markQuoteSent,
  markQuoteSheetSynced,
  markQuoteUploaded,
} from '@/lib/quotes/db'
import { hasQuoteEmailConfig, sendQuoteEmail } from '@/lib/quotes/email'
import { checkQuoteDeliveryAfterSend } from '@/lib/quotes/email-status'
import { quotePdfFileName, renderQuotePdf } from '@/lib/quotes/pdf'
import { syncQuoteToSheet } from '@/lib/zoho/sheet'
import { syncQuotePdfToWorkdrive } from '@/lib/zoho/workdrive'

export const runtime = 'nodejs'
export const maxDuration = 60

/*
 * Sends the quote to the customer and archives it:
 *   1. Render the PDF
 *   2. Email via Resend (attachment)
 *   3. Append/update Zoho Sheet
 *   4. Upsert CRM lead
 *   5. Upload PDF to WorkDrive under {Customer}/Quotes/
 *
 * Each integration reports success/failure independently so a Zoho hiccup
 * never blocks the customer email.
 */
export async function POST(request, { params }) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasQuoteDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const { id } = await params
  const quote = await getQuote(id)
  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  let body = {}
  try {
    body = await request.json()
  } catch {
    // Empty body is fine — defaults apply.
  }
  const to = body?.to?.trim() || quote.customerEmail
  const message = body?.message?.trim() || ''
  const skipEmail = body?.skipEmail === true

  let pdfBuffer
  const fileName = quotePdfFileName(quote)
  try {
    pdfBuffer = await renderQuotePdf(quote)
  } catch (error) {
    console.error('[quotes] pdf render failed', error)
    return NextResponse.json({ error: `PDF generation failed: ${error.message}` }, { status: 500 })
  }

  const results = { email: null, sheet: null, crm: null, workdrive: null }

  // 1. Email
  if (skipEmail) {
    results.email = { skipped: true }
  } else if (hasQuoteEmailConfig()) {
    try {
      const sent = await sendQuoteEmail({ quote, pdfBuffer, fileName, to, message })
      await markQuoteSent(id, { emailedTo: sent.to, resendEmailId: sent.id })
      after(() => checkQuoteDeliveryAfterSend(id))
      results.email = { ok: true, to: sent.to }
    } catch (error) {
      console.error('[quotes] email failed', error)
      results.email = { ok: false, error: error.message }
    }
  } else {
    results.email = { ok: false, error: 'Resend is not configured' }
  }

  // 2. Zoho Sheet — also runs on save; re-sync so emailed status is logged
  {
    const fresh = await getQuote(id)
    results.sheet = await syncQuoteToSheet(fresh)
    if (results.sheet.ok) {
      await markQuoteSheetSynced(id)
    }
  }

  // 3. CRM
  {
    const fresh = await getQuote(id)
    results.crm = await syncQuoteToCrm(fresh)
  }

  // 4. WorkDrive — {Customer Name}/Quotes/
  results.workdrive = await syncQuotePdfToWorkdrive({
    clientName: quote.customerName,
    fileName,
    buffer: pdfBuffer,
  })
  if (results.workdrive.ok) {
    await markQuoteUploaded(id, {
      fileId: results.workdrive.fileId,
      folderId: results.workdrive.folderId,
    })
  }

  const updated = await getQuote(id)
  return NextResponse.json({ quote: updated, results })
}
