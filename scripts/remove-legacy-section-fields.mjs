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

const rawClient = client.withConfig({ perspective: 'raw' })
const LEGACY_FIELDS = ['heroBody', 'heroEyebrow', 'highlights', 'faq']
const TARGET_TYPES = ['page', 'post', 'servicePage', 'locationPage']

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key)
}

function addLegacyUnsetPaths(paths, target, basePath = '') {
  if (!target || typeof target !== 'object') return

  for (const field of LEGACY_FIELDS) {
    if (!hasOwn(target, field)) continue
    paths.push(basePath ? `${basePath}.${field}` : field)
  }
}

function toSectionPath(sectionKey) {
  return `sections[_key=="${sectionKey}"]`
}

async function main() {
  const docs = await rawClient.fetch(
    `*[_type in $types]{
      ...,
      sections[]{
        ...
      }
    }`,
    { types: TARGET_TYPES },
  )

  let updatedCount = 0
  let skippedCount = 0

  for (const doc of docs) {
    const unsetPaths = []

    addLegacyUnsetPaths(unsetPaths, doc)
    addLegacyUnsetPaths(unsetPaths, doc.detail, 'detail')

    const sections = Array.isArray(doc.sections) ? doc.sections : []
    for (const section of sections) {
      if (!section?._key) continue
      addLegacyUnsetPaths(unsetPaths, section, toSectionPath(section._key))
    }

    if (!unsetPaths.length) {
      skippedCount += 1
      continue
    }

    await client.patch(doc._id).unset(unsetPaths).commit()
    updatedCount += 1
    console.log(`Updated ${doc._id} (${doc._type}): removed ${unsetPaths.length} legacy fields`)
  }

  console.log(`Done. Updated ${updatedCount} docs, skipped ${skippedCount}.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
