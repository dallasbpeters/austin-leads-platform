import { createClient } from '@sanity/client'
import { serviceAreaSection, serviceCityScrollSection } from '../src/lib/platform/service-coverage.js'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2025-10-21',
  useCdn: false,
  perspective: 'raw',
})

// Patch only these fields on existing versions. Never publish a draft or reseed a page.
const documents = await client.fetch(`*[
  _type in ["page", "servicePage"] &&
  !(_id in path("versions.**")) &&
  site->slug.current == "texas-solar-and-roofing-pros" &&
  slug.current in ["/", "services"]
]{_id, _rev, "slug": slug.current, sections[]{_key, type, _type, title, description, areas, linkedItems}}`)

let transaction = client.transaction()
const changes = []
for (const document of documents) {
  const type = document.slug === '/' ? 'serviceAreaMap' : 'scrollText'
  const section = document.sections?.find((item) => item.type === type || item._type === `${type}Section`)
  if (!section?._key) {
    throw new Error(`Missing ${type} section on ${document._id}; no changes applied.`)
  }
  const fields =
    type === 'serviceAreaMap'
      ? {
          title: serviceAreaSection.title,
          description: serviceAreaSection.description,
          areas: serviceAreaSection.areas,
        }
      : { linkedItems: serviceCityScrollSection.linkedItems }
  const path = `sections[_key==${JSON.stringify(section._key)}]`
  const set = Object.fromEntries(Object.entries(fields).map(([key, value]) => [`${path}.${key}`, value]))
  changes.push({
    id: document._id,
    revision: document._rev,
    before: Object.fromEntries(Object.keys(fields).map((key) => [key, section[key] ?? null])),
    set,
  })
  transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set(set))
}

const publishedSlugs = new Set(
  documents.filter((item) => !item._id.startsWith('drafts.')).map((item) => item.slug),
)
if (!publishedSlugs.has('/') || !publishedSlugs.has('services')) {
  throw new Error('Expected both the published homepage and services page; no changes applied.')
}

if (process.argv.includes('--apply')) {
  await transaction.commit()
  console.info(`Updated ${changes.length} existing page versions; no location drafts published.`)
} else {
  console.info(JSON.stringify(changes, null, 2))
  console.info('Dry run. Pass --apply to update these fields.')
}
