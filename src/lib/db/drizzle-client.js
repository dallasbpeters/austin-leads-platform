/*
 * Drizzle client.
 *
 * Deliberately built on the pool from ./pool.js rather than opening its own
 * connection: the app already runs raw-SQL queries through that pool (see
 * src/lib/christmas/invoice-db.js, src/lib/quotes/db.js), and a second pool
 * would double the connection count against the same database for no benefit.
 * Drizzle and the raw `sql` template therefore share sockets and settings.
 *
 * The client is cached on globalThis so dev hot-reloads reuse it, matching how
 * getPool() caches the pool itself.
 *
 * Usage:
 *   import { getDb } from '@/lib/db/drizzle-client'
 *   import { christmasInvoices } from '@/lib/db/drizzle/schema'
 *   import { eq } from 'drizzle-orm'
 *
 *   const db = getDb()
 *   const rows = await db.select().from(christmasInvoices).limit(10)
 *
 * This sits alongside the existing raw-SQL modules; it does not replace them.
 * Nothing is migrated to Drizzle yet.
 */

import { drizzle } from 'drizzle-orm/node-postgres'

import * as relations from './drizzle/relations'
import * as schema from './drizzle/schema'
import { getPool, hasDatabaseUrl } from './pool.js'

const DRIZZLE_CACHE_KEY = '__alpDrizzleDb__'

export function hasDrizzleDatabase() {
  return hasDatabaseUrl()
}

export function getDb() {
  if (!globalThis[DRIZZLE_CACHE_KEY]) {
    globalThis[DRIZZLE_CACHE_KEY] = drizzle(getPool(), {
      schema: { ...schema, ...relations },
      casing: 'snake_case',
    })
  }

  return globalThis[DRIZZLE_CACHE_KEY]
}

export { relations, schema }
