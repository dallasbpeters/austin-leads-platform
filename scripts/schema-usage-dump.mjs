import { createClient } from 'next-sanity'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-10-21',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
})
const docs = await client.fetch(
  `*[_type in ["page","servicePage","locationPage"] && !(_id in path("drafts.**"))]{_type, "slug": slug.current, sections}`,
)
const sectionFields = {} // sectionType -> field -> count of sections with a non-empty value
const itemFields = {} // sectionType -> item field -> count
const sectionCount = {}
const nonEmpty = (v) =>
  !(
    v === null ||
    v === undefined ||
    v === '' ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === 'object' &&
      !Array.isArray(v) &&
      Object.keys(v).filter((k) => !k.startsWith('_')).length === 0)
  )
for (const d of docs)
  for (const s of d.sections || []) {
    const t = s._type
    sectionCount[t] = (sectionCount[t] || 0) + 1
    sectionFields[t] ??= {}
    itemFields[t] ??= {}
    for (const [k, v] of Object.entries(s))
      if (!k.startsWith('_') && nonEmpty(v)) sectionFields[t][k] = (sectionFields[t][k] || 0) + 1
    for (const key of [
      'items',
      'secondaryItems',
      'actions',
      'metrics',
      'steps',
      'slides',
      'images',
      'cards',
      'logos',
      'points',
      'series',
    ])
      for (const it of Array.isArray(s[key]) ? s[key] : [])
        if (it && typeof it === 'object')
          for (const [k, v] of Object.entries(it))
            if (!k.startsWith('_') && nonEmpty(v))
              itemFields[t][`${key}.${k}`] = (itemFields[t][`${key}.${k}`] || 0) + 1
  }
const out = { docs: docs.length, sectionCount, sectionFields, itemFields }
process.stdout.write(JSON.stringify(out))
