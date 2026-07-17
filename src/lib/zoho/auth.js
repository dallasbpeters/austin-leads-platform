/*
 * Zoho OAuth — refresh-token flow.
 *
 * Uses a "self client" refresh token (created in the Zoho API console) to
 * mint short-lived access tokens. Tokens are cached in-module until ~1 min
 * before expiry.
 *
 * Required env vars:
 *   ZOHO_CLIENT_ID
 *   ZOHO_CLIENT_SECRET
 *   ZOHO_REFRESH_TOKEN
 * Optional:
 *   ZOHO_ACCOUNTS_URL (default https://accounts.zoho.com — use .eu/.in etc.
 *   if the client's Zoho account lives in another data center)
 */

let cachedToken = null
let cachedExpiresAt = 0

export function hasZohoCredentials() {
  return Boolean(
    process.env.ZOHO_CLIENT_ID?.trim() &&
    process.env.ZOHO_CLIENT_SECRET?.trim() &&
    process.env.ZOHO_REFRESH_TOKEN?.trim(),
  )
}

export function getZohoAccountsUrl() {
  return (process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com').replace(/\/$/, '')
}

export async function getZohoAccessToken() {
  if (!hasZohoCredentials()) {
    throw new Error('Zoho is not configured. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN.')
  }

  const now = Date.now()
  if (cachedToken && now < cachedExpiresAt - 60_000) {
    return cachedToken
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
  })

  const response = await fetch(`${getZohoAccountsUrl()}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) {
    const detail = payload.error || JSON.stringify(payload)
    const hint =
      detail === 'invalid_code' || detail === 'invalid_grant'
        ? ' ZOHO_REFRESH_TOKEN is invalid or was generated for a different client. Re-generate via Self Client → Generate Code, then run: node --env-file=.env.development.local scripts/zoho-exchange-code.mjs <CODE>'
        : ''
    throw new Error(`Zoho token refresh failed (${response.status}): ${detail}.${hint}`)
  }

  cachedToken = payload.access_token
  cachedExpiresAt = now + (Number(payload.expires_in) || 3600) * 1000
  return cachedToken
}

export function zohoAuthHeader(token) {
  return { Authorization: `Zoho-oauthtoken ${token}` }
}
