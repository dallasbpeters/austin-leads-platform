import { getSql, hasDatabaseUrl } from '../db/pool.mjs'

export const hasLeadDatabase = () => {
  return hasDatabaseUrl()
}

export const ensureLeadSubmissionsTable = async () => {
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS lead_submissions (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'new',
      pipeline_stage TEXT NOT NULL DEFAULT 'new',
      priority TEXT NOT NULL DEFAULT 'normal',
      assigned_to TEXT,
      last_contacted_at TIMESTAMPTZ,
      follow_up_at TIMESTAMPTZ,
      internal_notes TEXT,
      source_type TEXT NOT NULL,
      source_section TEXT,
      service_interest TEXT,
      site_slug TEXT NOT NULL,
      site_name TEXT NOT NULL,
      source_domain TEXT NOT NULL,
      page_path TEXT NOT NULL,
      page_title TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      notes TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `

  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new'`
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'`
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS assigned_to TEXT`
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ`
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ`
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS internal_notes TEXT`
}

export const ensureLeadRoutingSettingsTable = async () => {
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS lead_routing_settings (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
      notification_to_email TEXT,
      from_name TEXT,
      from_email TEXT,
      subject_prefix TEXT,
      resend_template_id TEXT
    )
  `
}

const normalizeLeadRoutingSettingsRow = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    emailNotificationsEnabled: row.email_notifications_enabled,
    notificationToEmail: row.notification_to_email,
    fromName: row.from_name,
    fromEmail: row.from_email,
    subjectPrefix: row.subject_prefix,
    resendTemplateId: row.resend_template_id,
  }
}

export const getLeadRoutingSettingsRow = async (id = 'default') => {
  const sql = getSql()
  await ensureLeadRoutingSettingsTable()

  const [row] = await sql`
    SELECT *
    FROM lead_routing_settings
    WHERE id = ${id}
    LIMIT 1
  `

  return normalizeLeadRoutingSettingsRow(row)
}

export const upsertLeadRoutingSettingsRow = async (
  { emailNotificationsEnabled, notificationToEmail, fromName, fromEmail, subjectPrefix, resendTemplateId },
  id = 'default',
) => {
  const sql = getSql()
  await ensureLeadRoutingSettingsTable()

  const [row] = await sql`
    INSERT INTO lead_routing_settings (
      id,
      email_notifications_enabled,
      notification_to_email,
      from_name,
      from_email,
      subject_prefix,
      resend_template_id
    )
    VALUES (
      ${id},
      ${emailNotificationsEnabled},
      ${notificationToEmail || null},
      ${fromName || null},
      ${fromEmail || null},
      ${subjectPrefix || null},
      ${resendTemplateId || null}
    )
    ON CONFLICT (id)
    DO UPDATE SET
      updated_at = NOW(),
      email_notifications_enabled = EXCLUDED.email_notifications_enabled,
      notification_to_email = EXCLUDED.notification_to_email,
      from_name = EXCLUDED.from_name,
      from_email = EXCLUDED.from_email,
      subject_prefix = EXCLUDED.subject_prefix,
      resend_template_id = EXCLUDED.resend_template_id
    RETURNING *
  `

  return normalizeLeadRoutingSettingsRow(row)
}

export const getLeadSubmissionOverview = async () => {
  const sql = getSql()

  const [counts] = await sql`
    SELECT
      COUNT(*)::INT AS total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::INT AS last_30_days,
      COUNT(*) FILTER (WHERE status = 'new')::INT AS open
    FROM lead_submissions
  `

  return counts || { total: 0, last_30_days: 0, open: 0 }
}
