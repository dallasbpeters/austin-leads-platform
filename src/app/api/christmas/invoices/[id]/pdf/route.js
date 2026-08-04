import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { ensureChristmasInvoiceTables, getInvoice } from '@/lib/christmas/invoice-db'
import { renderChristmasInvoicePdf } from '@/lib/christmas/invoice-pdf'
import { getChristmasInvoiceSettings } from '@/lib/christmas/invoice-settings'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(_request, { params }) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    await ensureChristmasInvoiceTables()
    const invoice = await getInvoice(id)
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const settings = await getChristmasInvoiceSettings()
    const buffer = await renderChristmasInvoicePdf(invoice, { company: settings })
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(
          `${invoice.customerName} - Invoice ${invoice.invoiceNumber}.pdf`,
        )}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[christmas/invoices] pdf render failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
