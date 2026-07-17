import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { getQuote, hasQuoteDatabase } from '@/lib/quotes/db'
import { quotePdfFileName, renderQuotePdf } from '@/lib/quotes/pdf'

export const runtime = 'nodejs'

export async function GET(_request, { params }) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasQuoteDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const { id } = await params
  const quote = await getQuote(id)
  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  try {
    const buffer = await renderQuotePdf(quote)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${quotePdfFileName(quote)}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[quotes] pdf render failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
