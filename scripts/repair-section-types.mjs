import { createClient } from 'next-sanity'

import { normalizeSectionType, withSectionKeys } from '../src/lib/sanity/keys.js'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  throw new Error(
    'Missing Sanity env vars. Expected NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_WRITE_TOKEN.',
  )
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

const docs = await client.fetch(
  `*[
    _type in ["page", "servicePage", "locationPage", "post"] &&
    count(sections[
      !defined(_type) ||
      _type == "object" ||
      (_type == "pageSection" && type in ["hero", "resourceGrid", "guideGrid"])
    ]) > 0
  ]{
    _id,
    title,
    sections
  }`,
)

let repaired = 0

for (const doc of docs) {
  const nextSections = withSectionKeys((doc.sections || []).map(normalizeSectionType))
  const changed = JSON.stringify(nextSections) !== JSON.stringify(doc.sections || [])

  if (!changed) {
    continue
  }

  await client.patch(doc._id).set({ sections: nextSections }).commit()
  repaired += 1
  console.log(`Repaired section types for ${doc.title || doc._id}`)
}

console.log(`Repaired ${repaired} documents.`)
