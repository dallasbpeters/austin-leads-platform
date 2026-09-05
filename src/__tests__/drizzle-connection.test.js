import { describe, expect, it } from 'vitest'

import { getDb } from '@/lib/db/drizzle-client'
import { christmasInvoices, solarQuotes } from '@/lib/db/drizzle/schema'

/*
 * Live connection check for the Drizzle client.
 *
 * Opt-in: the shared setup file stubs DATABASE_URL with 'postgres://stub' so
 * unit tests never touch a real database. Pass a real connection string in
 * DRIZZLE_TEST_DATABASE_URL to run these against it:
 *
 *   DRIZZLE_TEST_DATABASE_URL="$DATABASE_URL" pnpm test
 *
 * Without it the block skips, so CI stays green with no database.
 */
const liveUrl = process.env.DRIZZLE_TEST_DATABASE_URL
if (liveUrl) {
  process.env.DATABASE_URL = liveUrl
}
const maybe = liveUrl ? describe : describe.skip

maybe('drizzle client', () => {
  it('reads invoices through the generated schema', async () => {
    const rows = await getDb().select().from(christmasInvoices).limit(3)
    // Column names come from the generated schema, so an empty table still
    // proves the mapping by way of the query succeeding.
    expect(Array.isArray(rows)).toBeTruthy()
    expect(rows.every((row) => 'invoiceNumber' in row)).toBeTruthy()
  })

  it('reads quotes through the generated schema', async () => {
    const rows = await getDb().select().from(solarQuotes).limit(3)
    expect(Array.isArray(rows)).toBeTruthy()
  })

  it('reuses the shared pool rather than opening a second one', () => {
    expect(getDb()).toBe(getDb())
  })
})
