import { getPageForRequest, resolveSiteByHost } from '@/lib/platform/content'

export const runtime = 'nodejs'
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const FALLBACK_TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg=='

function getRequestHost(request) {
  return request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
}

function getGuidePath(slug) {
  return `/guides/${String(slug || '').replace(/^\/+/, '')}`
}

function titleFromGuideSlug(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function isPng(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength < PNG_SIGNATURE.length) {
    return false
  }

  const bytes = new Uint8Array(arrayBuffer)
  return PNG_SIGNATURE.every((value, index) => bytes[index] === value)
}

async function fetchPng(url, userAgent) {
  const response = await fetch(url, {
    headers: {
      'user-agent': userAgent || 'guide-og-proxy',
    },
  })

  if (!response.ok) {
    return null
  }

  const body = await response.arrayBuffer()
  if (!isPng(body)) {
    return null
  }

  return {
    body,
    cacheControl:
      response.headers.get('cache-control') || 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
  }
}

function buildPngHeaders(contentLength, cacheControl) {
  return {
    'content-type': 'image/png',
    'content-length': String(contentLength),
    'cache-control': cacheControl,
    'x-content-type-options': 'nosniff',
    'content-disposition': 'inline; filename="og-guide.png"',
  }
}

function buildHardFallbackPngResponse(includeBody) {
  const fallbackBytes = Buffer.from(FALLBACK_TRANSPARENT_PNG_BASE64, 'base64')

  return new Response(includeBody ? fallbackBytes : null, {
    status: 200,
    headers: buildPngHeaders(fallbackBytes.byteLength, 'public, max-age=0, s-maxage=3600, stale-while-revalidate=3600'),
  })
}

async function buildGuideOgResponse(request, context, includeBody = true) {
  try {
    const params = await context.params
    const guideSlug = String(params?.guideSlug || '').trim()

    if (!guideSlug) {
      return buildHardFallbackPngResponse(includeBody)
    }

    const requestUrl = new URL(request.url)
    const userAgent = request.headers.get('user-agent') || 'guide-og-proxy'
    const guidePath = getGuidePath(guideSlug)
    const upstreamUrl = new URL('/api/og', requestUrl.origin)
    upstreamUrl.searchParams.set('g', '1')
    upstreamUrl.searchParams.set('p', guidePath)
    upstreamUrl.searchParams.set('t', titleFromGuideSlug(guideSlug) || 'Guide')
    upstreamUrl.searchParams.set('ogv', 'guide-v9')

    const host = getRequestHost(request)
    const site = await resolveSiteByHost(host)
    const page = await getPageForRequest(site, ['guides', guideSlug])
    if (page) {
      upstreamUrl.searchParams.set('t', page?.seo?.title || page?.title || site?.name || 'Guide')
      if (page?.guideCardColor) upstreamUrl.searchParams.set('b', page.guideCardColor)
      if (page?.guideCategory) upstreamUrl.searchParams.set('c', page.guideCategory)
      if (page?._updatedAt) {
        upstreamUrl.searchParams.set('v', String(new Date(page._updatedAt).getTime() || page._updatedAt))
      }
    }

    let imageResult = await fetchPng(upstreamUrl.toString(), userAgent)

    // If dynamic data lookup fails for any reason, retry with minimal params.
    if (!imageResult) {
      const minimalUrl = new URL('/api/og', requestUrl.origin)
      minimalUrl.searchParams.set('g', '1')
      minimalUrl.searchParams.set('p', guidePath)
      minimalUrl.searchParams.set('t', titleFromGuideSlug(guideSlug) || 'Guide')
      minimalUrl.searchParams.set('ogv', 'guide-v9-min')
      imageResult = await fetchPng(minimalUrl.toString(), userAgent)
    }

    if (!imageResult) {
      return buildHardFallbackPngResponse(includeBody)
    }

    return new Response(includeBody ? imageResult.body : null, {
      status: 200,
      headers: buildPngHeaders(imageResult.body.byteLength, imageResult.cacheControl),
    })
  } catch {
    return buildHardFallbackPngResponse(includeBody)
  }
}

export async function GET(request, context) {
  return buildGuideOgResponse(request, context, true)
}

export async function HEAD(request, context) {
  return buildGuideOgResponse(request, context, false)
}

