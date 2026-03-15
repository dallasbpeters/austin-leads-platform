import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from 'next-sanity'

import { pages } from '../src/lib/platform/fixtures.js'
import { withSectionKeys } from '../src/lib/sanity/keys.js'

try {
  const envPath = resolve(import.meta.dirname, '..', '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  // Rely on ambient env vars.
}

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

const targetSlugs = ['solar', 'roofing']
const siteSlugs = ['texas-solar-and-roofing-pros']

function getFixturePage(slug) {
  return pages.find((page) => page.siteSlug === 'texas-solar-and-roofing-pros' && page.slug === slug) ?? null
}

async function findDoc(slug) {
  return client.fetch(
    `*[
      _type in ["page", "servicePage", "locationPage"] &&
      site->slug.current in $siteSlugs &&
      slug.current == $slug
    ][0]{
      _id,
      _type,
      title,
      "slug": slug.current
    }`,
    { siteSlugs, slug },
  )
}

async function main() {
  let updated = 0

  for (const slug of targetSlugs) {
    const fixturePage = getFixturePage(slug)

    if (!fixturePage) {
      console.log(`Skipping ${slug}: fixture page not found.`)
      continue
    }

    const existingDoc = await findDoc(slug)

    if (!existingDoc?._id) {
      console.log(`Skipping ${slug}: Sanity document not found.`)
      continue
    }

    await client
      .patch(existingDoc._id)
      .set({
        title: fixturePage.title,
        description: fixturePage.description,
        pageType: fixturePage.pageType,
        templateLevel: fixturePage.templateLevel,
        sections: withSectionKeys(fixturePage.sections),
      })
      .commit()

    updated += 1
    console.log(`Updated ${slug} -> ${existingDoc._id}`)
  }

  console.log(`Done. Updated ${updated} service hub page(s).`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
