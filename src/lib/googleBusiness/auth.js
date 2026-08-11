/*
 * OAuth for the Google Business Profile API.
 *
 * Reviews are private, per-account data, so Google rejects API keys outright:
 * "API keys are not supported by this API. Expected OAuth2 access token."
 * A refresh token belonging to an owner/manager of the profile is required.
 *
 * Unlike Jobber (see src/lib/jobber/auth.js), Google does not rotate refresh
 * tokens on use, so the token lives in an env var and needs no database table.
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

/** Refreshed access tokens last an hour; renew a minute early to avoid races. */
const EXPIRY_SKEW_MS = 60_000

let cachedToken = null

function readCredentials() {
  return {
    clientId: (process.env.GOOGLE_BUSINESS_CLIENT_ID || '').trim(),
    clientSecret: (process.env.GOOGLE_BUSINESS_CLIENT_SECRET || '').trim(),
    refreshToken: (process.env.GOOGLE_BUSINESS_REFRESH_TOKEN || '').trim(),
  }
}

/**
 * True when all three OAuth values are present. Callers should check this and
 * skip cleanly rather than throwing, so a missing refresh token during the
 * approval wait never breaks a page render or a cron run.
 */
export function hasGoogleBusinessCredentials() {
  const { clientId, clientSecret, refreshToken } = readCredentials()
  return Boolean(clientId && clientSecret && refreshToken)
}

/** Human-readable reason the integration is not usable yet, or null when it is. */
export function describeGoogleBusinessCredentialGap() {
  const { clientId, clientSecret, refreshToken } = readCredentials()
  const missing = [
    !clientId && 'GOOGLE_BUSINESS_CLIENT_ID',
    !clientSecret && 'GOOGLE_BUSINESS_CLIENT_SECRET',
    !refreshToken && 'GOOGLE_BUSINESS_REFRESH_TOKEN',
  ].filter(Boolean)

  if (missing.length === 0) {
    return null
  }

  return `Missing ${missing.join(', ')}. Generate a refresh token at https://developers.google.com/oauthplayground/ using scope https://www.googleapis.com/auth/business.manage, signed in as an owner of the Business Profile.`
}

export async function getGoogleBusinessAccessToken() {
  const gap = describeGoogleBusinessCredentialGap()
  if (gap) {
    throw new Error(`[googleBusiness] ${gap}`)
  }

  if (cachedToken && cachedToken.expiresAt - EXPIRY_SKEW_MS > Date.now()) {
    return cachedToken.accessToken
  }

  const { clientId, clientSecret, refreshToken } = readCredentials()

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    // `invalid_grant` almost always means the refresh token was revoked, or was
    // issued for a different client id than the one configured here.
    throw new Error(
      `[googleBusiness] Token refresh failed (${response.status}): ${payload.error || 'unknown'} ${payload.error_description || ''}`.trim(),
    )
  }

  cachedToken = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000,
  }

  return cachedToken.accessToken
}

/** Authenticated GET against any Business Profile endpoint. */
export async function googleBusinessGet(url) {
  const accessToken = await getGoogleBusinessAccessToken()

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = payload?.error?.message || response.statusText
    // A zero quota is the normal pre-approval state and worth naming explicitly,
    // since the raw message ("Requests to this API ... are blocked") is cryptic.
    const hint =
      response.status === 403 && /quota|blocked|disabled/i.test(message)
        ? ' — this usually means the project has not been granted Business Profile API quota yet (should read 300 QPM once approved).'
        : ''
    throw new Error(`[googleBusiness] GET ${url} failed (${response.status}): ${message}${hint}`)
  }

  return payload
}
