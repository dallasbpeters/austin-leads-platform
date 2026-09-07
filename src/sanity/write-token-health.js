/**
 * Checks that the Sanity write token is present and actually accepted.
 *
 * Every write path in this app degrades quietly when the token is wrong: the
 * write client is built as `null`, and callers fall back to a no-op or an
 * empty result. That is the right behaviour at the call site, but it means a
 * blank value, a revoked token and a working one all look identical from the
 * outside -- which has cost real debugging time. This module makes the
 * difference visible once, at startup.
 *
 * It never throws. A bad token must not take the site down, because most of
 * the app only reads.
 */

const TOKEN_NAME = 'SANITY_API_WRITE_TOKEN'

/* Sanity's own docs for @sanity/context name the variable differently in their
 * snippet. The package reads no environment variable itself, so the name that
 * matters here is whatever src/sanity/client.js reads -- but people arrive
 * from those docs, so say so rather than leaving them guessing. */
const DOC_ALIASES = ['SANITY_WRITE_TOKEN']

const PREFIX = '[sanity] write token'

/* Read straight from the environment rather than importing ./env, so this
 * module stays free of app wiring and can be exercised on its own. */
const getProjectId = () => process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'unknown project'

/** Cached across calls so the network check runs once per process. */
let checkPromise = null

/**
 * Asks Sanity whether a token is accepted, without touching any content.
 *
 * @param {string} token - The bearer token to test.
 * @returns {Promise<{ ok: boolean, status?: number, error?: string }>} The verdict.
 */
async function verifyToken(token) {
  try {
    const response = await fetch('https://api.sanity.io/v2021-06-07/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })

    return response.ok ? { ok: true } : { ok: false, status: response.status }
  } catch (error) {
    /* Offline or blocked egress is not the same as a bad token, so report it
     * separately rather than claiming the token is rejected. */
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Reports the state of the write token to the server log, once per process.
 *
 * @returns {Promise<{ ok: boolean, reason: string }>} What was found.
 */
export function checkSanityWriteToken() {
  if (checkPromise) {
    return checkPromise
  }

  checkPromise = (async () => {
    const token = process.env[TOKEN_NAME]

    if (!token) {
      const alias = DOC_ALIASES.find((name) => process.env[name])
      const hint = alias
        ? `Found ${alias} instead. This app reads ${TOKEN_NAME}; rename it or set both.`
        : `Add it to .env.local and .env.production.local, and to your Vercel project.`

      console.error(`${PREFIX}: ${TOKEN_NAME} is not set. Nothing can be written to Sanity. ${hint}`)
      return { ok: false, reason: 'missing' }
    }

    const verdict = await verifyToken(token)

    if (verdict.ok) {
      console.info(`${PREFIX}: accepted for project ${getProjectId()}.`)
      return { ok: true, reason: 'valid' }
    }

    if (verdict.status) {
      console.error(
        `${PREFIX}: rejected by Sanity with ${verdict.status}. The value is set but revoked, expired, ` +
          `or from another project. Mint a new one with Editor access and update every place it lives.`,
      )
      return { ok: false, reason: 'rejected' }
    }

    console.warn(`${PREFIX}: could not be verified (${verdict.error}). Writes may still work.`)
    return { ok: false, reason: 'unreachable' }
  })()

  return checkPromise
}
