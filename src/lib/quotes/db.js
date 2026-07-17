import { randomBytes } from 'node:crypto'

import { getSql, hasDatabaseUrl } from '../db/pool.js'

// ─── Schema setup ────────────────────────────────────────────────────────────

export function hasQuoteDatabase() {
  return hasDatabaseUrl()
}

export async function ensureQuotesTable() {
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS solar_quotes (
      id                     TEXT PRIMARY KEY,
      quote_number           TEXT NOT NULL UNIQUE,
      created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status                 TEXT NOT NULL DEFAULT 'draft',

      -- Customer
      customer_name          TEXT NOT NULL,
      customer_email         TEXT,
      customer_phone         TEXT,
      property_address       TEXT,
      property_city          TEXT,
      property_state         TEXT DEFAULT 'TX',
      property_zip           TEXT,
      utility_provider       TEXT,

      -- Headline numbers (denormalized for list views / Zoho sync)
      system_size_kw         NUMERIC,
      annual_production_kwh  NUMERIC,
      system_price_cents     BIGINT,
      net_price_cents        BIGINT,

      -- Full input + computed snapshot used to render the PDF
      data                   JSONB NOT NULL DEFAULT '{}'::jsonb,

      -- Delivery tracking
      sent_at                TIMESTAMPTZ,
      emailed_to             TEXT,
      zoho_sheet_synced_at   TIMESTAMPTZ,
      workdrive_file_id      TEXT,
      workdrive_folder_id    TEXT
    )
  `

  // Email tracking columns (guard for tables created before this version).
  await sql`ALTER TABLE solar_quotes ADD COLUMN IF NOT EXISTS resend_email_id TEXT`
  await sql`ALTER TABLE solar_quotes ADD COLUMN IF NOT EXISTS email_status TEXT`
  await sql`ALTER TABLE solar_quotes ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ`
  await sql`ALTER TABLE solar_quotes ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ`
  await sql`ALTER TABLE solar_quotes ADD COLUMN IF NOT EXISTS open_count INT NOT NULL DEFAULT 0`
  await sql`ALTER TABLE solar_quotes ADD COLUMN IF NOT EXISTS signature_request_id TEXT`
  await sql`ALTER TABLE solar_quotes ADD COLUMN IF NOT EXISTS signature_requested_at TIMESTAMPTZ`

  await sql`CREATE INDEX IF NOT EXISTS solar_quotes_created_at_idx ON solar_quotes (created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS solar_quotes_customer_name_idx ON solar_quotes (customer_name)`
  await sql`CREATE INDEX IF NOT EXISTS solar_quotes_resend_email_id_idx ON solar_quotes (resend_email_id)`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const newId = () => `qt_${randomBytes(8).toString('hex')}`

export function newQuoteNumber() {
  const year = new Date().getFullYear()
  const suffix = randomBytes(3).toString('hex').toUpperCase()
  return `TSR-${year}-${suffix}`
}

const toCents = (dollars) => Math.round(Number(dollars || 0) * 100)

const rowToQuote = (row) => {
  if (!row) {
    return null
  }
  return {
    id: row.id,
    quoteNumber: row.quote_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    propertyAddress: row.property_address,
    propertyCity: row.property_city,
    propertyState: row.property_state,
    propertyZip: row.property_zip,
    utilityProvider: row.utility_provider,
    systemSizeKw: row.system_size_kw === null ? null : Number(row.system_size_kw),
    annualProductionKwh: row.annual_production_kwh === null ? null : Number(row.annual_production_kwh),
    systemPrice: row.system_price_cents === null ? null : Number(row.system_price_cents) / 100,
    netPrice: row.net_price_cents === null ? null : Number(row.net_price_cents) / 100,
    data: row.data || {},
    sentAt: row.sent_at,
    emailedTo: row.emailed_to,
    zohoSheetSyncedAt: row.zoho_sheet_synced_at,
    workdriveFileId: row.workdrive_file_id,
    workdriveFolderId: row.workdrive_folder_id,
    resendEmailId: row.resend_email_id,
    emailStatus: row.email_status,
    deliveredAt: row.delivered_at,
    openedAt: row.opened_at,
    openCount: Number(row.open_count || 0),
    signatureRequestId: row.signature_request_id,
    signatureRequestedAt: row.signature_requested_at,
  }
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {object} params.inputs   Raw form inputs
 * @param {object} params.computed Output of computeQuote()
 */
export async function insertQuote({ inputs, computed }) {
  const sql = getSql()
  const id = newId()
  const quoteNumber = newQuoteNumber()
  const data = { inputs, computed }

  const rows = await sql`
    INSERT INTO solar_quotes (
      id, quote_number, customer_name, customer_email, customer_phone,
      property_address, property_city, property_state, property_zip,
      utility_provider, system_size_kw, annual_production_kwh,
      system_price_cents, net_price_cents, data
    ) VALUES (
      ${id}, ${quoteNumber}, ${inputs.customerName || 'Unknown'},
      ${inputs.customerEmail || null}, ${inputs.customerPhone || null},
      ${inputs.propertyAddress || null}, ${inputs.propertyCity || null},
      ${inputs.propertyState || 'TX'}, ${inputs.propertyZip || null},
      ${inputs.utilityProvider || null}, ${computed.systemSizeKw},
      ${computed.annualProductionKwh}, ${toCents(computed.systemPrice)},
      ${toCents(computed.netSystemPrice)}, ${JSON.stringify(data)}
    )
    RETURNING *
  `
  return rowToQuote(rows[0])
}

export async function updateQuote(id, { inputs, computed }) {
  const sql = getSql()
  const data = { inputs, computed }
  const rows = await sql`
    UPDATE solar_quotes SET
      customer_name = ${inputs.customerName || 'Unknown'},
      customer_email = ${inputs.customerEmail || null},
      customer_phone = ${inputs.customerPhone || null},
      property_address = ${inputs.propertyAddress || null},
      property_city = ${inputs.propertyCity || null},
      property_state = ${inputs.propertyState || 'TX'},
      property_zip = ${inputs.propertyZip || null},
      utility_provider = ${inputs.utilityProvider || null},
      system_size_kw = ${computed.systemSizeKw},
      annual_production_kwh = ${computed.annualProductionKwh},
      system_price_cents = ${toCents(computed.systemPrice)},
      net_price_cents = ${toCents(computed.netSystemPrice)},
      data = ${JSON.stringify(data)},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return rowToQuote(rows[0])
}

export async function getQuote(id) {
  const sql = getSql()
  const rows = await sql`SELECT * FROM solar_quotes WHERE id = ${id} LIMIT 1`
  return rowToQuote(rows[0])
}

export async function listQuotes({ limit = 100 } = {}) {
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM solar_quotes ORDER BY created_at DESC LIMIT ${limit}
  `
  return rows.map(rowToQuote)
}

export async function markQuoteSent(id, { emailedTo, resendEmailId }) {
  const sql = getSql()
  await sql`
    UPDATE solar_quotes
    SET status = 'sent',
        sent_at = NOW(),
        emailed_to = ${emailedTo || null},
        resend_email_id = ${resendEmailId || null},
        email_status = 'sent',
        delivered_at = NULL,
        opened_at = NULL,
        open_count = 0,
        updated_at = NOW()
    WHERE id = ${id}
  `
}

/*
 * Applies a Resend webhook event to the quote that owns the email id.
 * Statuses only move "forward" (sent → delivered → opened); bounces and
 * complaints always win so problems are visible.
 */
export async function applyEmailEvent({ resendEmailId, type, occurredAt }) {
  if (!resendEmailId) {
    return null
  }
  const sql = getSql()
  const timestamp = occurredAt ? new Date(occurredAt) : new Date()

  if (type === 'email.delivered') {
    const rows = await sql`
      UPDATE solar_quotes
      SET email_status = CASE WHEN email_status = 'opened' THEN email_status ELSE 'delivered' END,
          delivered_at = COALESCE(delivered_at, ${timestamp}),
          updated_at = NOW()
      WHERE resend_email_id = ${resendEmailId}
      RETURNING id
    `
    return rows[0]?.id || null
  }
  if (type === 'email.opened') {
    const rows = await sql`
      UPDATE solar_quotes
      SET email_status = 'opened',
          opened_at = COALESCE(opened_at, ${timestamp}),
          open_count = open_count + 1,
          updated_at = NOW()
      WHERE resend_email_id = ${resendEmailId}
      RETURNING id
    `
    return rows[0]?.id || null
  }
  if (type === 'email.bounced' || type === 'email.complained' || type === 'email.delivery_delayed') {
    const status = type.replace('email.', '')
    const rows = await sql`
      UPDATE solar_quotes
      SET email_status = ${status}, updated_at = NOW()
      WHERE resend_email_id = ${resendEmailId}
      RETURNING id
    `
    return rows[0]?.id || null
  }
  return null
}

export async function markQuoteSheetSynced(id) {
  const sql = getSql()
  await sql`
    UPDATE solar_quotes SET zoho_sheet_synced_at = NOW(), updated_at = NOW() WHERE id = ${id}
  `
}

export async function markQuoteUploaded(id, { fileId, folderId }) {
  const sql = getSql()
  await sql`
    UPDATE solar_quotes
    SET workdrive_file_id = ${fileId || null},
        workdrive_folder_id = ${folderId || null},
        updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function markQuoteSignatureRequested(id, { requestId }) {
  const sql = getSql()
  await sql`
    UPDATE solar_quotes
    SET signature_request_id = ${requestId || null},
        signature_requested_at = NOW(),
        updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function deleteQuote(id) {
  const sql = getSql()
  await sql`DELETE FROM solar_quotes WHERE id = ${id}`
}
