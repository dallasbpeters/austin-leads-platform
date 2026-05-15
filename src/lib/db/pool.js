import pg from 'pg'

/*
 * Centralized Postgres pool + tagged-template `sql` shim for the platform.
 *
 * Replaces ad-hoc `@neondatabase/serverless` usage in `src/lib/leads/db.js`,
 * `src/lib/christmas/db.js`, `src/lib/auth/users.js`, and
 * `src/lib/platform/domain-db.js`. Uses raw TCP via `pg.Pool` so the runtime
 * is independent of Cloudflare-fronted HTTP database APIs.
 *
 * Connection-string resolution order (first non-empty wins):
 *   1. `DATABASE_URL`                          — explicit override.
 *   2. `STORAGEDB_POSTGRES_URL_NON_POOLING`    — Vercel-injected Supabase session pool (:5432).
 *   3. `STORAGEDB_POSTGRES_URL`                — Vercel-injected Supabase transaction pooler (:6543).
 *   4. `POSTGRES_URL_NON_POOLING`              — Neon-style legacy session URL.
 *   5. `POSTGRES_URL`                          — Neon-style legacy pooled URL.
 *   6. `NEON_DATABASE_URL`                     — even older alias.
 *
 * In production (Vercel) we prefer the pooled URL when available — pgbouncer
 * transaction mode handles serverless concurrency safely. Locally we prefer
 * the session pool so DDL (CREATE TABLE, ALTER TABLE) and prepared statements
 * behave normally.
 *
 * SSL: modern `pg` treats `sslmode=require` as `verify-full`, which fails
 * against Supabase's self-signed cert chain. We strip `sslmode=` and `supa=`
 * URL params and apply `{ ssl: { rejectUnauthorized: false } }` explicitly.
 */

const SESSION_KEYS = [
  'STORAGEDB_POSTGRES_URL_NON_POOLING',
  'POSTGRES_URL_NON_POOLING',
]

const POOLED_KEYS = [
  'STORAGEDB_POSTGRES_URL',
  'POSTGRES_URL',
  'NEON_DATABASE_URL',
]

function isProductionRuntime() {
  return (
    process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview')
  )
}

function firstNonEmpty(keys) {
  for (const key of keys) {
    const value = process.env[key]
    if (value && value.trim()) return value
  }
  return ''
}

export function getDatabaseUrl() {
  const explicit = process.env.DATABASE_URL
  if (explicit && explicit.trim()) return explicit

  const preferPooled = isProductionRuntime()
  const primary = preferPooled ? firstNonEmpty(POOLED_KEYS) : firstNonEmpty(SESSION_KEYS)
  if (primary) return primary

  return preferPooled ? firstNonEmpty(SESSION_KEYS) : firstNonEmpty(POOLED_KEYS)
}

export function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl())
}

function sanitizeConnectionString(raw) {
  if (!raw) return raw
  return raw
    .replace(/([?&])sslmode=[^&]*/g, '$1')
    .replace(/([?&])supa=[^&]*/g, '$1')
    .replace(/([?&])pgbouncer=[^&]*/g, '$1')
    .replace(/\?&/, '?')
    .replace(/[?&]+$/, '')
}

const globalForPg = globalThis

export function getPool() {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    throw new Error(
      'Database is not configured. Set DATABASE_URL, STORAGEDB_POSTGRES_URL_NON_POOLING, or POSTGRES_URL.',
    )
  }

  const connectionString = sanitizeConnectionString(databaseUrl)
  // Cache the pool per-connection-string so swapping providers in dev still works.
  const cacheKey = `__alpPgPool__${connectionString}`

  if (!globalForPg[cacheKey]) {
    globalForPg[cacheKey] = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
    })
  }

  return globalForPg[cacheKey]
}

/*
 * Returns a tagged-template `sql` function compatible with the prior
 * `@neondatabase/serverless` API. Each call hits the shared pool; values are
 * passed as positional parameters ($1, $2, …) so SQL injection is impossible.
 *
 * Example:
 *   const sql = getSql()
 *   const rows = await sql`SELECT * FROM lead_submissions WHERE id = ${id}`
 */
export function getSql() {
  const pool = getPool()
  return async function sql(strings, ...values) {
    const text = strings.reduce(
      (acc, chunk, index) => acc + chunk + (index < values.length ? `$${index + 1}` : ''),
      '',
    )
    const result = await pool.query(text, values)
    return result.rows
  }
}
