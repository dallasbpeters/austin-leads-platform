import { createClient } from 'next-sanity'

import { withSectionKeys } from '../src/lib/sanity/keys.js'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const DOC_TYPES = ['page', 'servicePage', 'locationPage', 'post']

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error('SANITY_API_WRITE_TOKEN is required.')
  }

  const docs = await client.fetch(
    `*[_type in $types && defined(sections)]{_id,_type,title,sections}`,
    { types: DOC_TYPES },
  )

  let updated = 0

  for (const doc of docs) {
    const nextSections = withSectionKeys(doc.sections || [])
    const before = JSON.stringify(doc.sections || [])
    const after = JSON.stringify(nextSections)

    if (before === after) {
      continue
    }

    await client.patch(doc._id).set({ sections: nextSections }).commit()
    updated += 1
    console.log(`Updated ${doc._id}`)
  }

  console.log(`Done. Updated ${updated} documents.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
