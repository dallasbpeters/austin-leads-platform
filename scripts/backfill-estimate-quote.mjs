/**
 * Makes the draft quote for a "See if solar is right for you" estimate that came
 * in before estimates made their own drafts (src/lib/quotes/from-estimate.js).
 * Skips an estimate that already has a draft, so it is safe to run twice.
 *
 *   node --env-file=.env.local --import tsx scripts/backfill-estimate-quote.mjs <lead id>
 *
 * Add --dry-run to print the quote fields without saving.
 */
import { createClient } from '@sanity/client'

import { getSql } from '../src/lib/db/pool.js'
import { createDraftQuoteFromEstimate, estimateToQuoteInputs } from '../src/lib/quotes/from-estimate.js'
import { placeLocation, roofAt } from '../src/lib/solar-fit/google.js'
import { resolveModel } from '../src/lib/solar-fit/model.js'

const leadId = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
const dryRun = process.argv.includes('--dry-run')
if (!leadId) {
  console.error('Usage: backfill-estimate-quote.mjs <lead id> [--dry-run]')
  process.exit(1)
}

const sql = getSql()
const [lead] = await sql`SELECT * FROM lead_submissions WHERE id = ${leadId} AND source_type = 'solar-fit'`
if (!lead) {
  console.error(`No solar-fit estimate with id ${leadId}.`)
  process.exit(1)
}
const [existing] = await sql`
  SELECT quote_number FROM solar_quotes WHERE data -> 'inputs' ->> 'estimateLeadId' = ${leadId} LIMIT 1
`
if (existing) {
  console.log(`Estimate ${leadId} already has draft quote ${existing.quote_number}. Nothing to do.`)
  process.exit(0)
}

// The model the estimate was scored with: the published "See if solar is right for you" section.
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xuhfhjna',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-08-15',
  useCdn: false,
  perspective: 'published',
})
const section =
  await sanity.fetch(`*[count(sections[defined(fitOutputs)]) > 0][0].sections[defined(fitOutputs)][0]{
  fitInputs[]{ key, label, kind, defaultValue, min, max, step, prefix, suffix, options[]{ label, value } },
  fitConstants[]{ key, label, value },
  fitOutputs[]{ key, label, formula, format }
}`)
const model = resolveModel(section)

const metadata = lead.metadata || {}
const address = String(lead.notes || '').replace(/^Address:\s*/, '')
let fullRoof = null
if (metadata.roof?.placeId) {
  const place = await placeLocation(metadata.roof.placeId)
  fullRoof = await roofAt(place.lat, place.lng)
}

const estimate = {
  lead: { fullName: lead.full_name, email: lead.email, phone: lead.phone, address },
  model,
  answers: metadata.answers || {},
  results: metadata.results || {},
  roof: metadata.roof || {},
  leadId,
}

if (dryRun) {
  const { systemLayoutUrl, ...fields } = estimateToQuoteInputs(estimate)
  console.log({ ...fields, roofFound: Boolean(fullRoof), systemLayoutUrl: systemLayoutUrl ? '(image)' : '' })
  process.exit(0)
}

const result = await createDraftQuoteFromEstimate({
  ...estimate,
  fullRoof,
  panelCount: metadata.roof?.roofPanels || 0,
})
console.log(result)
process.exit(result.status === 'created' ? 0 : 1)
