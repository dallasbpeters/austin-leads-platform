import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { computeQuote } from '@/lib/quotes/calc'

export const runtime = 'nodejs'

/*
 * Live calculation preview for the quote form — no persistence.
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

  return NextResponse.json({ computed: computeQuote(body?.inputs || {}) })
}
