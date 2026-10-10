import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

import { canQuotesRoleAccessPath, defaultAdminHomePath, isQuotesRole } from '@/lib/auth/roles'
import { resolvePublicRepresentation } from '@/lib/platform/agent-content'
import { getAllSites } from '@/lib/platform/content'
import { getSanityServerClient } from '@/sanity/client'

const protectedPaths = [
  '/dashboard',
  '/reels',
  '/social',
  '/analytics',
  '/crm',
  '/quotes',
  '/clients',
  '/documents',
  '/publish',
  '/domains',
  '/hero-pages',
  '/settings',
  '/christmas',
  '/users',
]
const protectedApiPrefixes = [
  '/api/domains',
  '/api/reels',
  '/api/social',
  '/api/publish-jobs',
  '/api/analytics',
  '/api/crm',
  '/api/quotes',
  '/api/hero-pages',
  '/api/unsplash',
  '/api/launch-checklist',
  '/api/users',
]

/** Operator / API routes. Never rewritten to a tenant, and never reachable through `/_site/`. */
const OPERATOR_SHELL_PREFIXES = [
  '/dashboard',
  '/reels',
  '/social',
  '/analytics',
  '/crm',
  '/quotes',
  '/clients',
  '/documents',
  '/publish',
  '/domains',
  '/hero-pages',
  '/settings',
  '/christmas',
  '/users',
  '/sign-in',
  '/studio',
]

function isOperatorShellPath(pathname) {
  if (!pathname) {
    return false
  }
  if (pathname.startsWith('/api/')) {
    return true
  }
  return OPERATOR_SHELL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathRequiresAuth(pathname) {
  if (!pathname) {
    return false
  }
  return (
    protectedPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    protectedApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  )
}

/**
 * Same policy as `resolveCurrentSite` in `src/lib/platform/site-page.js`:
 * only honour `__site` / `/_site/:slug` when localhost or draft mode (Presentation).
 */
function allowPublicSiteParamOverride(request) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
  const isLocalHost = host.includes('localhost') || host.startsWith('127.0.0.1')
  if (isLocalHost) {
    return true
  }
  return request.cookies.has('__prerender_bypass')
}

/**
 * @returns {{ siteSlug: string, pagePath: string } | null} The tenant and page path, or null for other paths.
 */
function parseSitePrefixRewrite(pathname) {
  const SITE_PREFIX = '/_site/'
  if (!pathname.startsWith(SITE_PREFIX)) {
    return null
  }
  const rest = pathname.slice(SITE_PREFIX.length)
  if (!rest) {
    return null
  }
  const slashIdx = rest.indexOf('/')
  const siteSlugRaw = slashIdx === -1 ? rest : rest.slice(0, slashIdx)
  const pagePath = slashIdx === -1 ? '/' : rest.slice(slashIdx) || '/'
  if (!siteSlugRaw) {
    return null
  }
  let siteSlug
  try {
    siteSlug = decodeURIComponent(siteSlugRaw)
  } catch {
    siteSlug = siteSlugRaw
  }
  return { siteSlug, pagePath }
}

/*
 * ─── Tenant routing ─────────────────────────────────────────────────────────
 * The same pattern as Vercel's Platforms starter: every public page request is
 * rewritten from `example.com/about` to `/tenant/<site-slug>/about`. The pages
 * under `src/app/(site)/tenant/[site]` read the tenant from that route param
 * instead of from request headers, which is what lets them be cached.
 */
const TENANT_PREFIX = '/tenant'
const PRIMARY_SITE_SLUG = 'texas-solar-and-roofing-pros'

/** Paths served by something other than a tenant page. */
const NON_TENANT_PREFIXES = [
  '/api',
  '/ingest',
  '/cards',
  '/sign',
  '/sign-in',
  '/studio',
  '/_next',
  '/.well-known',
  '/robots.txt',
  '/sitemap.xml',
]

/** Files in `public/` (`/logo.png`, `/fonts/x.woff2`, `/llms.txt`) have an extension. */
const FILE_EXTENSION = /\.[a-z0-9]+$/iu

function isTenantPagePath(pathname) {
  if (FILE_EXTENSION.test(pathname)) {
    return false
  }
  if (isOperatorShellPath(pathname) || pathRequiresAuth(pathname)) {
    return false
  }
  return !NON_TENANT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function rewriteToTenant(request, siteSlug, pagePath) {
  const url = request.nextUrl.clone()
  url.pathname = `${TENANT_PREFIX}/${encodeURIComponent(siteSlug)}${pagePath === '/' ? '' : pagePath}`
  url.searchParams.delete('__site')
  return NextResponse.rewrite(url)
}

/*
 * Host → site slug. Sanity is checked first, the same order as
 * `resolveSiteByHost`, because some tenants (Texas Christmas Lights) exist only
 * in Sanity. Answers are kept for five minutes per server instance so the
 * lookup does not run on every request.
 */
const HOST_LOOKUP_TTL_MS = 5 * 60 * 1000
const hostSlugCache = new Map()

async function lookupSiteSlugInSanity(host) {
  const cached = hostSlugCache.get(host)
  if (cached && cached.expires > Date.now()) {
    return cached.slug
  }

  let slug = cached?.slug ?? null
  try {
    const client = getSanityServerClient()
    if (client) {
      slug = await client.fetch(
        '*[_type == "site" && ($host == primaryDomain || $host in aliases)][0].slug.current',
        { host },
      )
    }
  } catch {
    // Keep the last known answer; fall through to the local site list otherwise.
  }

  hostSlugCache.set(host, { slug, expires: Date.now() + HOST_LOOKUP_TTL_MS })
  return slug
}

async function resolveTenantSlug(host) {
  const normalizedHost = normalizeHost(host)
  const sanitySlug = await lookupSiteSlugInSanity(normalizedHost)
  if (sanitySlug) {
    return sanitySlug
  }

  const localSite = getAllSites().find(
    (candidate) => candidate.primaryDomain === normalizedHost || candidate.aliases?.includes(normalizedHost),
  )
  // Preview deployments (*.vercel.app) and unknown hosts serve the primary site,
  // the same fallback `resolveSiteByHost` uses.
  return localSite?.slug ?? PRIMARY_SITE_SLUG
}

/**
 * Sanity Presentation uses `/_site/{slug}/…` so Studio can read `:site` in the
 * preview URL, and `/preview/{slug}/…` is the operator preview link. Both go
 * straight to that tenant's pages.
 *
 * @see `src/sanity/presentation.js`
 */
function trySitePrefixRewrite(request) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/preview/')) {
    const [siteSlug, ...rest] = pathname.slice('/preview/'.length).split('/')
    if (siteSlug) {
      const pagePath = `/${rest.filter(Boolean).join('/')}`
      return rewriteToTenant(request, decodeURIComponent(siteSlug), pagePath)
    }
  }

  const parsed = parseSitePrefixRewrite(pathname)
  if (!parsed) {
    return null
  }

  const { siteSlug, pagePath } = parsed

  if (isOperatorShellPath(pagePath) || pathRequiresAuth(pagePath) || !allowPublicSiteParamOverride(request)) {
    const home = request.nextUrl.clone()
    home.pathname = '/'
    home.search = ''
    return NextResponse.redirect(home)
  }

  return rewriteToTenant(request, siteSlug, pagePath)
}

/*
 * ─── Agent representations ──────────────────────────────────────────────────
 * The same public URL has three bodies, chosen from the request headers:
 * the designed page for browsers, Markdown for clients that prefer
 * `text/markdown`, and a lightweight HTML document for non-browser HTML
 * clients. The last two live under `/agent/<format>/<site>/…` route handlers,
 * which are internal: a direct request to `/agent/…` is a tenant page path and
 * 404s, so the only way in is this rewrite. Every variant carries
 * `Vary: Accept` so shared caches keep them apart.
 *
 * @see `src/lib/platform/agent-content.js`
 */
const AGENT_ROUTE_PREFIX = '/agent'

function rewriteToAgentRoute(request, siteSlug, pagePath, format) {
  const url = request.nextUrl.clone()
  url.pathname = `${AGENT_ROUTE_PREFIX}/${format}/${encodeURIComponent(siteSlug)}${pagePath === '/' ? '' : pagePath}`
  url.searchParams.delete('__site')
  const response = NextResponse.rewrite(url)
  response.headers.set('Vary', 'Accept')
  return response
}

async function rewritePublicRequest(request) {
  const { nextUrl } = request
  const override = allowPublicSiteParamOverride(request) ? nextUrl.searchParams.get('__site')?.trim() : null
  const siteSlug =
    override ||
    (await resolveTenantSlug(request.headers.get('x-forwarded-host') || request.headers.get('host')))

  const representation = resolvePublicRepresentation({
    method: request.method,
    getHeader: (name) => request.headers.get(name),
  })

  if (representation === 'markdown') {
    return rewriteToAgentRoute(request, siteSlug, nextUrl.pathname, 'markdown')
  }
  if (representation === 'lightweight-html') {
    return rewriteToAgentRoute(request, siteSlug, nextUrl.pathname, 'html')
  }

  const response = rewriteToTenant(request, siteSlug, nextUrl.pathname)
  response.headers.set('Vary', 'Accept')
  return response
}

function normalizeHost(host) {
  return (host || '').replace(/:\d+$/, '').toLowerCase()
}

function getRedirectSite(host) {
  const normalizedHost = normalizeHost(host)
  return getAllSites().find(
    (candidate) =>
      candidate.tier === 'redirect' &&
      (candidate.primaryDomain === normalizedHost || candidate.aliases?.includes(normalizedHost)),
  )
}

/**
 * Auth.js names the session cookie `__Secure-authjs.session-token` on HTTPS.
 * `getToken` defaults `secureCookie` to false (looks for `authjs.session-token`),
 * so production proxies must pass secureCookie or they always see logged-out.
 */
function requestUsesSecureAuthCookie(request) {
  if (request.nextUrl.protocol === 'https:') {
    return true
  }
  const forwarded = request.headers.get('x-forwarded-proto')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() === 'https'
  }
  return false
}

async function getSessionToken(request) {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    return null
  }
  const secureCookie = requestUsesSecureAuthCookie(request)
  return getToken({ req: request, secret, secureCookie }).catch(() => null)
}

/*
 * Next.js proxy (formerly middleware). No `auth()` wrapper — it rebuilds the Response
 * and would drop request-header mutations. Auth uses `getToken` from `next-auth/jwt`.
 */
export async function proxy(request) {
  const { nextUrl } = request
  const { pathname } = nextUrl

  const token = await getSessionToken(request)
  const isLoggedIn = Boolean(token)

  const redirectSite = getRedirectSite(request.headers.get('x-forwarded-host') || request.headers.get('host'))

  if (redirectSite?.redirectTarget) {
    const url = nextUrl.clone()
    url.protocol = 'https:'
    url.hostname =
      getAllSites().find((candidate) => candidate.slug === redirectSite.redirectTarget)?.primaryDomain ||
      redirectSite.redirectTarget
    url.port = ''

    return NextResponse.redirect(url, 308)
  }

  if (pathname === '/sign-in' && isLoggedIn) {
    return NextResponse.redirect(new URL(defaultAdminHomePath(token?.role), nextUrl))
  }

  const siteRewrite = trySitePrefixRewrite(request)
  if (siteRewrite) {
    return siteRewrite
  }

  if (isTenantPagePath(pathname)) {
    return rewritePublicRequest(request)
  }

  if (!pathRequiresAuth(pathname)) {
    return NextResponse.next()
  }

  if (isLoggedIn) {
    if (isQuotesRole(token?.role) && !canQuotesRoleAccessPath(pathname)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/quotes', nextUrl))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const signInUrl = new URL('/sign-in', nextUrl)
  const callbackUrl = `${pathname}${nextUrl.search}`
  signInUrl.searchParams.set('callbackUrl', callbackUrl)

  return NextResponse.redirect(signInUrl)
}

/*
 * Prefetch requests must run the proxy too: a prefetched public link that skips
 * the tenant rewrite would load a path with no page behind it.
 */
export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}
