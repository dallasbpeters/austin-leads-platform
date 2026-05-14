import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { getAllSites } from './src/lib/platform/content'

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
  if (!pathname) return false
  if (pathname.startsWith('/api/')) return true
  return OPERATOR_SHELL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/**
 * Same policy as {@link src/lib/platform/site-page.js} `resolveCurrentSite(searchParams)`:
 * only honour `__site` / `/_site/:slug` for theme + RSC when localhost or draft mode.
 */
function allowPublicSiteParamOverride(request) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
  const isLocalHost = host.includes('localhost') || host.startsWith('127.0.0.1')
  if (isLocalHost) return true
  return request.cookies.has('__prerender_bypass')
}

function nextWithAlpHeaders(request) {
  const requestHeaders = new Headers(request.headers)
  const pathname = request.nextUrl.pathname
  const url = request.nextUrl

  if (isOperatorShellPath(pathname)) {
    requestHeaders.set('x-alp-operator-shell', '1')
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  let previewSlug = null

  if (pathname.startsWith('/_site/')) {
    const raw = pathname.slice('/_site/'.length).split('/').filter(Boolean)[0]
    if (raw && allowPublicSiteParamOverride(request)) {
      try {
        previewSlug = decodeURIComponent(raw)
      } catch {
        previewSlug = raw
      }
    }
  }

  if (!previewSlug && pathname.startsWith('/preview/')) {
    const parts = pathname.split('/').filter(Boolean)
    if (parts[0] === 'preview' && parts[1]) {
      previewSlug = parts[1]
    }
  }

  if (!previewSlug && allowPublicSiteParamOverride(request)) {
    const q = url.searchParams.get('__site')?.trim()
    if (q) previewSlug = q
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
 * Plain Next middleware (no `auth()` wrapper from next-auth). The wrapper rebuilds
 * the Response and would drop any request-header mutations we make here. Auth check
 * is done directly via `getToken` from `next-auth/jwt`.
 */
export default async function middleware(request) {
  const { nextUrl } = request
  const pathname = nextUrl.pathname

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

  const requiresAuth =
    protectedPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    protectedApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

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
