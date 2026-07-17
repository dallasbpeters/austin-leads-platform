/*
 * Seeds platform users (admin console access).
 * Run: node --env-file=.env.development.local scripts/seed-users.mjs
 *
 * Idempotent: existing emails are skipped. New users get a random temp
 * password (printed once) — they can also sign in with Google/Zoho OAuth
 * using the same email, or an owner can reset passwords under /users.
 */

import { randomBytes } from 'node:crypto'

import { createUser, ensurePlatformUsersTable } from '../src/lib/auth/users.js'

const USERS = [
  { name: 'David', email: 'david@tx-christmaslights.com' },
  { name: 'David', email: 'david@texassolarandroofingpros.com' },
  { name: 'Fhilecya Moore', email: 'fhilecya@texassolarandroofingpros.com' },
  { name: 'Jameson', email: 'jameson@texassolarandroofingpros.com' },
  { name: 'Kathie Millen', email: 'kathie@texassolarandroofingpros.com' },
  { name: 'Rich', email: 'rich@texassolarandroofingpros.com' },
]

const tempPassword = () => randomBytes(9).toString('base64url')

async function main() {
  await ensurePlatformUsersTable()

  for (const { name, email } of USERS) {
    const password = tempPassword()
    try {
      const user = await createUser({ email, name, password, role: 'quotes', isActive: true })
      console.log(`created  ${user.email.padEnd(45)} temp password: ${password}`)
    } catch (error) {
      if (/already exists/i.test(error.message)) {
        console.log(`skipped  ${email.padEnd(45)} (already exists)`)
      } else {
        console.error(`FAILED   ${email.padEnd(45)} ${error.message}`)
        process.exitCode = 1
      }
    }
  }
}

main().then(() => process.exit(process.exitCode || 0))
