import {
  ensureLeadSubmissionsTable,
  getLeadSubmissionOverview,
  hasLeadDatabase,
} from '../src/lib/leads/db.mjs'

async function main() {
  if (!hasLeadDatabase()) {
    throw new Error('DATABASE_URL or NEON_DATABASE_URL is not configured.')
  }

  await ensureLeadSubmissionsTable()
  const overview = await getLeadSubmissionOverview()

  console.log(
    JSON.stringify(
      {
        ok: true,
        table: 'lead_submissions',
        overview,
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
