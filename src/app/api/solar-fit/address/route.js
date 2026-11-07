import { NextResponse } from 'next/server'

import { hasGoogleKey, suggestAddresses } from '@/lib/solar-fit/google'
import { overLimit } from '@/lib/solar-fit/rate-limit'

/** GET ?q=1100 Congress&session=… -> up to five address suggestions. */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('q') || '').trim().slice(0, 120)

  if (query.length < 4 || !hasGoogleKey()) {
    return NextResponse.json({ suggestions: [] })
  }
  if (overLimit(request, { name: 'address', perMinute: 60 })) {
    return NextResponse.json({ error: 'Too many searches. Try again in a minute.' }, { status: 429 })
  }

  try {
    const suggestions = await suggestAddresses(query, searchParams.get('session') || '')
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.warn('[solar-fit] address search failed', error)
    return NextResponse.json({ suggestions: [] })
  }
}
