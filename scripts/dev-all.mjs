import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { stopDevServers } from './stop-dev.mjs'

const ENV_FILE = resolve(process.cwd(), '.env.development.local')
const ENV_KEY = 'STRIPE_WEBHOOK_SECRET'

/*
 * Pull the webhook signing secret from `stripe listen --print-secret` and
 * sync it into `.env.development.local`. The secret is stable across stripe
 * listen invocations within the same CLI session, but rotates whenever the
 * user runs `stripe login`, switches accounts, or has the CLI re-provision
 * its CLI webhook endpoint — so refreshing on every `pnpm run dev` keeps
 * STRIPE_WEBHOOK_SECRET in sync with the listener that will actually sign
 * events.
 *
 * Tolerant by design: if the Stripe CLI is missing, the user isn't logged
 * in, or the env file doesn't exist, we log a warning and let `next dev`
 * keep starting — webhook verification will fail loudly in /api/stripe/*
 * if the secret is stale, which is easier to diagnose than a silent abort
 * of the dev orchestrator.
 */
function refreshStripeWebhookSecret() {
  let result
  try {
    result = spawnSync('stripe', ['listen', '--print-secret'], {
      encoding: 'utf8',
      timeout: 10_000,
    })
  } catch (error) {
    console.warn(`[stripe] could not invoke stripe CLI: ${error.message}`)
    return
  }

  if (result.error || result.status !== 0) {
    const message = (result.stderr || result.error?.message || '').trim()
    console.warn(
      `[stripe] could not read webhook signing secret (${ENV_KEY} not updated).` +
        (message ? `\n[stripe] ${message}` : ''),
    )
    console.warn('[stripe] hint: run `stripe login` once, then retry `pnpm run dev`.')
    return
  }

  const match = result.stdout.match(/whsec_[A-Za-z0-9]+/)
  if (!match) {
    console.warn(`[stripe] no whsec_... value found in stripe CLI output; ${ENV_KEY} not updated.`)
    return
  }

  const secret = match[0]

  if (!existsSync(ENV_FILE)) {
    console.warn(`[stripe] ${ENV_FILE} not found; ${ENV_KEY} not written.`)
    return
  }

  const current = readFileSync(ENV_FILE, 'utf8')
  const line = `${ENV_KEY}=${secret}`
  const pattern = new RegExp(`^\\s*#?\\s*${ENV_KEY}=.*$`, 'm')
  const next = pattern.test(current) ? current.replace(pattern, line) : `${current.trimEnd()}\n${line}\n`

  if (next === current) {
    console.log(`[stripe] ${ENV_KEY} already up to date.`)
    return
  }

  writeFileSync(ENV_FILE, next)
  console.log(`[stripe] synced ${ENV_KEY}=${secret.slice(0, 12)}… into .env.development.local`)
}

stopDevServers()

await new Promise((resolve) => setTimeout(resolve, 800))

refreshStripeWebhookSecret()

const commands = [
  { name: 'next', args: ['run', 'dev:next'] },
  { name: 'studio', args: ['run', 'studio:dev'] },
  { name: 'stripe', args: ['run', 'stripe'] },
]

const children = commands.map(({ name, args }) => {
  const child = spawn('pnpm', args, {
    stdio: 'inherit',
    env: process.env,
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`${name} exited with signal ${signal}`)
    } else if (code && code !== 0) {
      console.log(`${name} exited with code ${code}`)
    }
  })

  return child
})

let shuttingDown = false

function shutdown(signal = 'SIGTERM') {
  if (shuttingDown) {
    return
  }

  shuttingDown = true

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal)
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGKILL')
      }
    }
  }, 500)
}

process.on('SIGINT', () => {
  shutdown('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  shutdown('SIGTERM')
  process.exit(0)
})

for (const child of children) {
  child.on('exit', (code) => {
    if (!shuttingDown && code && code !== 0) {
      shutdown('SIGTERM')
      process.exit(code)
    }
  })
}

await new Promise(() => {})
