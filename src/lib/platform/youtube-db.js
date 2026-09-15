import { getSql, hasDatabaseUrl } from '../db/pool.js'

/*
 * Storage for the YouTube OAuth refresh token.
 *
 * It cannot live in an env var: the token is minted at runtime when the channel
 * owner consents, and Vercel env vars are build-time. It cannot live on disk
 * either — the filesystem is read-only outside /tmp and /tmp does not survive.
 * So it goes in Postgres alongside publish jobs, which is also what makes the
 * consent flow work from a browser with no developer machine involved.
 *
 * One row. The channel is a property of the deployment, not of a user.
 */

let ready = null

export function hasYoutubeDatabase() {
  return hasDatabaseUrl()
}

async function migrate() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS youtube_oauth (
      id            TEXT PRIMARY KEY DEFAULT 'default',
      refresh_token TEXT NOT NULL,
      channel_email TEXT,
      scope         TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

/* Same once-per-process pattern as publish-db. */
async function ensure() {
  ready ||= migrate()
  await ready
}

export async function saveRefreshToken({ refreshToken, channelEmail, scope }) {
  await ensure()
  const sql = getSql()
  await sql`
    INSERT INTO youtube_oauth (id, refresh_token, channel_email, scope, updated_at)
    VALUES ('default', ${refreshToken}, ${channelEmail || null}, ${scope || null}, NOW())
    ON CONFLICT (id) DO UPDATE
      SET refresh_token = EXCLUDED.refresh_token,
          channel_email = EXCLUDED.channel_email,
          scope         = EXCLUDED.scope,
          updated_at    = NOW()
  `
}

export async function readRefreshToken() {
  await ensure()
  const sql = getSql()
  const rows =
    await sql`SELECT refresh_token, channel_email, updated_at FROM youtube_oauth WHERE id = 'default'`
  return rows[0] || null
}

/*
 * The env var still wins when it is set, so a local run and a Vercel run behave
 * the same and an operator can override a bad stored token without SQL.
 */
export async function resolveRefreshToken() {
  const fromEnv = process.env.YOUTUBE_REFRESH_TOKEN?.trim()
  if (fromEnv) {
    return { refreshToken: fromEnv, source: 'env' }
  }
  if (!hasDatabaseUrl()) {
    return null
  }
  const row = await readRefreshToken()
  return row ? { refreshToken: row.refresh_token, source: 'database', channelEmail: row.channel_email } : null
}

export function oauthClient() {
  const id = (process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_BUSINESS_CLIENT_ID || '').trim()
  const secret = (
    process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
    process.env.GOOGLE_BUSINESS_CLIENT_SECRET ||
    ''
  ).trim()
  return id && secret ? { id, secret } : null
}

/* The redirect URI must match what is registered on the client, exactly. */
export function redirectUri(request) {
  const explicit = process.env.YOUTUBE_OAUTH_REDIRECT?.trim()
  if (explicit) {
    return explicit
  }
  const origin = new URL(request.url).origin
  return `${origin}/api/youtube/callback`
}

export async function accessTokenFromRefresh(refreshToken) {
  const client = oauthClient()
  if (!client) {
    throw new Error('No OAuth client configured')
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: client.id,
      client_secret: client.secret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  })
  const payload = await res.json().catch(() => ({}))
  if (!payload.access_token) {
    throw new Error(`Could not refresh the access token: ${JSON.stringify(payload)}`)
  }
  return payload.access_token
}
