/**
 * Pushes Stripe price ID env vars to Vercel.
 * Test IDs → development + preview
 * Live IDs → production
 *
 * Run:  pnpm tsx scripts/push-stripe-env-to-vercel.ts
 */

import fs from 'fs'
import path from 'path'

// Load .env.development.local
const envFile = path.resolve(process.cwd(), '.env.development.local')
const env: Record<string, string> = {}
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)$/)
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

const VERCEL_TOKEN = env.VERCEL_TOKEN
const PROJECT_ID   = env.VERCEL_PROJECT_ID

if (!VERCEL_TOKEN || !PROJECT_ID) {
  console.error('Missing VERCEL_TOKEN or VERCEL_PROJECT_ID in .env.development.local')
  process.exit(1)
}

const TEST_VARS: Record<string, string> = {
  STRIPE_PRICE_DEPOSIT:           env.STRIPE_PRICE_DEPOSIT,
  STRIPE_PRICE_XMAS_ROOFLINE:     env.STRIPE_PRICE_XMAS_ROOFLINE,
  STRIPE_PRICE_XMAS_FULL_FRONT:   env.STRIPE_PRICE_XMAS_FULL_FRONT,
  STRIPE_PRICE_XMAS_FULL_PROPERTY: env.STRIPE_PRICE_XMAS_FULL_PROPERTY,
}

// Live price IDs (original hardcoded values before env-var migration)
const LIVE_VARS: Record<string, string> = {
  STRIPE_PRICE_DEPOSIT:            'price_1TVbAOF2OBzUX92SrsR0ZEC8',
  STRIPE_PRICE_XMAS_ROOFLINE:      'price_1TVay2F2OBzUX92SPQEWM2hZ',
  STRIPE_PRICE_XMAS_FULL_FRONT:    'price_1TVawuF2OBzUX92SwcfBYgmc',
  STRIPE_PRICE_XMAS_FULL_PROPERTY: 'price_1TVavlF2OBzUX92SuAIbshCM',
}

async function upsertEnvVar(key: string, value: string, targets: string[]) {
  // Check if it already exists
  const listRes = await fetch(
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?decrypt=false`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  )
  const { envs = [] } = await listRes.json() as { envs: { id: string; key: string; target: string[] }[] }
  const existing = envs.filter((e) => e.key === key && targets.some((t) => e.target.includes(t)))

  // Delete existing entries for these targets first to avoid conflicts
  for (const e of existing) {
    await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env/${e.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    })
  }

  // Create new
  const res = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, value, target: targets, type: 'encrypted' }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Failed to set ${key}: ${JSON.stringify(err)}`)
  }
}

async function main() {
  console.log('Pushing Stripe price env vars to Vercel…\n')

  for (const [key, value] of Object.entries(TEST_VARS)) {
    await upsertEnvVar(key, value, ['development', 'preview'])
    console.log(`✓ ${key} → development, preview  (${value})`)
  }

  for (const [key, value] of Object.entries(LIVE_VARS)) {
    await upsertEnvVar(key, value, ['production'])
    console.log(`✓ ${key} → production             (${value})`)
  }

  console.log('\nDone. Redeploy or run `vercel env pull` to pick up changes locally.')
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
