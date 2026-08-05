import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { getInvoice, hasInvoiceDatabase } from '@/lib/christmas/invoice-db'
import { syncInvoiceToJobber } from '@/lib/jobber/sync'

export const runtime = 'nodejs'
export const maxDuration = 60

/*
 * On-demand Jobber push, triggered only by the "Push to Jobber" button — see
 * src/lib/christmas/invoice-integrations.js for why this isn't automatic.
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

  const result = await syncInvoiceToJobber(invoice)
  const updated = await getInvoice(id)
  return NextResponse.json({ invoice: updated, result })
}
