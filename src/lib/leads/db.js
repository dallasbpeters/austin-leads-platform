import { neon } from '@neondatabase/serverless'
import { LEAD_PIPELINE_STAGES } from './constants'

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || ''
}

export function hasLeadDatabase() {
  return Boolean(getDatabaseUrl())
}

function getSql() {
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl) {
    throw new Error('Lead database is not configured.')
  }

  return neon(databaseUrl)
}

function clampLimit(limit, fallback = 10, max = 100) {
  return Number.isFinite(limit) ? Math.max(1, Math.min(limit, max)) : fallback
}

function normalizeLeadRow(row) {
  if (!row) {
    return row
  }

  return {
    ...row,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
  }
}

export async function ensureLeadSubmissionsTable() {
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

export async function createLeadSubmission(input) {
  const sql = getSql()
  const id = crypto.randomUUID()

  const [row] = await sql`
    INSERT INTO lead_submissions (
      id,
      source_type,
      source_section,
      service_interest,
      site_slug,
      site_name,
      source_domain,
      page_path,
      page_title,
      full_name,
      email,
      phone,
      notes,
      metadata
    )
    VALUES (
      ${id},
      ${input.sourceType},
      ${input.sourceSection || null},
      ${input.serviceInterest || null},
      ${input.siteSlug},
      ${input.siteName},
      ${input.sourceDomain},
      ${input.pagePath},
      ${input.pageTitle || null},
      ${input.fullName},
      ${input.email},
      ${input.phone || null},
      ${input.notes || null},
      ${JSON.stringify(input.metadata || {})}::jsonb
    )
    RETURNING *
  `

  return normalizeLeadRow(row)
}

export async function listRecentLeadSubmissions(limit = 10) {
  const sql = getSql()
  const safeLimit = clampLimit(limit, 10, 50)

  const rows = await sql`
    SELECT *
    FROM lead_submissions
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `

  return rows.map(normalizeLeadRow)
}

export async function listLeadSubmissions({
  limit = 50,
  search = '',
  status = 'all',
  pipelineStage = 'all',
  serviceInterest = 'all',
} = {}) {
  const sql = getSql()
  const safeLimit = clampLimit(limit, 50, 200)
  const hasSearch = Boolean(search?.trim())
  const searchValue = `%${search.trim()}%`

  const rows = await sql`
    SELECT *
    FROM lead_submissions
    WHERE (${status} = 'all' OR status = ${status})
      AND (${pipelineStage} = 'all' OR pipeline_stage = ${pipelineStage})
      AND (${serviceInterest} = 'all' OR service_interest = ${serviceInterest})
      AND (
        ${hasSearch} = false
        OR full_name ILIKE ${searchValue}
        OR email ILIKE ${searchValue}
        OR COALESCE(phone, '') ILIKE ${searchValue}
        OR COALESCE(source_domain, '') ILIKE ${searchValue}
        OR COALESCE(page_title, '') ILIKE ${searchValue}
      )
    ORDER BY
      CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        ELSE 4
      END,
      created_at DESC
    LIMIT ${safeLimit}
  `

  return rows.map(normalizeLeadRow)
}

export async function getLeadSubmissionById(leadId) {
  const sql = getSql()

  const [row] = await sql`
    SELECT *
    FROM lead_submissions
    WHERE id = ${leadId}
    LIMIT 1
  `

  return normalizeLeadRow(row)
}

export async function updateLeadSubmission(leadId, updates) {
  const sql = getSql()
  const existing = await getLeadSubmissionById(leadId)

  if (!existing) {
    return null
  }

  const nextStatus = updates.status || existing.status
  const nextPipelineStage = updates.pipelineStage || existing.pipeline_stage
  const nextPriority = updates.priority || existing.priority
  const nextAssignedTo =
    typeof updates.assignedTo === 'string' ? updates.assignedTo.trim() || null : existing.assigned_to
  const nextInternalNotes =
    typeof updates.internalNotes === 'string' ? updates.internalNotes : existing.internal_notes
  const nextFollowUpAt =
    updates.followUpAt === null
      ? null
      : updates.followUpAt
        ? new Date(updates.followUpAt).toISOString()
        : existing.follow_up_at
  const nextLastContactedAt =
    updates.touch === true
      ? new Date().toISOString()
      : updates.lastContactedAt
        ? new Date(updates.lastContactedAt).toISOString()
        : existing.last_contacted_at

  const [row] = await sql`
    UPDATE lead_submissions
    SET
      updated_at = NOW(),
      status = ${nextStatus},
      pipeline_stage = ${nextPipelineStage},
      priority = ${nextPriority},
      assigned_to = ${nextAssignedTo},
      internal_notes = ${nextInternalNotes},
      follow_up_at = ${nextFollowUpAt},
      last_contacted_at = ${nextLastContactedAt}
    WHERE id = ${leadId}
    RETURNING *
  `

  return normalizeLeadRow(row)
}

export async function getLeadSubmissionOverview() {
  const sql = getSql()

  const [counts] = await sql`
    SELECT
      COUNT(*)::INT AS total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::INT AS last_30_days,
      COUNT(*) FILTER (WHERE status = 'new')::INT AS open,
      COUNT(*) FILTER (WHERE pipeline_stage = 'qualified')::INT AS qualified,
      COUNT(*) FILTER (WHERE pipeline_stage = 'inspection')::INT AS inspections,
      COUNT(*) FILTER (WHERE pipeline_stage = 'quoted')::INT AS quoted,
      COUNT(*) FILTER (WHERE pipeline_stage = 'won')::INT AS won
    FROM lead_submissions
  `

  return (
    counts || {
      total: 0,
      last_30_days: 0,
      open: 0,
      qualified: 0,
      inspections: 0,
      quoted: 0,
      won: 0,
    }
  )
}

export async function getLeadPipelineSummary() {
  const sql = getSql()

  const rows = await sql`
    SELECT pipeline_stage, COUNT(*)::INT AS count
    FROM lead_submissions
    GROUP BY pipeline_stage
    ORDER BY
      CASE pipeline_stage
        WHEN 'new' THEN 1
        WHEN 'triage' THEN 2
        WHEN 'inspection' THEN 3
        WHEN 'quoted' THEN 4
        WHEN 'follow-up' THEN 5
        WHEN 'won' THEN 6
        WHEN 'lost' THEN 7
        ELSE 8
      END
  `

  return LEAD_PIPELINE_STAGES.map((stage) => ({
    stage,
    count: rows.find((row) => row.pipeline_stage === stage)?.count || 0,
  }))
}
