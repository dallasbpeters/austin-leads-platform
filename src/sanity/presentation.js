// oxlint-disable func-style
import { defineDocuments, defineLocations } from 'sanity/presentation'

const PAGE_DOCUMENT_FILTER = `_type in ["page", "servicePage", "locationPage", "post"]`

/**
 * Path prefixes that should never be matched against Sanity documents.
 * `_site` guards against the /*path catch-all double-matching /_site/ URLs
 * that are already handled by the dedicated /_site/:site/*path routes.
 */
const INTERNAL_PATH_PREFIXES = new Set(['api', '_next', 'studio', '_site'])

/**
 * Build a Presentation preview path for a tenant page.
 *
 * Studio previews encode the site slug in the URL *path* — not as a query
 * parameter — so that Sanity's document resolver can read it as a route param.
 * (DocumentResolverContext.path strips query strings before the resolver runs.)
 *
 * The app proxy in {@link ../proxy.js} (`trySitePrefixRewrite`) rewrites these paths to the
 * tenant route the frontend renders from.
 *
 *   /_site/tx-christmaslights/services/windows
 *   → (proxy) → /tenant/tx-christmaslights/services/windows
 */
function tenantHref(siteSlug, path = '/') {
  const safePath = path.startsWith('/') ? path : `/${path}`
  if (!siteSlug) {
    return safePath
  }
  return `/_site/${siteSlug}${safePath}`
}

function normalizeJoinedPath(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join('/')
  }

  if (typeof value === 'string') {
    return value.split('/').filter(Boolean).join('/')
  }

  return ''
}

function parsePreviewContext(context) {
  const contextPath = typeof context.path === 'string' ? context.path : '/'
  let siteSlug = context.params?.site ?? context.params?.siteSlug ?? null
  let pagePath = contextPath

  if (contextPath.startsWith('/_site/')) {
    const rest = contextPath.slice('/_site/'.length)
    const slashIndex = rest.indexOf('/')
    const rawSiteSlug = slashIndex === -1 ? rest : rest.slice(0, slashIndex)
    if (!siteSlug && rawSiteSlug) {
      try {
        siteSlug = decodeURIComponent(rawSiteSlug)
      } catch {
        siteSlug = rawSiteSlug
      }
    }
    pagePath = slashIndex === -1 ? '/' : rest.slice(slashIndex) || '/'
  }

  if (contextPath.startsWith('/preview/')) {
    const rest = contextPath.slice('/preview/'.length)
    const slashIndex = rest.indexOf('/')
    const rawSiteSlug = slashIndex === -1 ? rest : rest.slice(0, slashIndex)
    if (!siteSlug && rawSiteSlug) {
      try {
        siteSlug = decodeURIComponent(rawSiteSlug)
      } catch {
        siteSlug = rawSiteSlug
      }
    }
    pagePath = slashIndex === -1 ? '/' : rest.slice(slashIndex) || '/'
  }

  const slugFromParams = normalizeJoinedPath(context.params?.path)
  const slugFromPath = pagePath === '/' ? '' : normalizeJoinedPath(pagePath)

  return {
    siteSlug,
    slug: slugFromParams || slugFromPath,
  }
}

/**
 * Resolve documents for the current Presentation preview URL.
 *
 * For /_site/:site and /_site/:site/*path routes, `context.params.site`
 * carries the site slug as a proper route param — no query-string parsing
 * required. This allows per-site document filtering in the Presentation panel.
 */
function resolveFromAnyPath(context) {
  const { siteSlug, slug } = parsePreviewContext(context)

  // Guard against internal routes being resolved as page documents
  const firstSegment = slug.split('/')[0]
  if (INTERNAL_PATH_PREFIXES.has(firstSegment)) {
    return null
  }

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

/**
 * Case studies are their own document type served from a dedicated route, so they
 * never match {@link PAGE_DOCUMENT_FILTER}. Without this resolver Presentation reports
 * "Missing a main document" on every /projects/<slug> preview.
 *
 * Uses the `:slug` route param rather than the parsed path, since the path here
 * still carries the "projects/" prefix that is not part of the document's slug.
 */
function resolveCaseStudy(context) {
  const { siteSlug } = parsePreviewContext(context)
  const slug = context.params?.slug

  if (!slug) {
    return null
  }

  return {
    filter: `_type == "caseStudy" && slug.current == $slug${siteSlug ? ' && site->slug.current == $siteSlug' : ''}`,
    params: { slug, ...(siteSlug ? { siteSlug } : {}) },
  }
}

export const presentationDocuments = defineDocuments([
  // Case study detail routes come first: the `*path` catch-alls below would
  // otherwise swallow them and search for a page whose slug is "projects/<slug>".
  { route: '/_site/:site/projects/:slug', resolve: resolveCaseStudy },
  { route: '/preview/:siteSlug/projects/:slug', resolve: resolveCaseStudy },
  { route: '/projects/:slug', resolve: resolveCaseStudy },
  // Path-based site routing used by the site switcher navigator.
  // The site slug in /_site/:site becomes a route param so the resolver can filter by site.
  { route: '/_site/:site', resolve: resolveFromAnyPath },
  { route: '/_site/:site/*path', resolve: resolveFromAnyPath },
  { route: '/preview/:siteSlug', resolve: resolveFromAnyPath },
  { route: '/preview/:siteSlug/*path', resolve: resolveFromAnyPath },
  // Direct path routing used when opening a document from Structure.
  { route: '/', resolve: resolveFromAnyPath },
  { route: '/*path', resolve: resolveFromAnyPath },
])

function hrefForDoc(doc) {
  if (doc?.pageType === 'home' || doc?.slug === '/') {
    return '/'
  }
  if (!doc?.slug) {
    return null
  }
  return doc.slug.startsWith('/') ? doc.slug : `/${doc.slug}`
}

const noLocations = {
  locations: [],
  message: 'No frontend locations found for this document.',
  tone: 'caution',
}

export const presentationLocations = {
  /**
   * Clicking a site document in Structure opens that site's homepage in
   * Presentation via /_site/<slug>/ — which the document resolver uses to
   * filter the panel to documents belonging to that site.
   */
  site: defineLocations({
    select: {
      name: 'name',
      primaryDomain: 'primaryDomain',
      siteSlug: 'slug.current',
    },
    resolve: (doc) => {
      if (!doc?.siteSlug) {
        return noLocations
      }

      return {
        locations: [
          {
            title: doc.name || doc.primaryDomain || doc.siteSlug,
            href: tenantHref(doc.siteSlug, '/'),
          },
        ],
      }
    },
  }),
  page: defineLocations({
    select: {
      pageType: 'pageType',
      slug: 'slug.current',
      title: 'title',
    },
    resolve: (doc) => {
      const path = hrefForDoc(doc)
      if (!path) {
        return noLocations
      }

      return {
        locations: [
          {
            title: doc.title || 'Untitled page',
            href: path,
          },
        ],
      }
    },
  }),
  servicePage: defineLocations({
    select: {
      pageType: 'pageType',
      slug: 'slug.current',
      title: 'title',
    },
    resolve: (doc) => {
      const path = hrefForDoc(doc)
      if (!path) {
        return noLocations
      }

      return {
        locations: [
          {
            title: doc.title || 'Untitled service page',
            href: path,
          },
          { title: 'Services', href: '/services' },
        ],
      }
    },
  }),
  locationPage: defineLocations({
    select: {
      pageType: 'pageType',
      slug: 'slug.current',
      title: 'title',
    },
    resolve: (doc) => {
      const path = hrefForDoc(doc)
      if (!path) {
        return noLocations
      }

      return {
        locations: [
          {
            title: doc.title || 'Untitled location page',
            href: path,
          },
        ],
      }
    },
  }),
  post: defineLocations({
    select: {
      pageType: 'pageType',
      slug: 'slug.current',
      title: 'title',
    },
    resolve: (doc) => {
      const path = hrefForDoc(doc)
      if (!path) {
        return noLocations
      }

      return {
        locations: [
          {
            title: doc.title || 'Untitled post',
            href: path,
          },
          { title: 'Guides', href: '/guides' },
        ],
      }
    },
  }),
  /**
   * Reviews have no page of their own. They surface inside any testimonials section —
   * either hand-picked, or implicitly because the section lists every review for the
   * site — so there is no single canonical URL to compute.
   *
   * Deliberately resolved from plain document fields only. A back-reference subquery
   * (`*[references(^._id)]`) in `select` leaves the locations banner stuck on
   * "Resolving locations…", because the Studio evaluates `select` through its own
   * resolver rather than as a free-form GROQ projection.
   */
  review: defineLocations({
    select: {
      author: 'author',
    },
    resolve: (doc) => ({
      locations: [{ title: 'Home', href: '/' }],
      message: doc?.author
        ? `Reviews from ${doc.author} appear in any testimonials section on this site.`
        : 'Reviews appear in any testimonials section on this site.',
    }),
  }),
  /* Crew credits are inline objects on the case study, not documents, so they need
     no location resolver — editing one happens inside the case study's own form. */
  /**
   * Case studies live at /projects/<slug>, with the projects index as the second
   * location so an editor can jump from one job to the list it appears in.
   */
  caseStudy: defineLocations({
    select: {
      slug: 'slug.current',
      title: 'title',
    },
    resolve: (doc) => {
      if (!doc?.slug) {
        return {
          ...noLocations,
          message: 'No page yet. Add a slug to publish this at /projects/<slug>.',
        }
      }

      return {
        locations: [
          {
            title: doc.title || 'Untitled case study',
            href: `/projects/${doc.slug}`,
          },
          { title: 'Projects', href: '/projects' },
        ],
      }
    },
  }),
}
