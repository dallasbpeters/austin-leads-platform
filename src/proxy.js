import { NextResponse } from 'next/server'

/**
 * Sanity Presentation encodes the active site in the preview path as
 * /_site/{siteSlug}/{page-path} so that Presentation's document resolver can
 * read the site slug as a route param (query strings are stripped before the
 * resolver runs).
 *
 * This middleware rewrites those paths back to the standard multi-tenant
 * format that the Next.js page renderer expects:
 *   /_site/tx-christmaslights/services/windows
 *   → /services/windows?__site=tx-christmaslights
 */
export function proxy(request) {
  const { pathname } = request.nextUrl

  const SITE_PREFIX = '/_site/'
  if (!pathname.startsWith(SITE_PREFIX)) return NextResponse.next()

  const rest = pathname.slice(SITE_PREFIX.length)
  const slashIdx = rest.indexOf('/')
  const siteSlug = slashIdx === -1 ? rest : rest.slice(0, slashIdx)
  const pagePath = slashIdx === -1 ? '/' : rest.slice(slashIdx) || '/'

  if (!siteSlug) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = pagePath
  url.searchParams.set('__site', siteSlug)

  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/_site/:path*'],
}
