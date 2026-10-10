/*
 * Server-side loader behind the `/agent/markdown` and `/agent/html` route
 * handlers (see `src/proxy.js`). Reads the same tenant and page content the
 * designed pages render, then hands an outline to the pure renderers in
 * `agent-content.js`.
 */
import {
  buildNotFoundOutline,
  buildPageOutline,
  HTML_CONTENT_TYPE,
  MARKDOWN_CONTENT_TYPE,
  renderOutlineHtml,
  renderOutlineMarkdown,
} from '@/lib/platform/agent-content'
import {
  createJsonLd,
  getPageForRequest,
  getPrimaryUrl,
  getSiteBySlug,
  resolveNavigationForSite,
  resolveSiteBySlug,
  resolveSiteOrganization,
} from '@/lib/platform/content'

const PRIMARY_SITE_SLUG = 'texas-solar-and-roofing-pros'

/** Same rule as `isIndexableDeployment` in `site-page.js`: only production is indexed. */
function isIndexableDeployment() {
  return process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === 'production'
}

function resolveRobotsDirective(site, page) {
  const noIndex = !isIndexableDeployment() || page?.seo?.noIndex === true || site?.seo?.noIndex === true
  return noIndex ? 'noindex, nofollow' : 'index, follow'
}

function resolveOgImage(site, page, pathname) {
  if (page?.seo?.ogImage) {
    return page.seo.ogImage
  }
  if (site?.seo?.ogImage) {
    return site.seo.ogImage
  }
  const url = new URL(getPrimaryUrl(site, '/api/og'))
  url.searchParams.set('site', site.name)
  url.searchParams.set('title', page?.seo?.title || page?.title || site.name)
  if (pathname && pathname !== '/') {
    url.searchParams.set('path', pathname)
  }
  return url.toString()
}

function toPathname(slugParts) {
  const parts = (Array.isArray(slugParts) ? slugParts : [])
    .map((part) => String(part || '').trim())
    .filter(Boolean)
  return parts.length > 0 ? `/${parts.join('/')}` : '/'
}

/**
 * Resolve the page behind an agent request.
 *
 * @param {string} siteSlug - Tenant slug from the rewritten route.
 * @param {string[]} slugParts - Page path segments.
 * @returns {Promise<{ status: 200 | 404, outline: object, site: object, origin: string, jsonLd: object | null, meta: { ogImage?: string, robots: string, siteName: string } }>}
 */
export async function loadAgentPage(siteSlug, slugParts = []) {
  const pathname = toPathname(slugParts)
  const site = (await resolveSiteBySlug(siteSlug).catch(() => null)) ?? getSiteBySlug(PRIMARY_SITE_SLUG)
  const origin = getPrimaryUrl(site, '/').replace(/\/$/, '')
  const identity = resolveSiteOrganization(site)

  const page = await getPageForRequest(site, slugParts).catch(() => null)

  if (!page) {
    return {
      status: 404,
      outline: buildNotFoundOutline(site, pathname, identity),
      site,
      origin,
      jsonLd: null,
      meta: { robots: 'noindex, nofollow', siteName: site.name },
    }
  }

  const canonicalUrl = page?.seo?.canonicalUrl || getPrimaryUrl(site, pathname)

  return {
    status: 200,
    outline: buildPageOutline({
      site,
      page,
      pathname,
      navigation: resolveNavigationForSite(site),
      identity,
      canonicalUrl,
    }),
    site,
    origin,
    jsonLd: createJsonLd(site, page, pathname),
    meta: {
      ogImage: resolveOgImage(site, page, pathname),
      robots: resolveRobotsDirective(site, page),
      siteName: site.name,
    },
  }
}

function buildHeaders(contentType, loaded) {
  const headers = new Headers({
    'Content-Type': contentType,
    Vary: 'Accept',
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    'X-Content-Type-Options': 'nosniff',
  })
  if (loaded.status === 404) {
    headers.set('X-Robots-Tag', 'noindex')
    headers.set('Cache-Control', 'public, max-age=0, s-maxage=60')
  } else if (loaded.outline.canonicalUrl) {
    headers.set('Link', `<${loaded.outline.canonicalUrl}>; rel="canonical"`)
  }
  return headers
}

/**
 * Markdown response for a public page, or a Markdown 404 with recovery links.
 *
 * @param {string} siteSlug
 * @param {string[]} slugParts
 */
export async function createMarkdownResponse(siteSlug, slugParts = []) {
  const loaded = await loadAgentPage(siteSlug, slugParts)
  const body = renderOutlineMarkdown(loaded.outline, { origin: loaded.origin })
  return new Response(body, { status: loaded.status, headers: buildHeaders(MARKDOWN_CONTENT_TYPE, loaded) })
}

/**
 * Lightweight HTML response for non-browser HTML clients, or an HTML 404.
 *
 * @param {string} siteSlug
 * @param {string[]} slugParts
 */
export async function createLightweightHtmlResponse(siteSlug, slugParts = []) {
  const loaded = await loadAgentPage(siteSlug, slugParts)
  const body = renderOutlineHtml(loaded.outline, {
    origin: loaded.origin,
    jsonLd: loaded.jsonLd,
    meta: loaded.meta,
  })
  return new Response(body, { status: loaded.status, headers: buildHeaders(HTML_CONTENT_TYPE, loaded) })
}
