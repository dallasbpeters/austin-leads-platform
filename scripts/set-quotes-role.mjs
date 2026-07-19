/*
 * Sets sales/ops users to role = 'quotes', keeping operator emails as admin.
 * Run: node --env-file=.env.development.local scripts/set-quotes-role.mjs
 *
 * Preserves admin for AUTH_ADMIN_EMAIL plus the emails in KEEP_ADMIN below.
 */

import { ensurePlatformUsersTable, normalizeEmail } from '../src/lib/auth/users.js'
import { getSql } from '../src/lib/db/pool.mjs'

const KEEP_ADMIN = new Set(
  [
    'dallaspeters@gmail.com',
    'admin@texassolarandroofing.com',
    'admin@texassolarandroofingpros.com',
    normalizeEmail(process.env.AUTH_ADMIN_EMAIL),
  ]
    .filter(Boolean)
    .map((email) => normalizeEmail(email)),
)

async function main() {
  await ensurePlatformUsersTable()
  const sql = getSql()
  const rows = await sql`SELECT id, email, role FROM platform_users`
  let toQuotes = 0
  let keptAdmin = 0

  for (const row of rows) {
    const email = normalizeEmail(row.email)
    if (KEEP_ADMIN.has(email)) {
      if (row.role !== 'admin') {
        await sql`UPDATE platform_users SET role = 'admin', updated_at = NOW() WHERE id = ${row.id}`
        console.log(`admin   ${email}`)
      } else {
        console.log(`keep    ${email} (admin)`)
      }
      keptAdmin += 1
      continue
    }
    if (row.role !== 'quotes') {
      await sql`UPDATE platform_users SET role = 'quotes', updated_at = NOW() WHERE id = ${row.id}`
      console.log(`quotes  ${email}`)
      toQuotes += 1
    } else {
      console.log(`ok      ${email} (quotes)`)
    }
  }

  console.log(`\nDone. Kept/set admin: ${keptAdmin}. Set to quotes: ${toQuotes}.`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
