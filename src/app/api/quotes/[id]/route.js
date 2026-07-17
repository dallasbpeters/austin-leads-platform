import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { computeQuote } from '@/lib/quotes/calc'
import { deleteQuote, getQuote, hasQuoteDatabase, updateQuote } from '@/lib/quotes/db'
import { syncQuoteIntegrations } from '@/lib/quotes/integrations'

export const runtime = 'nodejs'
export const maxDuration = 60

async function guard() {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasQuoteDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }
  return null
}

export async function GET(_request, { params }) {
  const denied = await guard()
  if (denied) {
    return denied
  }
  const { id } = await params
  const quote = await getQuote(id)
  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }
  return NextResponse.json({ quote })
}

export async function PUT(request, { params }) {
  const denied = await guard()
  if (denied) {
    return denied
  }
  const { id } = await params

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const existing = await getQuote(id)
  if (!existing) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  try {
    const inputs = body?.inputs || {}
    const computed = computeQuote(inputs)
    const quote = await updateQuote(id, { inputs, computed })
    const results = await syncQuoteIntegrations(quote)
    return NextResponse.json({ quote, results })
  } catch (error) {
    console.error('[quotes] update failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  const denied = await guard()
  if (denied) {
    return denied
  }
  const { id } = await params
  try {
    await deleteQuote(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[quotes] delete failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
