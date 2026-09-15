import { randomBytes } from 'node:crypto'

import { getSql } from '../db/pool.js'

/*
 * Christmas lights mockups — saved on their own (named for the customer or
 * address) or tied to one invoice.
 *
 * Stores the downscaled house photo plus the traced shapes so a mockup can be
 * reopened and edited, and the finished JPEG so the invoice builder can show
 * it without re-rendering. Images live in their own table (not the invoice's
 * `data` JSONB) so invoice list queries never drag them along.
 */

async function runMockupMigrations() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS christmas_mockups (
      id            TEXT PRIMARY KEY,
      invoice_id    TEXT UNIQUE REFERENCES christmas_invoices(id) ON DELETE CASCADE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      state         JSONB NOT NULL DEFAULT '{}'::jsonb,
      photo         BYTEA NOT NULL,
      photo_type    TEXT NOT NULL DEFAULT 'image/jpeg',
      rendered      BYTEA NOT NULL,
      rendered_type TEXT NOT NULL DEFAULT 'image/jpeg'
    )
  `
  await sql`ALTER TABLE christmas_mockups ADD COLUMN IF NOT EXISTS title TEXT`
  await sql`CREATE INDEX IF NOT EXISTS christmas_mockups_updated_at_idx ON christmas_mockups (updated_at DESC)`

  // Estimator prices per unit (cents), shared by everyone — single row id = 'default'.
  await sql`
    CREATE TABLE IF NOT EXISTS christmas_mockup_settings (
      id         TEXT PRIMARY KEY,
      rates      JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

/* Bump the suffix when the migrations change, so a long-running process (or dev hot reload) runs them again. */
const SCHEMA_PROMISE_KEY = '__christmasMockupSchemaReady_v2__'

async function migrateOnce() {
  try {
    await runMockupMigrations()
  } catch (error) {
    globalThis[SCHEMA_PROMISE_KEY] = null
    throw error
  }
}

/** Call after ensureChristmasInvoiceTables() — the invoice_id foreign key needs that table. */
export function ensureChristmasMockupTables() {
  if (!globalThis[SCHEMA_PROMISE_KEY]) {
    globalThis[SCHEMA_PROMISE_KEY] = migrateOnce()
  }
  return globalThis[SCHEMA_PROMISE_KEY]
}

const newId = () => `mck_${randomBytes(8).toString('hex')}`

const rowToMockup = (row) =>
  row
    ? {
        id: row.id,
        invoiceId: row.invoice_id,
        invoiceNumber: row.invoice_number || null,
        title: row.title || row.customer_name || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        state: row.state || {},
      }
    : null

/** Mockup metadata + editable state for an invoice (no image bytes), or null. */
export async function getMockupForInvoice(invoiceId) {
  const sql = getSql()
  const rows = await sql`
    SELECT m.id, m.invoice_id, m.title, m.created_at, m.updated_at, m.state, i.invoice_number, i.customer_name
    FROM christmas_mockups m LEFT JOIN christmas_invoices i ON i.id = m.invoice_id
    WHERE m.invoice_id = ${invoiceId} LIMIT 1
  `
  return rowToMockup(rows[0])
}

/** One image column for a mockup: 'photo' (the bare house) or 'rendered' (with lights). */
export async function getMockupImage(id, kind) {
  const sql = getSql()
  const rows =
    kind === 'photo'
      ? await sql`SELECT photo AS bytes, photo_type AS type FROM christmas_mockups WHERE id = ${id} LIMIT 1`
      : await sql`SELECT rendered AS bytes, rendered_type AS type FROM christmas_mockups WHERE id = ${id} LIMIT 1`
  return rows[0] || null
}

/** The finished lights picture tied to an invoice, as a Buffer, or null. */
export async function getInvoiceMockupPicture(invoiceId) {
  const sql = getSql()
  const rows = await sql`SELECT rendered FROM christmas_mockups WHERE invoice_id = ${invoiceId} LIMIT 1`
  return rows[0]?.rendered || null
}

/** Creates or replaces the invoice's mockup. */
export async function saveMockupForInvoice(invoiceId, { title, state, photo, rendered }) {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO christmas_mockups (id, invoice_id, title, state, photo, rendered)
    VALUES (${newId()}, ${invoiceId}, ${title || null}, ${JSON.stringify(state)}, ${photo}, ${rendered})
    ON CONFLICT (invoice_id) DO UPDATE SET
      title      = COALESCE(EXCLUDED.title, christmas_mockups.title),
      state      = EXCLUDED.state,
      photo      = EXCLUDED.photo,
      rendered   = EXCLUDED.rendered,
      updated_at = NOW()
    RETURNING id, invoice_id, title, created_at, updated_at, state
  `
  return rowToMockup(rows[0])
}

/** One mockup's metadata + editable state (no image bytes), or null. */
export async function getMockup(id) {
  const sql = getSql()
  const rows = await sql`
    SELECT m.id, m.invoice_id, m.title, m.created_at, m.updated_at, m.state, i.invoice_number, i.customer_name
    FROM christmas_mockups m LEFT JOIN christmas_invoices i ON i.id = m.invoice_id
    WHERE m.id = ${id} LIMIT 1
  `
  return rowToMockup(rows[0])
}

/** Saved mockups, newest first — metadata only, so the list stays light. */
export async function listMockups({ limit = 100 } = {}) {
  const sql = getSql()
  const rows = await sql`
    SELECT m.id, m.invoice_id, m.title, m.created_at, m.updated_at, i.invoice_number, i.customer_name
    FROM christmas_mockups m LEFT JOIN christmas_invoices i ON i.id = m.invoice_id
    ORDER BY m.updated_at DESC LIMIT ${limit}
  `
  return rows.map(rowToMockup)
}

/** A new mockup not tied to an invoice. */
export async function createMockup({ title, state, photo, rendered }) {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO christmas_mockups (id, title, state, photo, rendered)
    VALUES (${newId()}, ${title || null}, ${JSON.stringify(state)}, ${photo}, ${rendered})
    RETURNING id, invoice_id, title, created_at, updated_at, state
  `
  return rowToMockup(rows[0])
}

export async function updateMockup(id, { title, state, photo, rendered }) {
  const sql = getSql()
  const rows = await sql`
    UPDATE christmas_mockups SET
      title      = COALESCE(${title || null}, title),
      state      = ${JSON.stringify(state)},
      photo      = ${photo},
      rendered   = ${rendered},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, invoice_id, title, created_at, updated_at, state
  `
  return rowToMockup(rows[0])
}

/**
 * Ties a saved mockup to an invoice. An invoice keeps one mockup, so any
 * mockup it had before is let go (kept, just no longer tied to it).
 */
export async function linkMockupToInvoice(mockupId, { invoiceId, customerName }) {
  const sql = getSql()
  await sql`UPDATE christmas_mockups SET invoice_id = NULL WHERE invoice_id = ${invoiceId} AND id <> ${mockupId}`
  const rows = await sql`
    UPDATE christmas_mockups SET
      invoice_id = ${invoiceId},
      title      = COALESCE(NULLIF(title, ''), ${customerName || null}),
      updated_at = NOW()
    WHERE id = ${mockupId}
    RETURNING id, invoice_id, title, created_at, updated_at, state
  `
  return rowToMockup(rows[0])
}

/** Estimator rates: cents per unit, keyed by service. */
export async function getMockupRates() {
  const sql = getSql()
  const rows = await sql`SELECT rates FROM christmas_mockup_settings WHERE id = 'default' LIMIT 1`
  return rows[0]?.rates || {}
}

export async function saveMockupRates(rates) {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO christmas_mockup_settings (id, rates) VALUES ('default', ${JSON.stringify(rates)})
    ON CONFLICT (id) DO UPDATE SET rates = EXCLUDED.rates, updated_at = NOW()
    RETURNING rates
  `
  return rows[0]?.rates || {}
}
