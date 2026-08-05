import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { clearJobberConnection, hasJobberDatabase } from '@/lib/jobber/db'

export const runtime = 'nodejs'

export async function POST() {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasJobberDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  await clearJobberConnection()
  return NextResponse.json({ ok: true })
}
