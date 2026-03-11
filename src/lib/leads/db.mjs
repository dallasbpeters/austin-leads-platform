import { neon } from "@neondatabase/serverless";

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "";
}

export function hasLeadDatabase() {
  return Boolean(getDatabaseUrl());
}

function getSql() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error("Lead database is not configured.");
  }

  return neon(databaseUrl);
}

export async function ensureLeadSubmissionsTable() {
  const sql = getSql();

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
  `;

  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new'`;
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'`;
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS assigned_to TEXT`;
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ`;
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ`;
  await sql`ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS internal_notes TEXT`;
}

export async function getLeadSubmissionOverview() {
  const sql = getSql();

  const [counts] = await sql`
    SELECT
      COUNT(*)::INT AS total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::INT AS last_30_days,
      COUNT(*) FILTER (WHERE status = 'new')::INT AS open
    FROM lead_submissions
  `;

  return counts || { total: 0, last_30_days: 0, open: 0 };
}
