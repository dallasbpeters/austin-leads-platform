/*
 * Jobber OAuth2 — standard 3-legged authorization-code flow (unlike Zoho's
 * self-client, Jobber requires a real user consent screen + redirect).
 *
 * Required env vars:
 *   JOBBER_CLIENT_ID
 *   JOBBER_CLIENT_SECRET
 * Optional:
 *   JOBBER_API_URL           (default https://api.getjobber.com/api)
 *   JOBBER_GRAPHQL_VERSION   (dated API version, default 2025-04-16)
 */

import { getJobberConnection, saveJobberTokens } from './db.js'

export function hasJobberCredentials() {
  return Boolean(process.env.JOBBER_CLIENT_ID?.trim() && process.env.JOBBER_CLIENT_SECRET?.trim())
}

export function getJobberApiUrl() {
  return (process.env.JOBBER_API_URL || 'https://api.getjobber.com/api').replace(/\/$/, '')
}

export function getJobberGraphqlVersion() {
  return process.env.JOBBER_GRAPHQL_VERSION?.trim() || '2025-04-16'
}

export function buildJobberAuthorizeUrl({ redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: process.env.JOBBER_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  })
  return `${getJobberApiUrl()}/oauth/authorize?${params.toString()}`
}

const tokensFromResponse = (payload) => {
  const expiresInSeconds = Number(payload.expires_in) || 3600
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    // Buffer so `getValidJobberAccessToken` refreshes a little before Jobber expires it.
    expiresAt: new Date(Date.now() + (expiresInSeconds - 60) * 1000),
    scope: payload.scope || null,
  }
}

async function postToken(body) {
  const response = await fetch(`${getJobberApiUrl()}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) {
    const detail = payload.error_description || payload.error || JSON.stringify(payload)
    throw new Error(`Jobber token request failed (${response.status}): ${detail}`)
  }
  return payload
}

export async function exchangeJobberCode({ code, redirectUri }) {
  if (!hasJobberCredentials()) {
    throw new Error('Jobber is not configured. Set JOBBER_CLIENT_ID and JOBBER_CLIENT_SECRET.')
  }
  const payload = await postToken({
    grant_type: 'authorization_code',
    client_id: process.env.JOBBER_CLIENT_ID,
    client_secret: process.env.JOBBER_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  })
  const tokens = tokensFromResponse(payload)
  return saveJobberTokens(tokens)
}

async function refreshJobberTokens(refreshToken) {
  const payload = await postToken({
    grant_type: 'refresh_token',
    client_id: process.env.JOBBER_CLIENT_ID,
    client_secret: process.env.JOBBER_CLIENT_SECRET,
    refresh_token: refreshToken,
  })
  // Always re-save whatever refresh_token comes back — Jobber may rotate it,
  // and the old one can stop working immediately once a new one is issued.
  return saveJobberTokens(tokensFromResponse(payload))
}

/**
 * Returns a currently-valid access token, refreshing (and persisting the
 * refreshed tokens) if the cached one is expired or close to it.
 */
export async function getValidJobberAccessToken() {
  const connection = await getJobberConnection()
  if (!connection?.refreshToken) {
    throw new Error('Jobber is not connected. Connect it from the invoice settings page.')
  }

  const expiresAt = connection.tokenExpiresAt ? new Date(connection.tokenExpiresAt).getTime() : 0
  if (connection.accessToken && expiresAt > Date.now()) {
    return connection.accessToken
  }

  const refreshed = await refreshJobberTokens(connection.refreshToken)
  return refreshed.accessToken
}
