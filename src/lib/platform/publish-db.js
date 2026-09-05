import { randomBytes } from 'node:crypto'

import { getSql, hasDatabaseUrl } from '../db/pool.js'

/*
 * Persistence for publish jobs.
 *
 * These previously lived in a module-level array seeded from fixtures, which
 * meant a job existed only inside the one server process that created it: any
 * restart reset the list, and on Vercel a follow-up request could land on a
 * different instance and not find the job at all. Jobs now live in Postgres
 * alongside quotes and invoices.
 *
 * Schema setup follows the same once-per-process pattern as
 * src/lib/christmas/invoice-db.js -- see the comment there for why.
 */

export function hasPublishDatabase() {
  return hasDatabaseUrl()
}

async function runPublishMigrations() {
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS publish_jobs (
      id             TEXT PRIMARY KEY,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      site_slug      TEXT NOT NULL,
      content_type   TEXT NOT NULL DEFAULT 'page',
      title          TEXT NOT NULL,
      prompt         TEXT NOT NULL DEFAULT '',
      sources        JSONB NOT NULL DEFAULT '[]'::jsonb,

      provider       TEXT,
      model          TEXT,

      status         TEXT NOT NULL DEFAULT 'queued',
      review_status  TEXT NOT NULL DEFAULT 'not_started',
      output         TEXT NOT NULL DEFAULT '',

      -- Result of the Sanity write, kept so the UI can show what happened
      -- rather than reporting success for a write that never landed.
      publish_result JSONB,
      error          TEXT
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS publish_jobs_updated_at_idx ON publish_jobs (updated_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS publish_jobs_site_slug_idx ON publish_jobs (site_slug)`
}

const SCHEMA_PROMISE_KEY = '__publishJobsSchemaReady__'

async function migrateOnce() {
  try {
    await runPublishMigrations()
  } catch (error) {
    globalThis[SCHEMA_PROMISE_KEY] = null
    throw error
  }
}

export function ensurePublishJobsTable() {
  if (!globalThis[SCHEMA_PROMISE_KEY]) {
    globalThis[SCHEMA_PROMISE_KEY] = migrateOnce()
  }

  return globalThis[SCHEMA_PROMISE_KEY]
}

const newId = () => `job_${randomBytes(8).toString('hex')}`

const rowToJob = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    siteSlug: row.site_slug,
    contentType: row.content_type,
    title: row.title,
    prompt: row.prompt,
    sources: row.sources || [],
    provider: row.provider,
    model: row.model,
    status: row.status,
    reviewStatus: row.review_status,
    output: row.output || '',
    publishResult: row.publish_result || null,
    error: row.error || null,
  }
}

export async function listPublishJobs({ limit = 100 } = {}) {
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM publish_jobs ORDER BY updated_at DESC LIMIT ${limit}
  `
  return rows.map(rowToJob)
}

export async function getPublishJob(id) {
  const sql = getSql()
  const rows = await sql`SELECT * FROM publish_jobs WHERE id = ${id} LIMIT 1`
  return rowToJob(rows[0])
}

export async function insertPublishJob(input) {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO publish_jobs (
      id, site_slug, content_type, title, prompt, sources, provider, model, status, review_status
    ) VALUES (
      ${newId()},
      ${input.siteSlug},
      ${input.contentType || 'page'},
      ${input.title || input.prompt || 'Untitled'},
      ${input.prompt || ''},
      ${JSON.stringify(input.sources ?? [])},
      ${input.provider || null},
      ${input.model || null},
      ${input.status || 'queued'},
      ${input.reviewStatus || 'not_started'}
    )
    RETURNING *
  `
  return rowToJob(rows[0])
}

/** Patches only the fields provided; anything omitted keeps its stored value. */
export async function updatePublishJob(id, patch) {
  const sql = getSql()
  const rows = await sql`
    UPDATE publish_jobs SET
      status         = COALESCE(${patch.status ?? null}, status),
      review_status  = COALESCE(${patch.reviewStatus ?? null}, review_status),
      output         = COALESCE(${patch.output ?? null}, output),
      provider       = COALESCE(${patch.provider ?? null}, provider),
      model          = COALESCE(${patch.model ?? null}, model),
      publish_result = COALESCE(${patch.publishResult ? JSON.stringify(patch.publishResult) : null}::jsonb, publish_result),
      error          = ${patch.error === undefined ? null : patch.error},
      updated_at     = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return rowToJob(rows[0])
}

export async function deletePublishJob(id) {
  const sql = getSql()
  await sql`DELETE FROM publish_jobs WHERE id = ${id}`
}
