import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import { getSql } from '../db/pool.js'

/*
 * Connected social accounts — one row per platform.
 *
 * Access and refresh tokens can post to the company's accounts, so they are
 * encrypted (AES-256-GCM) with SOCIAL_TOKEN_KEY before they reach the
 * database. Without that key set, connecting is refused rather than storing
 * tokens in the clear.
 */

const keyFrom = () => {
  const secret = (process.env.SOCIAL_TOKEN_KEY || '').trim()
  return secret ? createHash('sha256').update(secret).digest() : null
}

export const hasTokenKey = () => Boolean(keyFrom())

function seal(plain) {
  if (plain === null || plain === undefined || plain === '') {
    return null
  }
  const key = keyFrom()
  if (!key) {
    throw new Error('SOCIAL_TOKEN_KEY is not set, so tokens cannot be stored safely.')
  }
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const body = Buffer.concat([cipher.update(String(plain), 'utf-8'), cipher.final()])
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), body.toString('base64')].join(
    '.',
  )
}

function open(sealed) {
  if (!sealed) {
    return null
  }
  const key = keyFrom()
  const [version, iv, tag, body] = String(sealed).split('.')
  if (!key || version !== 'v1') {
    return null
  }
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString('utf-8')
}

async function runMigrations() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS social_accounts (
      provider            TEXT PRIMARY KEY,
      account_id          TEXT,
      username            TEXT,
      avatar_url          TEXT,
      access_token        TEXT,
      refresh_token       TEXT,
      expires_at          TIMESTAMPTZ,
      refresh_expires_at  TIMESTAMPTZ,
      scopes              TEXT[] NOT NULL DEFAULT '{}',
      connected_by        TEXT,
      connected_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_error          TEXT
    )
  `
}

const SCHEMA_PROMISE_KEY = '__socialAccountsSchemaReady_v1__'

async function migrateOnce() {
  try {
    await runMigrations()
  } catch (error) {
    globalThis[SCHEMA_PROMISE_KEY] = null
    throw error
  }
}

export function ensureSocialTables() {
  if (!globalThis[SCHEMA_PROMISE_KEY]) {
    globalThis[SCHEMA_PROMISE_KEY] = migrateOnce()
  }
  return globalThis[SCHEMA_PROMISE_KEY]
}

/** Public shape: never includes a token. */
const toSummary = (row) =>
  row
    ? {
        provider: row.provider,
        accountId: row.account_id,
        username: row.username || '',
        avatarUrl: row.avatar_url || '',
        expiresAt: row.expires_at,
        refreshExpiresAt: row.refresh_expires_at,
        scopes: row.scopes || [],
        connectedBy: row.connected_by || null,
        connectedAt: row.connected_at,
        updatedAt: row.updated_at,
        lastError: row.last_error || null,
      }
    : null

export async function listSocialAccounts() {
  const sql = getSql()
  const rows = await sql`SELECT * FROM social_accounts`
  return rows.map(toSummary)
}

/** Server-only: the account with its tokens decrypted, for posting and refreshing. */
export async function getSocialAccountWithTokens(provider) {
  const sql = getSql()
  const rows = await sql`SELECT * FROM social_accounts WHERE provider = ${provider} LIMIT 1`
  const row = rows[0]
  if (!row) {
    return null
  }
  return {
    ...toSummary(row),
    accessToken: open(row.access_token),
    refreshToken: open(row.refresh_token),
  }
}

export async function saveSocialAccount(provider, account) {
  const sql = getSql()
  await sql`
    INSERT INTO social_accounts (
      provider, account_id, username, avatar_url, access_token, refresh_token,
      expires_at, refresh_expires_at, scopes, connected_by, last_error
    ) VALUES (
      ${provider}, ${account.accountId || null}, ${account.username || null}, ${account.avatarUrl || null},
      ${seal(account.accessToken)}, ${seal(account.refreshToken)},
      ${account.expiresAt || null}, ${account.refreshExpiresAt || null},
      ${account.scopes || []}, ${account.connectedBy || null}, NULL
    )
    ON CONFLICT (provider) DO UPDATE SET
      account_id         = EXCLUDED.account_id,
      username           = EXCLUDED.username,
      avatar_url         = EXCLUDED.avatar_url,
      access_token       = EXCLUDED.access_token,
      refresh_token      = EXCLUDED.refresh_token,
      expires_at         = EXCLUDED.expires_at,
      refresh_expires_at = EXCLUDED.refresh_expires_at,
      scopes             = EXCLUDED.scopes,
      connected_by       = EXCLUDED.connected_by,
      connected_at       = NOW(),
      updated_at         = NOW(),
      last_error         = NULL
  `
}

/** After a refresh: new tokens, same account. */
export async function updateSocialTokens(provider, tokens) {
  const sql = getSql()
  await sql`
    UPDATE social_accounts SET
      access_token       = ${seal(tokens.accessToken)},
      refresh_token      = COALESCE(${seal(tokens.refreshToken)}, refresh_token),
      expires_at         = ${tokens.expiresAt || null},
      refresh_expires_at = COALESCE(${tokens.refreshExpiresAt || null}, refresh_expires_at),
      updated_at         = NOW(),
      last_error         = NULL
    WHERE provider = ${provider}
  `
}

export async function recordSocialError(provider, message) {
  const sql = getSql()
  await sql`UPDATE social_accounts SET last_error = ${String(message).slice(0, 500)}, updated_at = NOW() WHERE provider = ${provider}`
}

export async function deleteSocialAccount(provider) {
  const sql = getSql()
  await sql`DELETE FROM social_accounts WHERE provider = ${provider}`
}
