import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { oauthClient, redirectUri } from '@/lib/platform/youtube-db'

export const runtime = 'nodejs'

const SCOPE = 'https://www.googleapis.com/auth/youtube.upload'

/*
 * Starts YouTube consent. Admin-only: this grants the deployment the ability to
 * post to a channel, so it is not something a visitor can trigger.
 *
 * Replaces the localhost listener in scripts/youtube-auth.mjs. That script still
 * works for a developer, but the channel owner is usually not a developer — this
 * is a URL they can open.
 */
export async function GET(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  const client = oauthClient()
  if (!client) {
    return NextResponse.json(
      {
        error: 'No OAuth client configured',
        detail:
          'Set GOOGLE_OAUTH_CLIENT_ID/SECRET, or reuse GOOGLE_BUSINESS_CLIENT_ID/SECRET — that client is already in the same Google Cloud project.',
      },
      { status: 503 },
    )
  }

  const redirect = redirectUri(request)
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', client.id)
  url.searchParams.set('redirect_uri', redirect)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', SCOPE)
  url.searchParams.set('access_type', 'offline')
  /* Without this Google returns no refresh_token on a repeat consent. */
  url.searchParams.set('prompt', 'consent')

  /* ?json=1 returns the URL instead of bouncing, so the redirect URI that needs
     registering can be read without going through the whole flow. */
  if (new URL(request.url).searchParams.get('json')) {
    return NextResponse.json({ authUrl: url.toString(), redirectUri: redirect })
  }

  return NextResponse.redirect(url.toString())
}
