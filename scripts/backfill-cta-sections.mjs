/**
 * Adds the consultation CTA block to every content page that does not have one,
 * filled with the copy that page renders today.
 *
 * Until now that copy lived in SECTION_VARIANTS inside consultation-section.jsx,
 * so editors could not touch it. This writes the same words into Sanity as a
 * `ctaSection`, after which the component's built-in defaults only ever act as
 * a fallback for a page nobody has filled in.
 *
 * Dry run by default. Pass --apply to write.
 */
import { randomUUID } from 'node:crypto'

import { createClient } from 'next-sanity'

import { roofingServices } from '../src/lib/platform/service-catalog.js'

const APPLY = process.argv.includes('--apply')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: APPLY ? process.env.SANITY_API_WRITE_TOKEN : process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  apiVersion: '2025-10-21',
})

/* The exact copy consultation-section.jsx renders today, per variant. */
const VARIANTS = {
  default: {
    title: "Tell us what's going on with your house",
    ctaLabel: 'Set up a free call',
    body: "Tell us about your roof, your bill, or the storm that just came through. We'll say what's worth doing, what isn't, and what it costs.",
  },
  roofingInspection: {
    title: 'Request a roof inspection',
    ctaLabel: 'Request Free Inspection',
    body: "Tell us what you're seeing. We'll say plainly whether it's a repair, a replacement, or an insurance claim.",
  },
  christmasLights: {
    title: 'Secure your install date',
    ctaLabel: 'Reserve My Install Date',
    body: 'Spots fill up fast. A small deposit reserves your install window — we handle the hanging, any mid-season bulb issues, and full takedown after the holidays.',
  },
}

/* Pages that should not push for a consultation. */
const SKIP_SLUGS = new Set(['privacy-policy', 'terms', 'thank-you'])
const SKIP_TYPES = new Set(['launchChecklist'])

const roofingSlugs = new Set(roofingServices.map((service) => service.slug))

/** Mirrors the routing logic in sections/cta-section.jsx. */
function resolveVariant(slug, site) {
  if (site === 'txchristmaslights') {
    return 'christmasLights'
  }
  const segments = String(slug || '')
    .split('/')
    .filter(Boolean)
  const [top, second] = segments
  if (top === 'roofing' || top === 'hail-damage' || (top === 'services' && roofingSlugs.has(second))) {
    return 'roofingInspection'
  }
  return 'default'
}

/** Wraps a plain sentence in the Portable Text shape `portableTextSimple` stores. */
function toPortableText(text) {
  return [
    {
      _key: randomUUID().replaceAll('-', '').slice(0, 12),
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [{ _key: randomUUID().replaceAll('-', '').slice(0, 12), _type: 'span', marks: [], text }],
    },
  ]
}

function buildBlock(variantKey) {
  const variant = VARIANTS[variantKey]
  return {
    _key: `cta-${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    _type: 'ctaSection',
    type: 'cta',
    title: variant.title,
    ctaLabel: variant.ctaLabel,
    body: toPortableText(variant.body),
  }
}

const docs = await client.fetch(`*[defined(sections) && !(_id in path('drafts.**'))]{
  _id, _type, 'slug': slug.current, 'site': site->slug.current,
  'hasCta': count(sections[_type=='ctaSection']) > 0
} | order(_type asc, slug asc)`)

const targets = docs.filter(
  (d) =>
    !d.hasCta &&
    !SKIP_TYPES.has(d._type) &&
    !SKIP_SLUGS.has(
      String(d.slug || '')
        .split('/')
        .pop(),
    ),
)

const skipped = docs.filter(
  (d) =>
    !d.hasCta &&
    (SKIP_TYPES.has(d._type) ||
      SKIP_SLUGS.has(
        String(d.slug || '')
          .split('/')
          .pop(),
      )),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — documents with sections: ${docs.length}`)
console.log(`  already have a CTA: ${docs.filter((d) => d.hasCta).length}`)
console.log(`  will receive one:   ${targets.length}`)
console.log(`  deliberately skipped: ${skipped.length}\n`)

for (const d of skipped) console.log(`  skip  ${String(d._type).padEnd(14)} /${d.slug || ''}`)
if (skipped.length) console.log('')

/* Drafts carry their own copy of sections, so a page open in the Studio would
 * otherwise show the old state and overwrite the patch on publish. */
const draftIds = targets.map((d) => `drafts.${d._id}`)
const existingDrafts = new Set((await client.fetch(`*[_id in $ids]._id`, { ids: draftIds })) || [])

let planned = 0
const tx = client.transaction()

for (const d of targets) {
  const variantKey = resolveVariant(d.slug, d.site)
  const block = buildBlock(variantKey)
  console.log(`  add   ${String(d._type).padEnd(14)} /${String(d.slug || '').padEnd(46)} ${variantKey}`)
  console.log(`        "${block.title}" / "${block.ctaLabel}"`)

  const ids = [d._id, ...(existingDrafts.has(`drafts.${d._id}`) ? [`drafts.${d._id}`] : [])]
  for (const id of ids) {
    planned += 1
    if (APPLY) {
      tx.patch(id, (p) => p.setIfMissing({ sections: [] }).append('sections', [block]))
    }
  }
}

console.log(`\npatches ${APPLY ? 'to commit' : 'planned'}: ${planned}`)

if (APPLY) {
  await tx.commit()
  console.log('committed.')
} else {
  console.log('no changes written. re-run with --apply')
}
