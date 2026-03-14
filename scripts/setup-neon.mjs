import {
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

async function main() {
  if (!hasLeadDatabase() && !hasDomainDatabase()) {
    throw new Error('DATABASE_URL or NEON_DATABASE_URL is not configured.')
  }

  if (hasLeadDatabase()) {
    await ensureLeadSubmissionsTable()
  }

  if (hasDomainDatabase()) {
    await ensureDomainRecordsTable()
    await seedInitialDomainRecords()
  }

  const overview = hasLeadDatabase() ? await getLeadSubmissionOverview() : null
  const domains = hasDomainDatabase() ? await listDomainRecordsDb() : []

  console.log(
    JSON.stringify(
      {
        ok: true,
        tables: ['lead_submissions', 'domain_records'],
        overview,
        domains: domains.length,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
