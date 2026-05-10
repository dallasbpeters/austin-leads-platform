/**
 * Migrate legacy `gallerySection.images[]` items from `uploadedImage` to the
 * dedicated `galleryImage` type that carries gallery-specific metadata
 * (neighborhood, year, package).
 *
 * Walks every `page`, `post`, `servicePage`, and `locationPage` document, finds
 * `sections[]` entries of type `gallerySection`, and rewrites each `images[]`
 * item whose `_type === 'uploadedImage'` to `_type: 'galleryImage'`. All other
 * fields (asset, crop, hotspot, altText, alt) are preserved.
 *
 * Runs against both published and draft versions via the `raw` perspective so
 * the editor doesn't keep seeing the "schema does not declare items of type
 * uploadedImage" warning on drafts.
 *
 * Idempotent: items already on `galleryImage` are left untouched.
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
  perspective: 'raw',
})

const TARGET_TYPES = ['page', 'post', 'servicePage', 'locationPage']
const LEGACY_IMAGE_TYPE = 'uploadedImage'
const NEW_IMAGE_TYPE = 'galleryImage'

function migrateImage(item) {
  if (!item || typeof item !== 'object') return { item, changed: false }
  if (item._type !== LEGACY_IMAGE_TYPE) return { item, changed: false }
  return { item: { ...item, _type: NEW_IMAGE_TYPE }, changed: true }
}

function migrateSection(section) {
  if (!section || section._type !== 'gallerySection') return null
  if (!Array.isArray(section.images)) return null

  let changed = false
  const nextImages = section.images.map((image) => {
    const result = migrateImage(image)
    if (result.changed) changed = true
    return result.item
  })

  if (!changed) return null
  return { ...section, images: nextImages }
}

const docs = await client.fetch(
  `*[_type in $types && count(sections[_type == "gallerySection" && count(images[_type == "${LEGACY_IMAGE_TYPE}"]) > 0]) > 0]{
    _id,
    _type,
    title,
    sections
  }`,
  { types: TARGET_TYPES },
)

console.log(`Found ${docs.length} document(s) with legacy gallery image items.`)

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
  console.log(`Migrated gallery images in ${doc._id}${doc.title ? ` (${doc.title})` : ''}`)
}

console.log(`Migrated ${migrated} document${migrated === 1 ? '' : 's'}.`)
