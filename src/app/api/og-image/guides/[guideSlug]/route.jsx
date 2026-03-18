export const runtime = 'nodejs'

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const FALLBACK_TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg=='

function isPng(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength < PNG_SIGNATURE.length) return false
  const bytes = new Uint8Array(arrayBuffer)
  return PNG_SIGNATURE.every((value, index) => bytes[index] === value)
}

function pngHeaders(byteLength) {
  return {
    'content-type': 'image/png',
    'content-length': String(byteLength),
    'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    'x-content-type-options': 'nosniff',
    'content-disposition': 'inline; filename="og-guide.png"',
  }
}

function fallbackResponse(includeBody) {
  const fallbackBytes = Buffer.from(FALLBACK_TRANSPARENT_PNG_BASE64, 'base64')
  return new Response(includeBody ? fallbackBytes : null, {
    status: 200,
    headers: pngHeaders(fallbackBytes.byteLength),
  })
}

async function handleGuideImage(request, context, includeBody) {
  try {
    const params = await context.params
    const guideSlug = String(params?.guideSlug || '').trim()
    if (!guideSlug) return fallbackResponse(includeBody)

    const requestUrl = new URL(request.url)
    const upstreamUrl = new URL(`/api/og/guides/${encodeURIComponent(guideSlug)}`, requestUrl.origin)
    const response = await fetch(upstreamUrl.toString(), {
      headers: {
        'user-agent': request.headers.get('user-agent') || 'guide-og-image-proxy',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) return fallbackResponse(includeBody)

    const body = await response.arrayBuffer()
    if (!isPng(body)) return fallbackResponse(includeBody)

    return new Response(includeBody ? body : null, {
      status: 200,
      headers: pngHeaders(body.byteLength),
    })
  } catch {
    return fallbackResponse(includeBody)
  }
}

export async function GET(request, context) {
  return handleGuideImage(request, context, true)
}

export async function HEAD(request, context) {
  return handleGuideImage(request, context, false)
}
