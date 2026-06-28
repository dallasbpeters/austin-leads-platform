import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { isUnsplashConfigured, searchUnsplashPhotos } from '@/lib/platform/unsplash'

export const runtime = 'nodejs'

export async function GET(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  if (!isUnsplashConfigured()) {
    return NextResponse.json({ error: 'Unsplash is not configured.' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim()

  if (!query) {
    return NextResponse.json({ error: 'Query is required.' }, { status: 400 })
  }

  try {
    const page = Number(searchParams.get('page') || '1')
    const results = await searchUnsplashPhotos(query, page)

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unsplash search failed.' },
      { status: 502 },
    )
  }
}
