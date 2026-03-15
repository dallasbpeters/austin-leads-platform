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

const siteSlugs = ['texas-solar-and-roofing-pros']

function getHomepageFixture() {
  return (
    pages.find((page) => page.siteSlug === 'texas-solar-and-roofing-pros' && page.pageType === 'home') ?? null
  )
}

async function findHomepageDoc() {
  return client.fetch(
    `*[
      _type in ["page", "servicePage", "locationPage"] &&
      site->slug.current in $siteSlugs &&
      slug.current == "/"
    ][0]{
      _id,
      _type,
      title,
      "slug": slug.current,
      sections[]{
        _key,
        _type,
        type,
        title,
        body,
        icon,
        href,
        image,
        imageAsset,
        items[]{
          _key,
          _type,
          icon,
          title,
          body,
          answer,
          href,
          image,
          imageAsset
        }
      }
    }`,
    { siteSlugs },
  )
}

function getSectionType(section) {
  return section?.type || (section?._type === 'resourceGridSection' ? 'resourceGrid' : null)
}

function mergeHomepageSections(fixtureSections, existingSections) {
  const existingResourceGrid = (existingSections || []).find(
    (section) => getSectionType(section) === 'resourceGrid',
  )
  const fixtureResourceGrid = (fixtureSections || []).find((section) => section.type === 'resourceGrid')

  return (fixtureSections || []).map((section) => {
    if (section.type !== 'resourceGrid') {
      return section
    }

    if (existingResourceGrid?.items?.length) {
      return {
        ...section,
        ...existingResourceGrid,
        type: 'resourceGrid',
      }
    }

    return fixtureResourceGrid || section
  })
}

async function main() {
  const fixturePage = getHomepageFixture()

  if (!fixturePage) {
    console.error('Homepage fixture not found for texas-solar-and-roofing-pros.')
    process.exit(1)
  }

  const existingDoc = await findHomepageDoc()

  if (!existingDoc?._id) {
    console.error('Homepage Sanity document not found.')
    process.exit(1)
  }

  const mergedSections = mergeHomepageSections(fixturePage.sections, existingDoc.sections)

  await client.patch(existingDoc._id).set({
    title: fixturePage.title,
    description: fixturePage.description,
    pageType: fixturePage.pageType,
    templateLevel: fixturePage.templateLevel,
    sections: withSectionKeys(mergedSections),
  }).unset([
    'heroEyebrow',
    'heroTitle',
    'heroTitlePrimary',
    'heroTitleAccent',
    'heroBody',
    'cardCopy',
    'heroGradient',
    'heroTextColor',
    'heroOverlayColor',
    'heroOverlayStartColor',
    'heroOverlayEndColor',
    'heroOverlayDirection',
    'heroOverlayStartOpacity',
    'heroOverlayEndOpacity',
    'heroOverlayOpacity',
    'heroImage',
    'heroAsset',
    'heroSlides',
    'heroMetrics',
    'heroActions',
  ]).commit()

  console.log(`Updated homepage -> ${existingDoc._id}`)
  console.log(`Sections synced: ${mergedSections.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
