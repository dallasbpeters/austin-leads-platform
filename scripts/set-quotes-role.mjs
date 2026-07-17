/*
 * Sets every platform_users row to role = 'quotes'.
 * Run: node --env-file=.env.development.local scripts/set-quotes-role.mjs
 *
 * Break-glass AUTH_ADMIN_EMAIL / AUTH_ADMIN_PASSWORD still signs in as admin
 * even when no DB admin remains.
 */

import { ensurePlatformUsersTable } from '../src/lib/auth/users.js'
import { getSql } from '../src/lib/db/pool.mjs'

async function main() {
  await ensurePlatformUsersTable()
  const sql = getSql()
  const rows = await sql`
    UPDATE platform_users
    SET role = 'quotes', updated_at = NOW()
    WHERE role IS DISTINCT FROM 'quotes'
    RETURNING email, role
  `
  console.log(`Updated ${rows.length} user(s) to role=quotes`)
  for (const row of rows) {
    console.log(`  ${row.email}`)
  }
  if (rows.length === 0) {
    console.log('No changes — all users already quotes (or table empty).')
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
