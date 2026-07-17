import {
  ensureLeadRoutingSettingsTable,
  ensureLeadSubmissionsTable,
  getLeadSubmissionOverview,
  hasLeadDatabase,
} from '../src/lib/leads/db.mjs'
import {
  ensureDomainRecordsTable,
  hasDomainDatabase,
  listDomainRecordsDb,
  seedInitialDomainRecords,
} from '../src/lib/platform/domain-db.js'

/*
 * Bootstraps every Postgres table the platform uses. Idempotent: every
 * `ensureXxx` helper uses `CREATE TABLE IF NOT EXISTS` and conditional
 * `ADD COLUMN IF NOT EXISTS` migrations, so running this against a fresh
 * Supabase database or an existing Neon database is safe.
 *
 * Driven by `pnpm db:setup` (see `package.json`). The connection string is
 * resolved by `src/lib/db/pool.mjs` from the standard env vars
 * (`DATABASE_URL`, `STORAGEDB_POSTGRES_URL_NON_POOLING`, etc.).
 */

async function main() {
  if (!hasLeadDatabase() && !hasDomainDatabase()) {
    throw new Error(
      'Database is not configured. Set DATABASE_URL or one of STORAGEDB_POSTGRES_URL_NON_POOLING / POSTGRES_URL.',
    )
  }

  const created = []

  if (hasLeadDatabase()) {
    await ensureLeadSubmissionsTable()
    created.push('lead_submissions')
    await ensureLeadRoutingSettingsTable()
    created.push('lead_routing_settings')

    // Christmas + auth helpers live in modules that import from the shared
    // pool but aren't `.mjs`-exported. Run their `ensureXxx` via dynamic
    // import so this script can stay in Node-only ESM land.
    const christmas = await import('../src/lib/christmas/db.js')
    await christmas.ensureChristmasTables()
    created.push('christmas_slots', 'christmas_jobs')

    const users = await import('../src/lib/auth/users.js')
    await users.ensurePlatformUsersTable()
    created.push('platform_users')

    const quotes = await import('../src/lib/quotes/db.js')
    await quotes.ensureQuotesTable()
    created.push('solar_quotes')
  }

  if (hasDomainDatabase()) {
    await ensureDomainRecordsTable()
    created.push('domain_records')
    await seedInitialDomainRecords()
  }

  const overview = hasLeadDatabase() ? await getLeadSubmissionOverview() : null
  const domains = hasDomainDatabase() ? await listDomainRecordsDb() : []

  console.log(
    JSON.stringify(
      {
        ok: true,
        tables: created,
        overview,
        domains: domains.length,
      },
      null,
      2,
    ),
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })
