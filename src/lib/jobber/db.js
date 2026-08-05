import { getSql, hasDatabaseUrl } from '../db/pool.js'

/*
 * Jobber connection storage — a single business-level OAuth connection (not
 * per admin-user), plus a raw log of inbound webhook events.
 *
 * Unlike the Zoho self-client flow (a static ZOHO_REFRESH_TOKEN env var),
 * Jobber uses a real 3-legged OAuth2 flow whose refresh_token can rotate on
 * every refresh — so the tokens must live in the database, not env vars.
 */

export function hasJobberDatabase() {
  return hasDatabaseUrl()
}

export async function ensureJobberTables() {
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS jobber_connections (
      id                TEXT PRIMARY KEY,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      jobber_account_id TEXT,
      account_name      TEXT,
      access_token      TEXT,
      refresh_token     TEXT,
      token_expires_at  TIMESTAMPTZ,
      scope             TEXT,
      connected_at      TIMESTAMPTZ,
      disconnected_at   TIMESTAMPTZ
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS jobber_webhook_events (
      id           TEXT PRIMARY KEY,
      received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      topic        TEXT NOT NULL,
      account_id   TEXT,
      item_id      TEXT,
      payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
      processed_at TIMESTAMPTZ,
      error        TEXT
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS jobber_webhook_events_received_at_idx
      ON jobber_webhook_events (received_at DESC)
  `

  await sql`ALTER TABLE christmas_invoices ADD COLUMN IF NOT EXISTS jobber_client_id TEXT`
  await sql`ALTER TABLE christmas_invoices ADD COLUMN IF NOT EXISTS jobber_invoice_id TEXT`
  await sql`ALTER TABLE christmas_invoices ADD COLUMN IF NOT EXISTS jobber_synced_at TIMESTAMPTZ`
}

const CONNECTION_ID = 'default'

const rowToConnection = (row) => {
  if (!row) {
    return null
  }
  return {
    jobberAccountId: row.jobber_account_id,
    accountName: row.account_name,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    tokenExpiresAt: row.token_expires_at,
    scope: row.scope,
    connectedAt: row.connected_at,
    disconnectedAt: row.disconnected_at,
  }
}

export async function getJobberConnection() {
  const sql = getSql()
  const rows = await sql`SELECT * FROM jobber_connections WHERE id = ${CONNECTION_ID} LIMIT 1`
  return rowToConnection(rows[0])
}

export function isJobberConnected(connection) {
  return Boolean(connection?.accessToken && connection?.refreshToken && !connection?.disconnectedAt)
}

/**
 * Upserts the tokens returned by an OAuth code exchange or refresh call.
 * Always re-saves `refreshToken` even if unchanged — Jobber may rotate it.
 */
export async function saveJobberTokens({ accessToken, refreshToken, expiresAt, scope }) {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO jobber_connections (id, access_token, refresh_token, token_expires_at, scope, connected_at)
    VALUES (${CONNECTION_ID}, ${accessToken}, ${refreshToken}, ${expiresAt}, ${scope || null}, NOW())
    ON CONFLICT (id)
    DO UPDATE SET
      updated_at = NOW(),
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      token_expires_at = EXCLUDED.token_expires_at,
      scope = EXCLUDED.scope,
      connected_at = jobber_connections.connected_at,
      disconnected_at = NULL
    RETURNING *
  `
  return rowToConnection(rows[0])
}

export async function saveJobberAccountInfo({ jobberAccountId, accountName }) {
  const sql = getSql()
  await sql`
    UPDATE jobber_connections
    SET jobber_account_id = ${jobberAccountId || null},
        account_name = ${accountName || null},
        updated_at = NOW()
    WHERE id = ${CONNECTION_ID}
  `
}

/** Clears tokens on APP_DISCONNECT — keeps the row (and account id) for history. */
export async function clearJobberConnection() {
  const sql = getSql()
  await sql`
    UPDATE jobber_connections
    SET access_token = NULL,
        refresh_token = NULL,
        token_expires_at = NULL,
        disconnected_at = NOW(),
        updated_at = NOW()
    WHERE id = ${CONNECTION_ID}
  `
}

const newEventId = () => `jwh_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

export async function recordJobberWebhookEvent({ topic, accountId, itemId, payload }) {
  const sql = getSql()
  await sql`
    INSERT INTO jobber_webhook_events (id, topic, account_id, item_id, payload)
    VALUES (${newEventId()}, ${topic}, ${accountId || null}, ${itemId || null}, ${JSON.stringify(payload || {})})
  `
}

export async function markInvoiceJobberSynced(id, { clientId, invoiceId }) {
  const sql = getSql()
  await sql`
    UPDATE christmas_invoices
    SET jobber_client_id = ${clientId || null},
        jobber_invoice_id = ${invoiceId || null},
        jobber_synced_at = NOW(),
        updated_at = NOW()
    WHERE id = ${id}
  `
}
