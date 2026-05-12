/**
 * One-off script — creates Christmas Lights products + prices in Stripe test mode.
 * Run from project root:  pnpm tsx scripts/create-test-stripe-products.ts
 *
 * Paste the printed price IDs into src/lib/stripe/products.ts when done.
 */

import fs from 'fs'
import path from 'path'
import Stripe from 'stripe'

// Load .env.development.local so tsx doesn't need dotenv
const envFile = path.resolve(process.cwd(), '.env.development.local')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)$/)
    if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' })

const PRODUCTS = [
  {
    id: 'deposit',
    name: 'Installation Deposit',
    description: 'Deposit to secure your holiday light installation window',
    priceInCents: 15000,
  },
  {
    id: 'xmas-roofline',
    name: 'Roofline Installation',
    description: 'Roofline, gutter runs, and front entry',
    priceInCents: 30000,
  },
  {
    id: 'xmas-full-front',
    name: 'Full Front Installation',
    description: 'Roofline plus trees, bushes, and walkways',
    priceInCents: 50000,
  },
  {
    id: 'xmas-full-property',
    name: 'Full Property Installation',
    description: 'Full front and rear — quoted on walkthrough',
    priceInCents: 100000,
  },
]

async function main() {
  console.log('Creating products in Stripe test mode…\n')

  const results: Record<string, string> = {}

  for (const p of PRODUCTS) {
    const product = await stripe.products.create({
      name: p.name,
      description: p.description,
    })

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.priceInCents,
      currency: 'usd',
    })

    results[p.id] = price.id
    console.log(`✓ ${p.name}`)
    console.log(`  product: ${product.id}`)
    console.log(`  price:   ${price.id}\n`)
  }

  console.log('─'.repeat(60))
  console.log('Update src/lib/stripe/products.ts with these price IDs:\n')
  for (const [id, priceId] of Object.entries(results)) {
    console.log(`  ${id.padEnd(22)} → ${priceId}`)
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
