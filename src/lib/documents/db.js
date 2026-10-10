import { getPool, getSql, hasDatabaseUrl } from '../db/pool.js'

export const hasDocumentDatabase = () => {
  return hasDatabaseUrl()
}

const parseJson = (value, fallback = {}) => {
  if (!value) {
    return fallback
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return value
}

const normalizeClientRow = (row) => {
  if (!row) {
    return row
  }

  return {
    ...row,
    metadata: parseJson(row.metadata),
  }
}

const normalizeRequestRow = (row) => {
  if (!row) {
    return row
  }

  return {
    ...row,
    compliance_snapshot: parseJson(row.compliance_snapshot),
    provider_payload: parseJson(row.provider_payload),
  }
}

const normalizeLibraryRow = (row) => {
  if (!row) {
    return row
  }

  return {
    ...row,
    metadata: parseJson(row.metadata),
  }
}

const normalizeRecipientRow = (row) => {
  if (!row) {
    return row
  }

  return {
    ...row,
    signingUrl: row.signingUrl || row.signing_url || null,
    providerSubmitterId: row.providerSubmitterId || row.provider_submitter_id || null,
    resendEmailId: row.resendEmailId || row.resend_email_id || null,
    sentAt: row.sentAt || row.sent_at || null,
    metadata: parseJson(row.metadata),
  }
}

const normalizeAuditRow = (row) => {
  if (!row) {
    return row
  }

  return {
    ...row,
    metadata: parseJson(row.metadata),
  }
}

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const ensureDocumentTables = async () => {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      "SELECT pg_try_advisory_xact_lock(hashtext('alp_document_tables_bootstrap')) AS locked",
    )

    if (!rows[0]?.locked) {
      await client.query('COMMIT')
      await delay(300)
      return
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS document_clients (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'active',
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      address TEXT,
      notes TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS document_signature_requests (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sent_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'draft',
      client_id TEXT REFERENCES document_clients(id) ON DELETE SET NULL,
      document_asset_id TEXT,
      title TEXT NOT NULL,
      source_type TEXT NOT NULL,
      template_id TEXT,
      file_name TEXT,
      file_sha256 TEXT,
      docuseal_submission_id TEXT,
      send_channel TEXT NOT NULL DEFAULT 'resend',
      legal_basis TEXT NOT NULL DEFAULT 'esign_consent',
      consent_text TEXT NOT NULL,
      compliance_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
      provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_by_email TEXT
    )
  `)

    await client.query(`
      ALTER TABLE document_signature_requests
      ADD COLUMN IF NOT EXISTS document_asset_id TEXT
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS document_library_items (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      client_id TEXT REFERENCES document_clients(id) ON DELETE SET NULL,
      request_id TEXT REFERENCES document_signature_requests(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_mime_type TEXT NOT NULL DEFAULT 'application/pdf',
      file_base64 TEXT NOT NULL,
      file_sha256 TEXT,
      source_type TEXT NOT NULL DEFAULT 'upload',
      status TEXT NOT NULL DEFAULT 'available',
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS document_recipients (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sent_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'pending',
      request_id TEXT NOT NULL REFERENCES document_signature_requests(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES document_clients(id) ON DELETE SET NULL,
      name TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      signing_url TEXT,
      provider_submitter_id TEXT,
      resend_email_id TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS document_audit_events (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      request_id TEXT REFERENCES document_signature_requests(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES document_clients(id) ON DELETE SET NULL,
      actor_email TEXT,
      event_type TEXT NOT NULL,
      event_summary TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `)

    await client.query(
      'CREATE INDEX IF NOT EXISTS document_clients_email_idx ON document_clients (LOWER(email))',
    )
    await client.query(
      'CREATE INDEX IF NOT EXISTS document_signature_requests_client_idx ON document_signature_requests (client_id)',
    )
    await client.query(
      'CREATE INDEX IF NOT EXISTS document_signature_requests_asset_idx ON document_signature_requests (document_asset_id)',
    )
    await client.query(
      'CREATE INDEX IF NOT EXISTS document_library_items_client_idx ON document_library_items (client_id)',
    )
    await client.query(
      'CREATE INDEX IF NOT EXISTS document_library_items_request_idx ON document_library_items (request_id)',
    )
    await client.query(
      'CREATE INDEX IF NOT EXISTS document_recipients_request_idx ON document_recipients (request_id)',
    )
    await client.query(
      'CREATE INDEX IF NOT EXISTS document_audit_events_request_idx ON document_audit_events (request_id, created_at DESC)',
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => null)
    throw error
  } finally {
    client.release()
  }
}

export const listDocumentClients = async ({ limit = 200, search = '' } = {}) => {
  const sql = getSql()
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 500)) : 200
  const cleanSearch = search.trim()
  const searchValue = `%${cleanSearch}%`

  const rows = await sql`
    SELECT *
    FROM document_clients
    WHERE (
      ${cleanSearch} = ''
      OR name ILIKE ${searchValue}
      OR email ILIKE ${searchValue}
      OR COALESCE(company, '') ILIKE ${searchValue}
      OR COALESCE(phone, '') ILIKE ${searchValue}
    )
    ORDER BY updated_at DESC, created_at DESC
    LIMIT ${safeLimit}
  `

  return rows.map(normalizeClientRow)
}

export const getDocumentClientById = async (clientId) => {
  const sql = getSql()
  const [row] = await sql`
    SELECT *
    FROM document_clients
    WHERE id = ${clientId}
    LIMIT 1
  `

  return normalizeClientRow(row)
}

export const upsertDocumentClient = async (input) => {
  const sql = getSql()
  const id = input.id || crypto.randomUUID()
  const email = String(input.email || '')
    .trim()
    .toLowerCase()

  const [row] = await sql`
    INSERT INTO document_clients (
      id,
      status,
      name,
      email,
      phone,
      company,
      address,
      notes,
      metadata
    )
    VALUES (
      ${id},
      ${input.status || 'active'},
      ${String(input.name || '').trim()},
      ${email},
      ${input.phone || null},
      ${input.company || null},
      ${input.address || null},
      ${input.notes || null},
      ${JSON.stringify(input.metadata || {})}::jsonb
    )
    ON CONFLICT (id) DO UPDATE
    SET
      updated_at = NOW(),
      status = EXCLUDED.status,
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      company = EXCLUDED.company,
      address = EXCLUDED.address,
      notes = EXCLUDED.notes,
      metadata = EXCLUDED.metadata
    RETURNING *
  `

  return normalizeClientRow(row)
}

export const createSignatureRequest = async (input) => {
  const sql = getSql()
  const id = input.id || crypto.randomUUID()

  const [row] = await sql`
    INSERT INTO document_signature_requests (
      id,
      status,
      client_id,
      document_asset_id,
      title,
      source_type,
      template_id,
      file_name,
      file_sha256,
      send_channel,
      legal_basis,
      consent_text,
      compliance_snapshot,
      provider_payload,
      created_by_email
    )
    VALUES (
      ${id},
      ${input.status || 'draft'},
      ${input.clientId || null},
      ${input.documentAssetId || null},
      ${input.title},
      ${input.sourceType},
      ${input.templateId || null},
      ${input.fileName || null},
      ${input.fileSha256 || null},
      ${input.sendChannel || 'resend'},
      ${input.legalBasis || 'esign_consent'},
      ${input.consentText},
      ${JSON.stringify(input.complianceSnapshot || {})}::jsonb,
      ${JSON.stringify(input.providerPayload || {})}::jsonb,
      ${input.createdByEmail || null}
    )
    RETURNING *
  `

  return normalizeRequestRow(row)
}

export const createDocumentLibraryItem = async (input) => {
  const sql = getSql()
  const id = input.id || crypto.randomUUID()

  const [row] = await sql`
    INSERT INTO document_library_items (
      id,
      client_id,
      request_id,
      title,
      file_name,
      file_mime_type,
      file_base64,
      file_sha256,
      source_type,
      status,
      metadata
    )
    VALUES (
      ${id},
      ${input.clientId || null},
      ${input.requestId || null},
      ${input.title},
      ${input.fileName},
      ${input.fileMimeType || 'application/pdf'},
      ${input.fileBase64},
      ${input.fileSha256 || null},
      ${input.sourceType || 'upload'},
      ${input.status || 'available'},
      ${JSON.stringify(input.metadata || {})}::jsonb
    )
    RETURNING *
  `

  return normalizeLibraryRow(row)
}

export const updateDocumentLibraryItem = async (itemId, updates) => {
  const sql = getSql()
  const [row] = await sql`
    UPDATE document_library_items
    SET
      updated_at = NOW(),
      client_id = COALESCE(client_id, ${updates.clientId || null}),
      request_id = COALESCE(request_id, ${updates.requestId || null}),
      title = COALESCE(${updates.title || null}, title),
      file_name = COALESCE(${updates.fileName || null}, file_name),
      file_mime_type = COALESCE(${updates.fileMimeType || null}, file_mime_type),
      file_base64 = COALESCE(${updates.fileBase64 || null}, file_base64),
      file_sha256 = COALESCE(${updates.fileSha256 || null}, file_sha256),
      source_type = COALESCE(${updates.sourceType || null}, source_type),
      status = COALESCE(${updates.status || null}, status),
      metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(updates.metadata || {})}::jsonb
    WHERE id = ${itemId}
    RETURNING *
  `

  return normalizeLibraryRow(row)
}

export const getDocumentLibraryItemById = async (itemId) => {
  const sql = getSql()
  const [row] = await sql`
    SELECT *
    FROM document_library_items
    WHERE id = ${itemId}
    LIMIT 1
  `

  return normalizeLibraryRow(row)
}

export const listDocumentLibraryItems = async ({ limit = 100 } = {}) => {
  const sql = getSql()
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 300)) : 100
  const rows = await sql`
    SELECT
      library.*,
      client.name AS client_name,
      client.email AS client_email,
      request.title AS request_title,
      request.status AS request_status,
      request.docuseal_submission_id
    FROM document_library_items library
    LEFT JOIN document_clients client ON client.id = library.client_id
    LEFT JOIN document_signature_requests request ON request.id = library.request_id
    ORDER BY library.created_at DESC
    LIMIT ${safeLimit}
  `

  return rows.map(normalizeLibraryRow)
}

export const updateSignatureRequestAfterSend = async (requestId, updates) => {
  const sql = getSql()
  const [row] = await sql`
    UPDATE document_signature_requests
    SET
      updated_at = NOW(),
      sent_at = NOW(),
      status = ${updates.status || 'sent'},
      docuseal_submission_id = ${updates.docusealSubmissionId || null},
      document_asset_id = ${updates.documentAssetId || null},
      provider_payload = ${JSON.stringify(updates.providerPayload || {})}::jsonb
    WHERE id = ${requestId}
    RETURNING *
  `

  return normalizeRequestRow(row)
}

export const updateSignatureRequestStatus = async (requestId, updates) => {
  const sql = getSql()
  const [row] = await sql`
    UPDATE document_signature_requests
    SET
      updated_at = NOW(),
      status = ${updates.status},
      sent_at = COALESCE(sent_at, ${updates.sentAt || null}),
      document_asset_id = COALESCE(${updates.documentAssetId || null}, document_asset_id),
      provider_payload = ${JSON.stringify(updates.providerPayload || {})}::jsonb
    WHERE id = ${requestId}
    RETURNING *
  `

  return normalizeRequestRow(row)
}

export const getSignatureRequestById = async (requestId) => {
  const sql = getSql()
  const [row] = await sql`
    SELECT
      request.*,
      client.name AS client_name,
      client.email AS client_email
    FROM document_signature_requests request
    LEFT JOIN document_clients client ON client.id = request.client_id
    WHERE request.id = ${requestId}
    LIMIT 1
  `

  return normalizeRequestRow(row)
}

export const getSignatureRequestBySubmissionId = async (submissionId) => {
  const sql = getSql()
  const [row] = await sql`
    SELECT
      request.*,
      client.name AS client_name,
      client.email AS client_email
    FROM document_signature_requests request
    LEFT JOIN document_clients client ON client.id = request.client_id
    WHERE request.docuseal_submission_id = ${submissionId}
    LIMIT 1
  `

  return normalizeRequestRow(row)
}

export const createDocumentRecipient = async (input) => {
  const sql = getSql()
  const id = input.id || crypto.randomUUID()

  const [row] = await sql`
    INSERT INTO document_recipients (
      id,
      status,
      request_id,
      client_id,
      name,
      email,
      role,
      signing_url,
      provider_submitter_id,
      resend_email_id,
      sent_at,
      metadata
    )
    VALUES (
      ${id},
      ${input.status || 'pending'},
      ${input.requestId},
      ${input.clientId || null},
      ${input.name || null},
      ${input.email},
      ${input.role},
      ${input.signingUrl || null},
      ${input.providerSubmitterId || null},
      ${input.resendEmailId || null},
      ${input.sentAt || null},
      ${JSON.stringify(input.metadata || {})}::jsonb
    )
    RETURNING *
  `

  return normalizeRecipientRow(row)
}

export const updateDocumentRecipientStatus = async (recipientId, updates) => {
  const sql = getSql()
  const [row] = await sql`
    UPDATE document_recipients
    SET
      updated_at = NOW(),
      status = ${updates.status},
      sent_at = COALESCE(sent_at, ${updates.sentAt || null}),
      provider_submitter_id = COALESCE(provider_submitter_id, ${updates.providerSubmitterId || null}),
      signing_url = COALESCE(signing_url, ${updates.signingUrl || null}),
      resend_email_id = COALESCE(resend_email_id, ${updates.resendEmailId || null}),
      metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(updates.metadata || {})}::jsonb
    WHERE id = ${recipientId}
    RETURNING *
  `

  return normalizeRecipientRow(row)
}

export const getDocumentRecipientById = async (recipientId) => {
  const sql = getSql()
  const [row] = await sql`
    SELECT *
    FROM document_recipients
    WHERE id = ${recipientId}
    LIMIT 1
  `

  return normalizeRecipientRow(row)
}

export const listSignatureRequests = async ({ limit = 100 } = {}) => {
  const sql = getSql()
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 300)) : 100
  const rows = await sql`
    SELECT
      request.*,
      client.name AS client_name,
      client.email AS client_email,
      COUNT(recipient.id)::INT AS recipient_count,
      COUNT(recipient.id) FILTER (WHERE recipient.status IN ('sent', 'pending', 'opened', 'started'))::INT AS active_recipient_count,
      COUNT(recipient.id) FILTER (WHERE recipient.status = 'completed')::INT AS completed_recipient_count,
      COUNT(recipient.id) FILTER (WHERE recipient.status = 'declined')::INT AS declined_recipient_count,
      ARRAY_REMOVE(ARRAY_AGG(DISTINCT recipient.status), NULL) AS recipient_statuses
    FROM document_signature_requests request
    LEFT JOIN document_clients client ON client.id = request.client_id
    LEFT JOIN document_recipients recipient ON recipient.request_id = request.id
    GROUP BY request.id, client.name, client.email
    ORDER BY request.created_at DESC
    LIMIT ${safeLimit}
  `

  return rows.map(normalizeRequestRow)
}

export const listDocumentRecipients = async (requestId) => {
  const sql = getSql()
  const rows = await sql`
    SELECT *
    FROM document_recipients
    WHERE request_id = ${requestId}
    ORDER BY created_at ASC
  `

  return rows.map(normalizeRecipientRow)
}

export const createDocumentAuditEvent = async (input) => {
  const sql = getSql()
  const id = input.id || crypto.randomUUID()

  const [row] = await sql`
    INSERT INTO document_audit_events (
      id,
      request_id,
      client_id,
      actor_email,
      event_type,
      event_summary,
      ip_address,
      user_agent,
      metadata
    )
    VALUES (
      ${id},
      ${input.requestId || null},
      ${input.clientId || null},
      ${input.actorEmail || null},
      ${input.eventType},
      ${input.eventSummary},
      ${input.ipAddress || null},
      ${input.userAgent || null},
      ${JSON.stringify(input.metadata || {})}::jsonb
    )
    RETURNING *
  `

  return normalizeAuditRow(row)
}

export const listDocumentAuditEvents = async (requestId) => {
  const sql = getSql()
  const rows = await sql`
    SELECT *
    FROM document_audit_events
    WHERE request_id = ${requestId}
    ORDER BY created_at DESC
  `

  return rows.map(normalizeAuditRow)
}
