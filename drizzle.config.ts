import { defineConfig } from 'drizzle-kit'

/*
 * Drizzle Kit configuration (introspection + migration generation).
 *
 * Connection-string precedence matches the runtime pool in src/lib/db/pool.js.
 * Unlike that pool, the URL is passed through untouched: the pool strips
 * `sslmode` because `pg` treats `sslmode=require` as `verify-full`, but
 * drizzle-kit fails to connect without it -- it stalls at "0 tables fetching"
 * and exits 1 with no message. `ssl: true` covers verification here instead.
 *
 * Do not add `strict: true`: it makes drizzle-kit wait on an interactive
 * confirmation, which hangs any non-TTY run in the same silent way.
 *
 * Commands (see package.json):
 *   pnpm db:pull      introspect the live schema into src/lib/db/drizzle
 *   pnpm db:generate  write a migration from schema changes
 *   pnpm db:studio    browse the database
 */

const DATABASE_URL_KEYS = [
  'DATABASE_URL',
  'STORAGEDB_POSTGRES_URL_NON_POOLING',
  'POSTGRES_URL_NON_POOLING',
  'STORAGEDB_POSTGRES_URL',
  'POSTGRES_URL',
  'NEON_DATABASE_URL',
]

const resolveDatabaseUrl = () => {
  for (const key of DATABASE_URL_KEYS) {
    const value = process.env[key]
    if (value?.trim()) {
      return value.trim()
    }
  }

  throw new Error(`No database connection string found. Set one of: ${DATABASE_URL_KEYS.join(', ')}`)
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/drizzle/schema.ts',
  out: './src/lib/db/drizzle',
  dbCredentials: {
    url: resolveDatabaseUrl(),
    ssl: true,
  },
})
