/**
 * Migrate legacy `costsSection` items from the kitchen-sink `pageItem` shape
 * to the focused `costStatItem` and `paybackSummaryItem` types.
 *
 * Walks every `page`, `post`, `servicePage`, and `locationPage` document, finds
 * `sections[]` entries of type `costsSection`, and rewrites:
 *
 *   • items[]          → { _type: 'costStatItem', _key, number, title, body }
 *   • secondaryItems[] → { _type: 'paybackSummaryItem', _key, title, body }
 *
 * Drops every other field that the costs section never reads.
 *
 * Idempotent: items already on the new types are left untouched.
 */
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    'Missing Sanity env. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.',
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

const TARGET_TYPES = ['page', 'post', 'servicePage', 'locationPage']

function pickCostStat(item) {
  if (!item || typeof item !== 'object') return null
  const number = typeof item.number === 'string' ? item.number : ''
  const title = typeof item.title === 'string' ? item.title : ''
  if (!number && !title) return null
  return {
    _type: 'costStatItem',
    _key: item._key,
    ...(number ? { number } : {}),
    ...(title ? { title } : {}),
    ...(item.body !== undefined ? { body: item.body } : {}),
  }
}

function pickPaybackSummary(item) {
  if (!item || typeof item !== 'object') return null
  const title = typeof item.title === 'string' ? item.title : ''
  if (!title) return null
  return {
    _type: 'paybackSummaryItem',
    _key: item._key,
    title,
    ...(item.body !== undefined ? { body: item.body } : {}),
  }
}

function migrateSection(section) {
  if (!section || section._type !== 'costsSection') return null

  let changed = false
  const next = { ...section }

  if (Array.isArray(section.items)) {
    const migrated = section.items
      .map((item) => {
        if (item?._type === 'costStatItem') return item
        const picked = pickCostStat(item)
        if (picked) changed = true
        return picked
      })
      .filter(Boolean)

    if (changed || migrated.length !== section.items.length) {
      next.items = migrated
      changed = true
    }
  }

  if (Array.isArray(section.secondaryItems)) {
    let secondaryChanged = false
    const migrated = section.secondaryItems
      .map((item) => {
        if (item?._type === 'paybackSummaryItem') return item
        const picked = pickPaybackSummary(item)
        if (picked) secondaryChanged = true
        return picked
      })
      .filter(Boolean)

    if (secondaryChanged || migrated.length !== section.secondaryItems.length) {
      next.secondaryItems = migrated
      changed = true
    }
  }

  return changed ? next : null
}

const docs = await client.fetch(
  `*[_type in $types && count(sections[_type == "costsSection"]) > 0]{
    _id,
    _type,
    title,
    sections
  }`,
  { types: TARGET_TYPES },
)

let migrated = 0

for (const doc of docs) {
  if (!Array.isArray(doc.sections)) continue

  let docChanged = false
  const nextSections = doc.sections.map((section) => {
    const migratedSection = migrateSection(section)
    if (migratedSection) {
      docChanged = true
      return migratedSection
    }
    return section
  })

  if (!docChanged) continue

  await client.patch(doc._id).set({ sections: nextSections }).commit()
  migrated += 1
  console.log(`Migrated costs items in ${doc.title || doc._id}`)
}

console.log(`Migrated ${migrated} document${migrated === 1 ? '' : 's'}.`)
