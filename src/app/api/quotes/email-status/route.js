import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { ensureQuotesTable, hasQuoteDatabase } from '@/lib/quotes/db'
import { syncQuoteEmailStatuses } from '@/lib/quotes/email-status'

export const runtime = 'nodejs'
export const maxDuration = 60

/*
 * Brings quotes that still read "sent" up to date with Resend. The quote
 * history Refresh button calls this before it reloads the list.
 */
export async function POST() {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
