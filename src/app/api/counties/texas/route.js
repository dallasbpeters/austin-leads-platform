// Server-side proxy for Texas county GeoJSON.
// Fetches from the Plotly CDN, filters to TX (FIPS 48xxx), adds a `fips`
// property for reliable Mapbox expression matching, and caches aggressively
// so the browser never hits the CDN directly.

const SOURCE_URL = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'

let cached = null

export const GET = async () => {
  if (cached) {
    return Response.json(cached, {
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    })
  }

  try {
    // `cache: 'no-store'`, not `next: { revalidate }`: the upstream file is ~4.3MB and
    // Next's data cache rejects anything over 2MB, so asking it to cache only produced a
    // "Failed to set Next.js data cache" error on every cold fetch. Caching is already
    // handled by the module-level `cached` memo below plus the Cache-Control header.
    const res = await fetch(SOURCE_URL, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`Upstream ${res.status}`)
    }
    const all = await res.json()

    const features = all.features
      .filter((f) => typeof f.id === 'string' && f.id.startsWith('48'))
      .map((f) => ({
        ...f,
        properties: { ...f.properties, fips: String(f.id) },
      }))

    cached = { type: 'FeatureCollection', features }

    return Response.json(cached, {
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    })
  } catch (error) {
    console.error('[/api/counties/texas]', error)
    return Response.json({ error: 'Failed to fetch county data' }, { status: 502 })
  }
}
