import { randomBytes } from 'node:crypto'

import { getSql, hasDatabaseUrl } from '../db/pool.js'

export function hasInvoiceDatabase() {
  return hasDatabaseUrl()
}

// ─── Schema setup ────────────────────────────────────────────────────────────

export async function ensureChristmasInvoiceTables() {
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS christmas_invoices (
      id                   TEXT PRIMARY KEY,
      invoice_number       TEXT NOT NULL UNIQUE,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status               TEXT NOT NULL DEFAULT 'draft',

      -- Customer & property
      customer_name        TEXT NOT NULL,
      customer_email       TEXT,
      customer_phone       TEXT,
      property_address     TEXT,
      property_city        TEXT,
      property_state       TEXT DEFAULT 'TX',
      property_zip         TEXT,

      -- Dates & template
      invoice_date         DATE,
      due_date             DATE,
      install_date         DATE,
      template_key         TEXT NOT NULL DEFAULT 'christmas-classic',

      -- Money (denormalized for list views / Zoho sync)
      subtotal_cents       BIGINT NOT NULL DEFAULT 0,
      deposit_cents        BIGINT NOT NULL DEFAULT 0,
      balance_due_cents    BIGINT NOT NULL DEFAULT 0,

      -- Full input + computed snapshot used to render the PDF
      data                 JSONB NOT NULL DEFAULT '{}'::jsonb,

      -- Delivery tracking
      sent_at              TIMESTAMPTZ,
      emailed_to           TEXT,
      zoho_sheet_synced_at TIMESTAMPTZ,
      workdrive_file_id    TEXT,
      workdrive_folder_id  TEXT
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS christmas_invoices_created_at_idx ON christmas_invoices (created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS christmas_invoices_customer_name_idx ON christmas_invoices (customer_name)`

  await sql`
    CREATE TABLE IF NOT EXISTS christmas_invoice_settings (
      id                        TEXT PRIMARY KEY,
      created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      template_key              TEXT NOT NULL DEFAULT 'christmas-classic',
      company_name              TEXT,
      company_tagline           TEXT,
      company_phone             TEXT,
      company_email             TEXT,
      company_website           TEXT,
      logo_url                  TEXT,
      invoice_number_prefix     TEXT DEFAULT 'TCL',
      workdrive_parent_folder_id TEXT,
      sheet_resource_id         TEXT,
      sheet_worksheet_name      TEXT,
      terms                     TEXT
    )
  `
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const newId = () => `inv_${randomBytes(8).toString('hex')}`

export function newInvoiceNumber(prefix = 'TCL') {
  const year = new Date().getFullYear()
  const suffix = randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}-${year}-${suffix}`
}

const toCents = (value) => Math.max(0, Math.round(Number(value || 0)))

const rowToInvoice = (row) => {
  if (!row) {
    return null
  }
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
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
    invoiceDate: row.invoice_date === null ? null : String(row.invoice_date).split('T')[0],
    dueDate: row.due_date === null ? null : String(row.due_date).split('T')[0],
    installDate: row.install_date === null ? null : String(row.install_date).split('T')[0],
    templateKey: row.template_key,
    subtotalCents: Number(row.subtotal_cents || 0),
    depositCents: Number(row.deposit_cents || 0),
    balanceDueCents: Number(row.balance_due_cents || 0),
    data: row.data || {},
    sentAt: row.sent_at,
    emailedTo: row.emailed_to,
    zohoSheetSyncedAt: row.zoho_sheet_synced_at,
    workdriveFileId: row.workdrive_file_id,
    workdriveFolderId: row.workdrive_folder_id,
  }
}

// ─── Invoices CRUD ───────────────────────────────────────────────────────────

export async function insertInvoice({ inputs, computed, templateKey }) {
  const sql = getSql()
  const id = newId()
  const invoiceNumber = newInvoiceNumber(inputs.invoiceNumberPrefix || 'TCL')
  const data = { inputs, computed }

  const rows = await sql`
    INSERT INTO christmas_invoices (
      id, invoice_number, customer_name, customer_email, customer_phone,
      property_address, property_city, property_state, property_zip,
      invoice_date, due_date, install_date, template_key,
      subtotal_cents, deposit_cents, balance_due_cents, data
    ) VALUES (
      ${id}, ${invoiceNumber}, ${inputs.customerName || 'Unknown'},
      ${inputs.customerEmail || null}, ${inputs.customerPhone || null},
      ${inputs.propertyAddress || null}, ${inputs.propertyCity || null},
      ${inputs.propertyState || 'TX'}, ${inputs.propertyZip || null},
      ${inputs.invoiceDate || null}, ${inputs.dueDate || null}, ${inputs.installDate || null},
      ${templateKey || 'christmas-classic'},
      ${toCents(computed.subtotalCents)}, ${toCents(computed.depositCents)},
      ${toCents(computed.balanceDueCents)}, ${JSON.stringify(data)}
    )
    RETURNING *
  `
  return rowToInvoice(rows[0])
}

export async function updateInvoice(id, { inputs, computed, templateKey }) {
  const sql = getSql()
  const data = { inputs, computed }
  const rows = await sql`
    UPDATE christmas_invoices SET
      customer_name        = ${inputs.customerName || 'Unknown'},
      customer_email       = ${inputs.customerEmail || null},
      customer_phone       = ${inputs.customerPhone || null},
      property_address     = ${inputs.propertyAddress || null},
      property_city        = ${inputs.propertyCity || null},
      property_state       = ${inputs.propertyState || 'TX'},
      property_zip         = ${inputs.propertyZip || null},
      invoice_date         = ${inputs.invoiceDate || null},
      due_date             = ${inputs.dueDate || null},
      install_date         = ${inputs.installDate || null},
      template_key         = ${templateKey || 'christmas-classic'},
      subtotal_cents       = ${toCents(computed.subtotalCents)},
      deposit_cents        = ${toCents(computed.depositCents)},
      balance_due_cents    = ${toCents(computed.balanceDueCents)},
      data                 = ${JSON.stringify(data)},
      updated_at           = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return rowToInvoice(rows[0])
}

export async function getInvoice(id) {
  const sql = getSql()
  const rows = await sql`SELECT * FROM christmas_invoices WHERE id = ${id} LIMIT 1`
  return rowToInvoice(rows[0])
}

export async function listInvoices({ limit = 200 } = {}) {
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM christmas_invoices ORDER BY created_at DESC LIMIT ${limit}
  `
  return rows.map(rowToInvoice)
}

export async function deleteInvoice(id) {
  const sql = getSql()
  await sql`DELETE FROM christmas_invoices WHERE id = ${id}`
}

export async function markInvoiceSheetSynced(id) {
  const sql = getSql()
  await sql`
    UPDATE christmas_invoices SET zoho_sheet_synced_at = NOW(), updated_at = NOW() WHERE id = ${id}
  `
}

export async function markInvoiceUploaded(id, { fileId, folderId }) {
  const sql = getSql()
  await sql`
    UPDATE christmas_invoices
    SET workdrive_file_id = ${fileId || null},
        workdrive_folder_id = ${folderId || null},
        updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function markInvoiceSent(id, { emailedTo }) {
  const sql = getSql()
  await sql`
    UPDATE christmas_invoices
    SET status = 'sent',
        sent_at = NOW(),
        emailed_to = ${emailedTo || null},
        updated_at = NOW()
    WHERE id = ${id}
  `
}

// ─── Settings ────────────────────────────────────────────────────────────────

const normalizeSettingsRow = (row) => {
  if (!row) {
    return null
  }
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    templateKey: row.template_key,
    companyName: row.company_name,
    companyTagline: row.company_tagline,
    companyPhone: row.company_phone,
    companyEmail: row.company_email,
    companyWebsite: row.company_website,
    logoUrl: row.logo_url,
    invoiceNumberPrefix: row.invoice_number_prefix,
    workdriveParentFolderId: row.workdrive_parent_folder_id,
    sheetResourceId: row.sheet_resource_id,
    sheetWorksheetName: row.sheet_worksheet_name,
    terms: row.terms,
  }
}

export const getChristmasInvoiceSettingsRow = async (id = 'default') => {
  const sql = getSql()
  await ensureChristmasInvoiceTables()

  const [row] = await sql`
    SELECT * FROM christmas_invoice_settings WHERE id = ${id} LIMIT 1
  `
  return normalizeSettingsRow(row)
}

export const upsertChristmasInvoiceSettingsRow = async (values, id = 'default') => {
  const sql = getSql()
  await ensureChristmasInvoiceTables()

  const [row] = await sql`
    INSERT INTO christmas_invoice_settings (
      id, template_key, company_name, company_tagline, company_phone,
      company_email, company_website, logo_url, invoice_number_prefix,
      workdrive_parent_folder_id, sheet_resource_id, sheet_worksheet_name, terms
    ) VALUES (
      ${id},
      ${values.templateKey || 'christmas-classic'},
      ${values.companyName || null},
      ${values.companyTagline || null},
      ${values.companyPhone || null},
      ${values.companyEmail || null},
      ${values.companyWebsite || null},
      ${values.logoUrl || null},
      ${values.invoiceNumberPrefix || 'TCL'},
      ${values.workdriveParentFolderId || null},
      ${values.sheetResourceId || null},
      ${values.sheetWorksheetName || null},
      ${values.terms || null}
    )
    ON CONFLICT (id)
    DO UPDATE SET
      updated_at = NOW(),
      template_key = EXCLUDED.template_key,
      company_name = EXCLUDED.company_name,
      company_tagline = EXCLUDED.company_tagline,
      company_phone = EXCLUDED.company_phone,
      company_email = EXCLUDED.company_email,
      company_website = EXCLUDED.company_website,
      logo_url = EXCLUDED.logo_url,
      invoice_number_prefix = EXCLUDED.invoice_number_prefix,
      workdrive_parent_folder_id = EXCLUDED.workdrive_parent_folder_id,
      sheet_resource_id = EXCLUDED.sheet_resource_id,
      sheet_worksheet_name = EXCLUDED.sheet_worksheet_name,
      terms = EXCLUDED.terms
    RETURNING *
  `
  return normalizeSettingsRow(row)
}
