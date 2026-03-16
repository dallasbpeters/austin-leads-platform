import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import { frontendOriginAllowlist, localFrontendUrl } from '@/sanity/env'

function buildAllowedOrigins(requestUrl) {
  const requestOrigin = new URL(requestUrl).origin
  return new Set([requestOrigin, localFrontendUrl, ...frontendOriginAllowlist].filter(Boolean))
}

function resolveRedirectPath(requestUrl) {
  const allowedOrigins = buildAllowedOrigins(requestUrl)
  const params = new URL(requestUrl).searchParams
  const candidates = [
    params.get('redirect'),
    params.get('redirectTo'),
    params.get('url'),
    params.get('pathname'),
    params.get('path'),
    params.get('slug'),
  ]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    // Allow absolute URLs for known frontend origins; otherwise require a root-relative path.
    try {
      const asUrl = new URL(candidate, requestUrl)
      if (allowedOrigins.has(asUrl.origin)) {
        return `${asUrl.pathname}${asUrl.search}${asUrl.hash}`
      }
    } catch {}

    if (candidate.startsWith('/')) {
      return candidate
    }
  }

  return '/'
}

export async function GET(request) {
  const draft = await draftMode()
  draft.enable()

  const redirectTo = resolveRedirectPath(request.url)
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
