import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { getInvoice, hasInvoiceDatabase, markInvoiceEmailStatus } from '@/lib/christmas/invoice-db'
import { fetchResendEmailStatus } from '@/lib/christmas/invoice-email-status'

export const runtime = 'nodejs'

/*
 * Verifies that an invoice email actually reached the customer by asking
 * Resend for the message's current state, then storing what it reports so the
 * history table can show it without re-querying on every page load.
 */
export async function POST(_request, { params }) {
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

  const result = await fetchResendEmailStatus(invoice)
  if (!result.ok) {
    // A missing message is a reportable outcome, not a server failure -- the
    // UI shows the reason next to the invoice.
    return NextResponse.json({ invoice, result })
  }

  await markInvoiceEmailStatus(id, { status: result.status, resendEmailId: result.resendEmailId })
  const updated = await getInvoice(id)
  return NextResponse.json({ invoice: updated, result })
}
