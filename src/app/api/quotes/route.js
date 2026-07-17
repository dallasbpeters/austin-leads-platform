import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { computeQuote } from '@/lib/quotes/calc'
import { ensureQuotesTable, hasQuoteDatabase, insertQuote, listQuotes } from '@/lib/quotes/db'
import { syncQuoteIntegrations } from '@/lib/quotes/integrations'

export const runtime = 'nodejs'
export const maxDuration = 60

async function requireSession() {
  const session = await safeAuth()
  if (!session?.user) {
    return null
  }
  return session
}

export async function GET() {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasQuoteDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    await ensureQuotesTable()
    const quotes = await listQuotes({ limit: 200 })
    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('[quotes] list failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasQuoteDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const inputs = body?.inputs || {}
  if (!inputs.customerName?.trim()) {
    return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
  }
  if (!(Number(inputs.panelQuantity) > 0) || !(Number(inputs.panelWatts) > 0)) {
    return NextResponse.json({ error: 'Panel quantity and wattage are required' }, { status: 400 })
  }
  if (!(Number(inputs.systemPrice) > 0)) {
    return NextResponse.json({ error: 'System price is required' }, { status: 400 })
  }

  try {
    await ensureQuotesTable()
    // Always compute server-side so stored math is authoritative.
    const computed = computeQuote(inputs)
    const quote = await insertQuote({ inputs, computed })
    const results = await syncQuoteIntegrations(quote)
    return NextResponse.json({ quote, results }, { status: 201 })
  } catch (error) {
    console.error('[quotes] create failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
