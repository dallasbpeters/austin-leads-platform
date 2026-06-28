import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

import { getAllSites } from '@/lib/platform/content'

const protectedPaths = [
  '/dashboard',
  '/analytics',
  '/crm',
  '/publish',
  '/domains',
  '/hero-pages',
  '/settings',
  '/christmas',
  '/users',
]
const protectedApiPrefixes = [
  '/api/domains',
  '/api/publish-jobs',
  '/api/analytics',
  '/api/crm',
  '/api/hero-pages',
  '/api/unsplash',
  '/api/launch-checklist',
  '/api/users',
]

/** Routes that must not set `data-public-site` on `<html>` (operator / API). */
const OPERATOR_SHELL_PREFIXES = [
  '/dashboard',
  '/analytics',
  '/crm',
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
 * @returns {{ siteSlug: string, pagePath: string } | null}
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

/**
 * Sanity Presentation uses `/_site/{slug}/…` so Studio can read `:site` in the preview URL.
 * Rewrites to `pagePath?__site=` for the public catch-all and sets `x-alp-preview-site-slug`
 * for `data-public-site` in `src/app/layout.jsx`.
 *
 * @see `src/sanity/presentation.js`
 */
function trySitePrefixRewrite(request) {
  const { pathname } = request.nextUrl
  const parsed = parseSitePrefixRewrite(pathname)
  if (!parsed) {
    return null
  }

  const { siteSlug, pagePath } = parsed

  if (isOperatorShellPath(pagePath) || pathRequiresAuth(pagePath)) {
    const home = request.nextUrl.clone()
    home.pathname = '/'
    home.search = ''
    return NextResponse.redirect(home)
  }

  if (!allowPublicSiteParamOverride(request)) {
    const home = request.nextUrl.clone()
    home.pathname = '/'
    home.search = ''
    return NextResponse.redirect(home)
  }

  const url = request.nextUrl.clone()
  url.pathname = pagePath
  if (!url.searchParams.has('__site')) {
    url.searchParams.set('__site', siteSlug)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-alp-preview-site-slug', siteSlug)

  return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
}

function nextWithAlpHeaders(request) {
  const requestHeaders = new Headers(request.headers)
  const { pathname } = request.nextUrl
  const url = request.nextUrl

  if (isOperatorShellPath(pathname)) {
    requestHeaders.set('x-alp-operator-shell', '1')
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  let previewSlug = null

  if (pathname.startsWith('/preview/')) {
    const parts = pathname.split('/').filter(Boolean)
    if (parts[0] === 'preview' && parts[1]) {
      previewSlug = parts[1]
    }
  }

  if (!previewSlug && allowPublicSiteParamOverride(request)) {
    const q = url.searchParams.get('__site')?.trim()
    if (q) {
      previewSlug = q
    }
  }

  if (previewSlug) {
    requestHeaders.set('x-alp-preview-site-slug', previewSlug)
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
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

/*
 * Next.js proxy (formerly middleware). No `auth()` wrapper — it rebuilds the Response
 * and would drop request-header mutations. Auth uses `getToken` from `next-auth/jwt`.
 */
export async function proxy(request) {
  const { nextUrl } = request
  const { pathname } = nextUrl

  const secret = process.env.AUTH_SECRET
  let token = null
  if (secret) {
    token = await getToken({ req: request, secret }).catch(() => null)
  }
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
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  const siteRewrite = trySitePrefixRewrite(request)
  if (siteRewrite) {
    return siteRewrite
  }

  const requiresAuth = pathRequiresAuth(pathname)

  if (!requiresAuth) {
    return nextWithAlpHeaders(request)
  }

  if (isLoggedIn) {
    return nextWithAlpHeaders(request)
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const signInUrl = new URL('/sign-in', nextUrl)
  const callbackUrl = `${pathname}${nextUrl.search}`
  signInUrl.searchParams.set('callbackUrl', callbackUrl)

  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
  missing: [
    {
      type: 'header',
      key: 'next-router-prefetch',
    },
    {
      type: 'header',
      key: 'purpose',
      value: 'prefetch',
    },
  ],
}
