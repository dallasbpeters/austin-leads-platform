import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { ensureQuotesTable, hasQuoteDatabase } from '@/lib/quotes/db'
import { syncQuoteEmailStatuses } from '@/lib/quotes/email-status'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST() {
  const denied = await requireAdminRequest()
  if (denied) {
    return denied
  }
  if (!hasQuoteDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    await ensureQuotesTable()
    return NextResponse.json(await syncQuoteEmailStatuses())
  } catch (error) {
    console.error('[quotes] email status sync failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
