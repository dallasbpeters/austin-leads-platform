import { randomBytes } from 'node:crypto'

import { getSql } from '../db/pool.js'

/*
 * Saved reels — a name, the scene list, and the last finished render.
 *
 * Photos are stored as the picked Sanity asset (id, thumb, render URL) inside
 * each scene, so a reopened reel shows the same thumbnails without a lookup.
 */

async function runReelMigrations() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS christmas_reels (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL DEFAULT '',
      scenes        JSONB NOT NULL DEFAULT '[]'::jsonb,
      render_job_id TEXT,
      render_url    TEXT,
      rendered_at   TIMESTAMPTZ,
      created_by    TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS christmas_reels_updated_at_idx ON christmas_reels (updated_at DESC)`
}

const SCHEMA_PROMISE_KEY = '__christmasReelsSchemaReady_v1__'

async function migrateOnce() {
  try {
    await runReelMigrations()
  } catch (error) {
    globalThis[SCHEMA_PROMISE_KEY] = null
    throw error
  }
}

export function ensureReelTables() {
  if (!globalThis[SCHEMA_PROMISE_KEY]) {
    globalThis[SCHEMA_PROMISE_KEY] = migrateOnce()
  }
  return globalThis[SCHEMA_PROMISE_KEY]
}

const newId = () => `reel_${randomBytes(8).toString('hex')}`

const rowToReel = (row) =>
  row
    ? {
        id: row.id,
        title: row.title || '',
        scenes: Array.isArray(row.scenes) ? row.scenes : [],
        renderJobId: row.render_job_id || null,
        renderUrl: row.render_url || null,
        renderedAt: row.rendered_at || null,
        createdBy: row.created_by || null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null

/** Newest first. Scenes come along so the list can show a cover photo. */
export async function listReels({ limit = 60 } = {}) {
  const sql = getSql()
  const rows = await sql`SELECT * FROM christmas_reels ORDER BY updated_at DESC LIMIT ${limit}`
  return rows.map(rowToReel)
}

export async function getReel(id) {
  const sql = getSql()
  const rows = await sql`SELECT * FROM christmas_reels WHERE id = ${id} LIMIT 1`
  return rowToReel(rows[0])
}

export async function createReel({ title, scenes, createdBy }) {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO christmas_reels (id, title, scenes, created_by)
    VALUES (${newId()}, ${title || ''}, ${JSON.stringify(scenes)}, ${createdBy || null})
    RETURNING *
  `
  return rowToReel(rows[0])
}

export async function updateReel(id, { title, scenes }) {
  const sql = getSql()
  const rows = await sql`
    UPDATE christmas_reels SET
      title      = ${title || ''},
      scenes     = ${JSON.stringify(scenes)},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return rowToReel(rows[0])
}

/** Remembers the latest finished render so the reel reopens with its video. */
export async function recordRender(id, { jobId, url }) {
  const sql = getSql()
  const rows = await sql`
    UPDATE christmas_reels SET
      render_job_id = ${jobId || null},
      render_url    = ${url || null},
      rendered_at   = ${url ? new Date().toISOString() : null},
      updated_at    = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return rowToReel(rows[0])
}

export async function deleteReel(id) {
  const sql = getSql()
  await sql`DELETE FROM christmas_reels WHERE id = ${id}`
}
