/*
 * Per-user Zoho OAuth tokens (from NextAuth Zoho sign-in).
 * Used for CRM contact search — never for the shared Sheet/WorkDrive client.
 */

import { getToken } from 'next-auth/jwt'

const zohoClientId = () => process.env.AUTH_ZOHO_ID || process.env.ZOHO_CLIENT_ID
const zohoClientSecret = () => process.env.AUTH_ZOHO_SECRET || process.env.ZOHO_CLIENT_SECRET
const zohoAccountsUrl = () =>
  (process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com').replace(/\/$/, '')

/** Scopes requested when a user signs in with Zoho (profile + CRM contact search). */
export const ZOHO_USER_LOGIN_SCOPES = [
  'AaaServer.profile.Read',
  'ZohoCRM.modules.contacts.READ',
  'ZohoSearch.securesearch.READ',
].join(',')

export async function refreshZohoUserAccessToken(refreshToken) {
  const clientId = zohoClientId()?.trim()
  const clientSecret = zohoClientSecret()?.trim()
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Zoho user OAuth is not configured.')
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  })

  const response = await fetch(`${zohoAccountsUrl()}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) {
    throw new Error(
      `Zoho user token refresh failed (${response.status}): ${payload.error || JSON.stringify(payload)}`,
    )
  }
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || refreshToken,
    expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000,
    apiDomain: (payload.api_domain || 'https://www.zohoapis.com').replace(/\/$/, ''),
  }
}

/**
 * Read the JWT and return a usable Zoho access token for the signed-in user.
 * Refreshes when expired. Returns null if the user has not connected Zoho.
 */
export async function getZohoUserAccessFromRequest(request) {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    return null
  }

  const forwarded = request.headers.get('x-forwarded-proto')
  const secureCookie =
    request.nextUrl?.protocol === 'https:' ||
    (typeof request.url === 'string' && request.url.startsWith('https:')) ||
    forwarded?.split(',')[0]?.trim() === 'https'
  const token = await getToken({ req: request, secret, secureCookie }).catch(() => null)
  if (!token?.zohoRefreshToken && !token?.zohoAccessToken) {
    return null
  }

  const expiresAt = Number(token.zohoExpiresAt || 0)
  const stillValid = token.zohoAccessToken && expiresAt > Date.now() + 60_000
  if (stillValid) {
    return {
      accessToken: token.zohoAccessToken,
      apiDomain: (token.zohoApiDomain || 'https://www.zohoapis.com').replace(/\/$/, ''),
      connected: true,
    }
  }

  if (!token.zohoRefreshToken) {
    return null
  }

  try {
    const refreshed = await refreshZohoUserAccessToken(token.zohoRefreshToken)
    return {
      accessToken: refreshed.accessToken,
      apiDomain: refreshed.apiDomain,
      connected: true,
      // Caller cannot write JWT here; next jwt() callback will refresh again.
      // Return fresh access for this request only.
    }
  } catch (error) {
    console.error('[zoho/user-auth] refresh failed', error)
    return { connected: false, error: error.message }
  }
}
