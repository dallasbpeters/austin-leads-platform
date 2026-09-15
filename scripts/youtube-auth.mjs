#!/usr/bin/env node
/*
 * One-time YouTube consent. Prints YOUTUBE_REFRESH_TOKEN for .env.local.
 *
 *   node --env-file=.env.local scripts/youtube-auth.mjs
 *
 * Opens a loopback listener, prints a URL, waits for the redirect, exchanges the
 * code. No copy-pasting a code back: Google shut the out-of-band flow down in
 * 2022, and loopback is what replaced it for both Desktop and Web clients.
 *
 * WHY A SERVICE ACCOUNT CANNOT DO THIS: YouTube's Data API will not accept an
 * upload from one. A video has an owner, and a service account cannot own a
 * channel or be added to one. So neither service-account-key.json nor
 * balmy-vehicle-*.json helps here, however much access they have elsewhere.
 * The channel owner consents once; after that the refresh token runs unattended,
 * exactly like the Zoho one.
 *
 * Credentials: uses GOOGLE_OAUTH_CLIENT_ID/SECRET if set, otherwise falls back
 * to GOOGLE_BUSINESS_CLIENT_ID/SECRET — that client already lives in the same
 * Google Cloud project (420672616451), so it can carry the YouTube scope too.
 */
import { createServer } from 'node:http'

const PORT = Number(process.env.YOUTUBE_OAUTH_PORT || 8724)
const REDIRECT = `http://localhost:${PORT}/oauth2callback`
const SCOPE = 'https://www.googleapis.com/auth/youtube.upload'

const clientId = (process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_BUSINESS_CLIENT_ID || '').trim()
const clientSecret = (
  process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
  process.env.GOOGLE_BUSINESS_CLIENT_SECRET ||
  ''
).trim()
const reused = !process.env.GOOGLE_OAUTH_CLIENT_ID && Boolean(process.env.GOOGLE_BUSINESS_CLIENT_ID)

if (!clientId || !clientSecret) {
  console.error('No OAuth client found.')
  console.error('Set GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET, or reuse')
  console.error('GOOGLE_BUSINESS_CLIENT_ID / GOOGLE_BUSINESS_CLIENT_SECRET.')
  process.exit(1)
}

console.log(`client   ${clientId.slice(0, 24)}…${reused ? '  (reusing the Google Business client)' : ''}`)
console.log(`redirect ${REDIRECT}`)
console.log('\nBefore continuing, in Google Cloud Console for project 420672616451:')
console.log('  1. Enable "YouTube Data API v3".')
console.log(`  2. Add ${REDIRECT} to this client's Authorised redirect URIs.`)
console.log('  3. If the consent screen is in Testing, add the channel owner as a test user.\n')

const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
url.searchParams.set('client_id', clientId)
url.searchParams.set('redirect_uri', REDIRECT)
url.searchParams.set('response_type', 'code')
url.searchParams.set('scope', SCOPE)
url.searchParams.set('access_type', 'offline')
url.searchParams.set('prompt', 'consent') // forces a refresh_token even on re-consent
url.searchParams.set('include_granted_scopes', 'true')

console.log('Open this as the account that OWNS the channel:\n')
console.log(`${url.toString()}\n`)
console.log(`Waiting on ${REDIRECT} …  (ctrl-c to stop)`)

/* A one-shot HTTP listener has no async form to await — the callback IS the
   event. Wrapping it is the correct shape here, not a missed await. */
const waitForCode = () =>
  // oxlint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const incoming = new URL(req.url, `http://localhost:${PORT}`)
      if (incoming.pathname !== '/oauth2callback') {
        res.writeHead(404).end()
        return
      }
      const err = incoming.searchParams.get('error')
      const got = incoming.searchParams.get('code')
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(
        `<body style="font:16px system-ui;padding:3rem;background:#040a17;color:#fffcf5">${
          got
            ? 'Authorised. You can close this tab and go back to the terminal.'
            : `Failed: ${err || 'no code returned'}`
        }</body>`,
      )
      server.close()
      if (got) {
        resolve(got)
      } else {
        reject(new Error(err || 'no code returned'))
      }
    })
    server.listen(PORT)
    server.on('error', (error) => {
      /* A raw EADDRINUSE stack tells the operator nothing they can act on. */
      if (error.code === 'EADDRINUSE') {
        reject(
          new Error(
            `Port ${PORT} is already in use. Close whatever holds it, or run with ` +
              `YOUTUBE_OAUTH_PORT=<other> — and register that redirect URI too.`,
          ),
        )
        return
      }
      reject(error)
    })
  })

let code
try {
  code = await waitForCode()
} catch (error) {
  console.error(`\n${error instanceof Error ? error.message : error}`)
  process.exit(1)
}

const res = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT,
    grant_type: 'authorization_code',
  }).toString(),
})
const payload = await res.json().catch(() => ({}))

if (!payload.refresh_token) {
  console.error('\nNo refresh_token came back.')
  console.error(JSON.stringify(payload, null, 2))
  console.error('\nredirect_uri_mismatch  -> the URI above is not registered on the client.')
  console.error(
    'access_denied          -> the consent screen is in Testing and this account is not a test user.',
  )
  process.exit(1)
}

console.log('\nAdd to .env.local:\n')
console.log(`YOUTUBE_REFRESH_TOKEN=${payload.refresh_token}`)
if (reused) {
  console.log('\nThe upload script reuses the Google Business client automatically.')
}
console.log()
