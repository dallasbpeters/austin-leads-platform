import { hasGoogleKey, isInTexas, staticMapUrl } from '@/lib/solar-fit/google'
import { overLimit } from '@/lib/solar-fit/rate-limit'

/**
 * GET ?lat=…&lng=…&zoom=… -> the satellite photo of a roof, fetched with the
 * server key so the key never appears in the page. Texas only.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))
  const zoom = Math.round(Number(searchParams.get('zoom')))

  if (!hasGoogleKey() || !Number.isFinite(lat) || !Number.isFinite(lng) || !isInTexas(lat, lng)) {
    return new Response('Not available', { status: 400 })
  }
  if (!(zoom >= 18 && zoom <= 21)) {
    return new Response('Bad zoom', { status: 400 })
  }
  if (overLimit(request, { name: 'roof-image', perMinute: 20 })) {
    return new Response('Too many requests', { status: 429 })
  }

  const response = await fetch(staticMapUrl(lat, lng, zoom), { next: { revalidate: 60 * 60 * 24 } })
  if (!response.ok) {
    return new Response('Photo unavailable', { status: 502 })
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': response.headers.get('content-type') || 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
