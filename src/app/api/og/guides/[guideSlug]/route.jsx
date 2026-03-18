import { getPageForRequest, resolveSiteByHost } from '@/lib/platform/content'

export const runtime = 'nodejs'

function getRequestHost(request) {
  return request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
}

function getGuidePath(slug) {
  return `/guides/${String(slug || '').replace(/^\/+/, '')}`
}

async function buildGuideOgResponse(request, context, includeBody = true) {
  const params = await context.params
  const guideSlug = String(params?.guideSlug || '').trim()

  if (!guideSlug) {
    return new Response('Guide slug is required.', { status: 400 })
  }

  const requestUrl = new URL(request.url)
  const host = getRequestHost(request)
  const site = await resolveSiteByHost(host)
  const page = await getPageForRequest(site, ['guides', guideSlug])

  if (!page) {
    return new Response('Guide not found.', { status: 404 })
  }

  const upstreamUrl = new URL('/api/og', requestUrl.origin)
  upstreamUrl.searchParams.set('g', '1')
  upstreamUrl.searchParams.set('p', getGuidePath(guideSlug))
  upstreamUrl.searchParams.set('t', page?.seo?.title || page?.title || site?.name || 'Guide')
  if (page?.guideCardColor) upstreamUrl.searchParams.set('b', page.guideCardColor)
  if (page?.guideCategory) upstreamUrl.searchParams.set('c', page.guideCategory)
  if (page?._updatedAt) {
    upstreamUrl.searchParams.set('v', String(new Date(page._updatedAt).getTime() || page._updatedAt))
  }
  upstreamUrl.searchParams.set('ogv', 'guide-v8')

  const upstreamResponse = await fetch(upstreamUrl.toString(), {
    headers: {
      'user-agent': request.headers.get('user-agent') || 'guide-og-proxy',
    },
  })

  const pngBuffer = await upstreamResponse.arrayBuffer()
  const headers = {
    'content-type': upstreamResponse.headers.get('content-type') || 'image/png',
    'content-length': String(pngBuffer.byteLength),
    'cache-control':
      upstreamResponse.headers.get('cache-control') ||
      'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    'x-content-type-options': 'nosniff',
    'content-disposition': 'inline; filename="og-guide.png"',
  }

  return new Response(includeBody ? pngBuffer : null, {
    status: upstreamResponse.status,
    headers,
  })
}

export async function GET(request, context) {
  return buildGuideOgResponse(request, context, true)
}

export async function HEAD(request, context) {
  // Return the same computed response so platforms can infer consistent headers.
  // Next.js strips the body for HEAD automatically.
  return buildGuideOgResponse(request, context, true)
}

