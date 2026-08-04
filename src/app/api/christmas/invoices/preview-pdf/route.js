import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { computeChristmasInvoice } from '@/lib/christmas/invoice-calc'
import { renderChristmasInvoicePdf } from '@/lib/christmas/invoice-pdf'
import { getChristmasInvoiceSettings } from '@/lib/christmas/invoice-settings'

export const runtime = 'nodejs'
export const maxDuration = 60

/*
 * Renders the Christmas invoice template PDF from unsaved form inputs so the
 * builder can show a live preview before anything is persisted.
 */
export async function POST(request) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const inputs = body?.inputs || {}
  const settings = await getChristmasInvoiceSettings()
  const templateKey = body?.templateKey || inputs.templateKey || settings.templateKey
  const payloadInputs = { ...inputs, templateKey }
  const computed = computeChristmasInvoice(payloadInputs)
  const invoice = {
    invoiceNumber: body?.invoiceNumber || 'PREVIEW',
    invoiceDate: payloadInputs.invoiceDate,
    dueDate: payloadInputs.dueDate,
    customerName: payloadInputs.customerName || 'Customer',
    data: { inputs: payloadInputs, computed },
  }

  try {
    const buffer = await renderChristmasInvoicePdf(invoice, { company: settings })
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[christmas/invoices] preview pdf failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
