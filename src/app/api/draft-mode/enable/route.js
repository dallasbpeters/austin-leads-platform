import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

function resolveRedirectPath(requestUrl) {
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

    // Accept absolute URLs only when same-origin, otherwise require a root-relative path.
    try {
      const asUrl = new URL(candidate, requestUrl)
      const requestOrigin = new URL(requestUrl).origin
      if (asUrl.origin === requestOrigin) {
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
