import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { computeQuote } from '@/lib/quotes/calc'
import { renderQuotePdf } from '@/lib/quotes/pdf'

export const runtime = 'nodejs'

/*
 * Renders the quote template PDF from unsaved form inputs so the form can
 * show a live preview before anything is persisted.
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
  const computed = computeQuote(inputs)
  const quote = {
    quoteNumber: body?.quoteNumber || 'PREVIEW',
    createdAt: new Date().toISOString(),
    customerName: inputs.customerName || 'Customer',
    data: { inputs, computed },
  }

  try {
    const buffer = await renderQuotePdf(quote)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[quotes] preview pdf failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
