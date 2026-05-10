/**
 * Migrate `faqSection` items from the legacy `faqItem` type to `pageFaqItem`.
 *
 * Walks every page-like document, finds `sections[]` entries of type
 * `faqSection`, and renames each item's `_type` from `faqItem` → `pageFaqItem`.
 *
 * Fields are preserved as-is — both types use the same `question` / `answer`
 * shape, so no field remapping is needed.
 *
 * Idempotent: items already typed as `pageFaqItem` are left untouched.
 * Includes draft documents via `perspective: 'raw'`.
 */
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    'Missing Sanity env vars. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.',
  )
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const TARGET_TYPES = ['page', 'post', 'servicePage', 'locationPage']

function migrateFaqItems(items) {
  if (!Array.isArray(items) || items.length === 0) return { items, changed: false }
  let changed = false
  const next = items.map((item) => {
    if (!item || item._type === 'pageFaqItem') return item
    if (item._type === 'faqItem') {
      changed = true
      return { ...item, _type: 'pageFaqItem' }
    }
    return item
  })
  return { items: next, changed }
}

const docs = await client.fetch(
  `*[_type in $types && count(sections[_type == "faqSection"]) > 0]{
    _id, _type, title, sections
  }`,
  { types: TARGET_TYPES },
  { perspective: 'raw' },
)

console.log(`Found ${docs.length} document${docs.length === 1 ? '' : 's'} with faqSection.`)

let migrated = 0

for (const doc of docs) {
  if (!Array.isArray(doc.sections)) continue

  let docChanged = false
  const nextSections = doc.sections.map((section) => {
    if (section?._type !== 'faqSection') return section

    const { items: nextItems, changed } = migrateFaqItems(section.items)
    if (!changed) return section

    docChanged = true
    return { ...section, items: nextItems }
  })

  if (!docChanged) continue

  await client.patch(doc._id).set({ sections: nextSections }).commit()
  migrated += 1
  console.log(`  ✓ Migrated FAQ items in "${doc.title || doc._id}"`)
}

console.log(`\nDone. Migrated ${migrated} document${migrated === 1 ? '' : 's'}.`)
