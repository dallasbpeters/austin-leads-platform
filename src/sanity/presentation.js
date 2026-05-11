import { defineDocuments, defineLocations } from 'sanity/presentation'

const PAGE_DOCUMENT_FILTER = `_type in ["page", "servicePage", "locationPage", "post"]`

/**
 * Path prefixes that should never be matched against Sanity documents.
 * `_site` guards against the /:path* catch-all double-matching /_site/ URLs
 * that are already handled by the dedicated /_site/:site/:path* routes.
 */
const INTERNAL_PATH_PREFIXES = ['api', '_next', 'studio', '_site']

/**
 * Build a Presentation preview path for a tenant page.
 *
 * Studio previews encode the site slug in the URL *path* — not as a query
 * parameter — so that Sanity's document resolver can read it as a route param.
 * (DocumentResolverContext.path strips query strings before the resolver runs.)
 *
 * The Next.js proxy at src/proxy.js rewrites these paths back to the
 * standard /?__site=<slug> format that the frontend renderer expects.
 *
 *   /_site/tx-christmaslights/services/windows
 *   → (middleware) → /services/windows?__site=tx-christmaslights
 */
function tenantHref(siteSlug, path = '/') {
  const safePath = path.startsWith('/') ? path : `/${path}`
  if (!siteSlug) return safePath
  return `/_site/${siteSlug}${safePath}`
}

/**
 * Extract the site slug from a Sanity site reference.
 * Site documents are always created with _id = "site-{slug}".
 */
function slugFromSiteRef(ref) {
  if (!ref) return null
  const id = typeof ref === 'string' ? ref : ref._ref
  return id?.startsWith('site-') ? id.slice('site-'.length) : null
}

/**
 * Resolve documents for the current Presentation preview URL.
 *
 * For /_site/:site and /_site/:site/:path* routes, `context.params.site`
 * carries the site slug as a proper route param — no query-string parsing
 * required. This allows per-site document filtering in the Presentation panel.
 */
function resolveFromAnyPath(context) {
  const siteSlug = context.params?.site ?? null

  // Page path comes from the /:path* wildcard segment
  const rawPath = context.params?.path
  let slug = ''
  if (typeof rawPath === 'string' && rawPath.length) {
    slug = rawPath.split('/').filter(Boolean).join('/')
  } else if (Array.isArray(rawPath)) {
    slug = rawPath.filter(Boolean).join('/')
  }

  // Guard against internal routes being resolved as page documents
  const firstSegment = slug.split('/')[0]
  if (INTERNAL_PATH_PREFIXES.includes(firstSegment)) return null

  const siteFilter = siteSlug ? ` && site->slug.current == $siteSlug` : ''
  const siteParams = siteSlug ? { siteSlug } : {}

  if (!slug) {
    return {
      filter: `${PAGE_DOCUMENT_FILTER} && (pageType == "home" || slug.current == "/")${siteFilter}`,
      params: siteParams,
    }
  }

  return {
    filter: `${PAGE_DOCUMENT_FILTER} && slug.current == $slug${siteFilter}`,
    params: { slug, ...siteParams },
  }
}

export const presentationDocuments = defineDocuments([
  // Path-based site routing used by the site switcher navigator.
  // The site slug in /_site/:site becomes a route param so the resolver can filter by site.
  { route: '/_site/:site', resolve: resolveFromAnyPath },
  { route: '/_site/:site/:path*', resolve: resolveFromAnyPath },
  // Direct path routing used when opening a document from Structure.
  { route: '/', resolve: resolveFromAnyPath },
  { route: '/:path*', resolve: resolveFromAnyPath },
])

function hrefForDoc(doc) {
  if (!doc?.slug) return null
  if (doc.pageType === 'home' || doc.slug === '/') return '/'
  return doc.slug.startsWith('/') ? doc.slug : `/${doc.slug}`
}

export const presentationLocations = {
  /**
   * Clicking a site document in Structure opens that site's homepage in
   * Presentation via /_site/<slug>/ — which the document resolver uses to
   * filter the panel to documents belonging to that site.
   */
  site: defineLocations({
    select: { name: 'name', slug: 'slug.current', primaryDomain: 'primaryDomain' },
    resolve: (doc) => {
      const siteSlug = doc?.slug
      if (!siteSlug) return null
      return {
        locations: [
          {
            title: doc.name || doc.primaryDomain || siteSlug,
            href: tenantHref(siteSlug, '/'),
          },
        ],
      }
    },
  }),
  page: defineLocations({
    select: { title: 'title', slug: 'slug.current', pageType: 'pageType', siteRef: 'site' },
    resolve: (doc) => {
      const path = hrefForDoc(doc)
      if (!path) return null
      return {
        locations: [
          { title: doc.title || 'Untitled page', href: tenantHref(slugFromSiteRef(doc.siteRef), path) },
        ],
      }
    },
  }),
  servicePage: defineLocations({
    select: { title: 'title', slug: 'slug.current', pageType: 'pageType', siteRef: 'site' },
    resolve: (doc) => {
      const path = hrefForDoc(doc)
      if (!path) return null
      const siteSlug = slugFromSiteRef(doc.siteRef)
      return {
        locations: [
          { title: doc.title || 'Untitled service page', href: tenantHref(siteSlug, path) },
          { title: 'Services', href: tenantHref(siteSlug, '/services') },
        ],
      }
    },
  }),
  locationPage: defineLocations({
    select: { title: 'title', slug: 'slug.current', pageType: 'pageType', siteRef: 'site' },
    resolve: (doc) => {
      const path = hrefForDoc(doc)
      if (!path) return null
      return {
        locations: [
          {
            title: doc.title || 'Untitled location page',
            href: tenantHref(slugFromSiteRef(doc.siteRef), path),
          },
        ],
      }
    },
  }),
  post: defineLocations({
    select: { title: 'title', slug: 'slug.current', pageType: 'pageType', siteRef: 'site' },
    resolve: (doc) => {
      const path = hrefForDoc(doc)
      if (!path) return null
      const siteSlug = slugFromSiteRef(doc.siteRef)
      return {
        locations: [
          { title: doc.title || 'Untitled post', href: tenantHref(siteSlug, path) },
          { title: 'Guides', href: tenantHref(siteSlug, '/guides') },
        ],
      }
    },
  }),
}
