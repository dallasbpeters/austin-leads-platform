/**
 * Migrate `serviceGridSection` items from the generic `pageItem` shape to the
 * focused `serviceGridItem` type.
 *
 * Walks every `page`, `post`, `servicePage`, and `locationPage` document, finds
 * `sections[]` entries of type `serviceGridSection`, and rewrites each item in:
 *
 *   • items[]          → { _type: 'serviceGridItem', … }
 *   • roofingItems[]   → { _type: 'serviceGridItem', … }
 *   • secondaryItems[] → { _type: 'serviceGridItem', … }
 *
 * Only the fields the component actually reads are kept:
 *   title, eyebrow, number, body, icon, href, imageAsset, imageUrl
 *
 * Idempotent: items already typed as `serviceGridItem` are left untouched.
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

function pickServiceGridItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }
  return {
    _type: 'serviceGridItem',
    _key: item._key,
    ...(item.title !== undefined ? { title: item.title } : {}),
    ...(item.eyebrow !== undefined ? { eyebrow: item.eyebrow } : {}),
    ...(item.number !== undefined ? { number: item.number } : {}),
    ...(item.body !== undefined ? { body: item.body } : {}),
    ...(item.icon !== undefined ? { icon: item.icon } : {}),
    ...(item.href !== undefined ? { href: item.href } : {}),
    ...(item.imageAsset !== undefined ? { imageAsset: item.imageAsset } : {}),
    ...(item.imageUrl !== undefined ? { imageUrl: item.imageUrl } : {}),
  }
}

function migrateItemArray(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { items, changed: false }
  }
  let changed = false
  const next = items
    .map((item) => {
      if (item?._type === 'serviceGridItem') {
        return item
      }
      changed = true
      return pickServiceGridItem(item)
    })
    .filter(Boolean)
  return { items: next, changed }
}

function migrateSection(section) {
  if (!section || section._type !== 'serviceGridSection') {
    return null
  }

  let changed = false
  const next = { ...section }

  const primary = migrateItemArray(section.items)
  if (primary.changed) {
    next.items = primary.items
    changed = true
  }

  const roofing = migrateItemArray(section.roofingItems)
  if (roofing.changed) {
    next.roofingItems = roofing.items
    changed = true
  }

  const secondary = migrateItemArray(section.secondaryItems)
  if (secondary.changed) {
    next.secondaryItems = secondary.items
    changed = true
  }

  return changed ? next : null
}

// Use perspective: 'raw' to include draft documents
const docs = await client.fetch(
  `*[_type in $types && count(sections[_type == "serviceGridSection"]) > 0]{
    _id, _type, title, sections
  }`,
  { types: TARGET_TYPES },
  { perspective: 'raw' },
)

console.log(`Found ${docs.length} document${docs.length === 1 ? '' : 's'} with serviceGridSection.`)

let migrated = 0

for (const doc of docs) {
  if (!Array.isArray(doc.sections)) {
    continue
  }

  let docChanged = false
  const nextSections = doc.sections.map((section) => {
    const migratedSection = migrateSection(section)
    if (migratedSection) {
      docChanged = true
      return migratedSection
    }
    return section
  })

  if (!docChanged) {
    continue
  }

  await client.patch(doc._id).set({ sections: nextSections }).commit()
  migrated += 1
  console.log(`  ✓ Migrated service grid items in "${doc.title || doc._id}"`)
}

console.log(`\nDone. Migrated ${migrated} document${migrated === 1 ? '' : 's'}.`)
