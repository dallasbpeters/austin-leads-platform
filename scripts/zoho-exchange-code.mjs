#!/usr/bin/env node
/*
 * Exchange a Zoho Self Client authorization code for a refresh token.
 *
 * Usage:
 *   node --env-file=.env.development.local scripts/zoho-exchange-code.mjs <CODE>
 *
 * Then paste the printed refresh_token into ZOHO_REFRESH_TOKEN and restart.
 */

const code = process.argv[2]?.trim()
if (!code) {
  console.error('Usage: node --env-file=.env.development.local scripts/zoho-exchange-code.mjs <CODE>')
  process.exit(1)
}

const clientId = process.env.ZOHO_CLIENT_ID?.trim()
const clientSecret = process.env.ZOHO_CLIENT_SECRET?.trim()
const accounts = (process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com').replace(/\/$/, '')

if (!clientId || !clientSecret) {
  console.error('Missing ZOHO_CLIENT_ID or ZOHO_CLIENT_SECRET in env.')
  process.exit(1)
}

const params = new URLSearchParams({
  grant_type: 'authorization_code',
  client_id: clientId,
  client_secret: clientSecret,
  code,
})

const response = await fetch(`${accounts}/oauth/v2/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params.toString(),
})
const payload = await response.json().catch(() => ({}))

if (!payload.refresh_token) {
  console.error('Exchange failed.')
  console.error(JSON.stringify(payload, null, 2))
  console.error(`
Tips:
- The code expires in ~1 minute — generate a fresh one in api-console.zoho.com
- Use the same Self Client that owns ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET
- Scopes (all required): ZohoSheet.dataAPI.UPDATE,ZohoSheet.dataAPI.READ,WorkDrive.files.CREATE,WorkDrive.files.READ
- If your Zoho org is not US, set ZOHO_ACCOUNTS_URL (e.g. https://accounts.zoho.eu)
`)
  process.exit(1)
}

console.log('Success. Add this to .env.development.local:\n')
console.log(`ZOHO_REFRESH_TOKEN=${payload.refresh_token}`)
console.log('\nThen restart the dev server and save a quote.')
