import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import { frontendOriginAllowlist, localFrontendUrl } from '@/sanity/env'

function resolveRedirectPath(requestUrl) {
  const allowedOrigins = new Set([new URL(requestUrl).origin, localFrontendUrl, ...frontendOriginAllowlist].filter(Boolean))
  const candidate = new URL(requestUrl).searchParams.get('redirect')

  if (!candidate) {
    return '/'
  }

  try {
    const asUrl = new URL(candidate, requestUrl)
    if (allowedOrigins.has(asUrl.origin)) {
      return `${asUrl.pathname}${asUrl.search}${asUrl.hash}`
    }
  } catch {}

  if (candidate.startsWith('/')) {
    return candidate
  }

  return '/'
}

export async function GET(request) {
  const redirectTo = resolveRedirectPath(request.url)
  const draft = await draftMode()

  draft.disable()

  return NextResponse.redirect(new URL(redirectTo, request.url))
}
