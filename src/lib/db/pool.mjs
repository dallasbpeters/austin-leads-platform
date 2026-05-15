import pg from 'pg'

/*
 * ESM (.mjs) build of the shared pool helper so plain Node scripts run with
 * `node --env-file=.env.local …` can import it without the Next/webpack
 * resolver. Mirrors `./pool.js` exactly; keep both files in sync.
 *
 * See ./pool.js for the connection-string resolution order, SSL handling, and
 * pool caching strategy. Duplicated rather than imported to avoid forcing
 * Node scripts through the bundler's `.js`→ESM mapping.
 */

const SESSION_KEYS = ['STORAGEDB_POSTGRES_URL_NON_POOLING', 'POSTGRES_URL_NON_POOLING']
const POOLED_KEYS = ['STORAGEDB_POSTGRES_URL', 'POSTGRES_URL', 'NEON_DATABASE_URL']

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
