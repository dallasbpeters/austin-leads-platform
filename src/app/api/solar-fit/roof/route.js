import { NextResponse } from 'next/server'

import { hasGoogleKey, isInTexas, placeLocation, roofAt, roofPhoto } from '@/lib/solar-fit/google'
import { overLimit } from '@/lib/solar-fit/rate-limit'

/**
 * GET ?placeId=…&session=… -> the address, the roof under it, and its photo
 * with every panel placed on it in metres. `roof` is null when Google has no roof data there; the form then falls
 * back to its questions.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const placeId = (searchParams.get('placeId') || '').trim().slice(0, 300)

  if (!placeId || !hasGoogleKey()) {
    return NextResponse.json({ error: 'Address lookup is not available.' }, { status: 400 })
  }
  if (overLimit(request, { name: 'roof', perMinute: 10 })) {
    return NextResponse.json({ error: 'Too many lookups. Try again in a minute.' }, { status: 429 })
  }

  try {
    const place = await placeLocation(placeId, searchParams.get('session') || '')
    if (!Number.isFinite(place.lat) || !isInTexas(place.lat, place.lng)) {
      return NextResponse.json({ address: place.address, roof: null, reason: 'outside-texas' })
    }
    const roof = await roofAt(place.lat, place.lng)
    const photo = roof?.panels?.length ? await roofPhoto(roof) : null
    return NextResponse.json({ address: place.address, roof, photo })
  } catch (error) {
    console.warn('[solar-fit] roof lookup failed', error)
    return NextResponse.json(
      { error: 'We could not look up that roof. Try again, or keep going below.' },
      { status: 502 },
    )
  }
}
