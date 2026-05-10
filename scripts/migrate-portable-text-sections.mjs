import { createClient } from 'next-sanity'

import { normalizeRichTextFields } from '../src/lib/sanity/richTextFields.js'
import { withSectionKeys } from '../src/lib/sanity/keys.js'

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

async function main() {
  const docs = await rawClient.fetch(
    `*[_type in ["page", "servicePage", "locationPage", "post"] && defined(sections)]{
      _id,
      _type,
      title,
      sections
    }`,
  )

  let updatedCount = 0
  let skippedCount = 0

  for (const doc of docs) {
    const originalSections = Array.isArray(doc.sections) ? doc.sections : []
    const normalizedSections = withSectionKeys(normalizeRichTextFields(originalSections))

    const originalJson = JSON.stringify(originalSections)
    const nextJson = JSON.stringify(normalizedSections)
    if (originalJson === nextJson) {
      skippedCount += 1
      continue
    }

    await client.patch(doc._id).set({ sections: normalizedSections }).commit({ autoGenerateArrayKeys: false })

    updatedCount += 1
    console.log(`Updated ${doc._id} (${doc._type}): ${doc.title || 'Untitled'}`)
  }

  console.log(`Migration complete. Updated ${updatedCount} documents. Skipped ${skippedCount}.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
