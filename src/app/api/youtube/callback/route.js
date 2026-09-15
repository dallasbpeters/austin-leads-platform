import { NextResponse } from 'next/server'

import { hasYoutubeDatabase, oauthClient, redirectUri, saveRefreshToken } from '@/lib/platform/youtube-db'

export const runtime = 'nodejs'

/*
 * Where Google sends the channel owner back. Deliberately NOT admin-guarded:
 * the caller here is Google, carrying a one-time code that is worthless without
 * the client secret. Guarding it would break the redirect.
 *
 * The refresh token goes to Postgres, not an env var — it is minted at runtime
 * and env vars are build-time.
 */
export async function GET(request) {
  const params = new URL(request.url).searchParams
  const error = params.get('error')
  const code = params.get('code')

  if (error) {
    return html(`Consent was declined or failed: ${escapeHtml(error)}`, 400)
  }
  if (!code) {
    return html('No authorization code was returned.', 400)
  }

  const client = oauthClient()
  if (!client) {
    return html('No OAuth client is configured on this deployment.', 503)
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: client.id,
      client_secret: client.secret,
      redirect_uri: redirectUri(request),
      grant_type: 'authorization_code',
    }).toString(),
  })
  const payload = await res.json().catch(() => ({}))

  if (!payload.refresh_token) {
    const detail = payload.error_description || payload.error || 'no refresh_token returned'
    return html(
      `Could not complete consent: ${escapeHtml(detail)}` +
        '<p>redirect_uri_mismatch means this callback URL is not registered on the OAuth client.</p>',
      400,
    )
  }

  let channelEmail = null
  try {
    const who = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    const identity = await who.json()
    channelEmail = identity?.email ?? null
  } catch {
    /* Identity is a nicety for the operator, not a requirement. */
  }

  if (!hasYoutubeDatabase()) {
    /* No database: fall back to showing the token once so it can be pasted into
       Vercel env. Better than failing, worse than storing it. */
    return html(
      'No database is configured, so the token could not be stored.' +
        `<p>Add this to your environment:</p><pre>YOUTUBE_REFRESH_TOKEN=${escapeHtml(payload.refresh_token)}</pre>`,
      200,
    )
  }

  await saveRefreshToken({
    refreshToken: payload.refresh_token,
    channelEmail,
    scope: payload.scope,
  })

  return html(
    `Connected${channelEmail ? ` as ${escapeHtml(channelEmail)}` : ''}. Uploads can run unattended now — you can close this tab.`,
    200,
  )
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function html(body, status) {
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>YouTube</title>` +
      `<body style="font:16px/1.5 system-ui;padding:3rem;max-width:44rem;background:#040a17;color:#fffcf5">` +
      `<p>${body}</p></body>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}
