import { createClient } from 'next-sanity'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { pages, sites } from '../src/lib/platform/fixtures.js'
import { withSectionKeys } from '../src/lib/sanity/keys.js'
import { normalizeRichTextFields } from '../src/lib/sanity/richTextFields.js'

// Load .env.local without requiring dotenv
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
  // .env.local not found — rely on existing env vars
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

const fixtureSiteSlug = 'texas-solar-and-roofing-pros'
const siteFixture = sites.find((site) => site.slug === fixtureSiteSlug)

if (!siteFixture) {
  console.error(`Could not find fixture site for ${fixtureSiteSlug}.`)
  process.exit(1)
}

async function ensureSite() {
  const existing = await client.fetch(
    `*[_type == "site" && (slug.current in $siteSlugs || primaryDomain == $primaryDomain)][0]{_id,"slug":slug.current}`,
    { siteSlugs: [fixtureSiteSlug], primaryDomain: siteFixture.primaryDomain },
  )

  if (existing?._id) {
    return existing
  }

  const created = await client.createIfNotExists({
    _id: siteFixture.id,
    _type: 'site',
    name: siteFixture.name,
    shortName: siteFixture.shortName,
    category: siteFixture.category,
    categoryLabel: siteFixture.categoryLabel,
    tier: siteFixture.tier,
    slug: {
      _type: 'slug',
      current: siteFixture.slug,
    },
    primaryDomain: siteFixture.primaryDomain,
    aliases: siteFixture.aliases,
    redirectTarget: siteFixture.redirectTarget,
    leadForm: siteFixture.leadForm,
    seo: siteFixture.seo,
    brand: siteFixture.brand,
    organization: siteFixture.organization,
  })

  return {
    _id: created._id,
    slug: siteFixture.slug,
  }
}

function toSanityDocument(page, siteId) {
  return {
    _id: page.id,
    _type: page.pageType === 'post' ? 'post' : 'page',
    title: page.title,
    description: page.description,
    site: {
      _type: 'reference',
      _ref: siteId,
    },
    pageType: page.pageType,
    templateLevel: page.templateLevel,
    slug: {
      _type: 'slug',
      current: page.slug || '/',
    },
    sections: withSectionKeys(normalizeRichTextFields(page.sections)),
  }
}

async function hasExistingPage(siteSlug, slug) {
  return client.fetch(
    `defined(*[_type in ["page", "post"] && site->slug.current == $siteSlug && slug.current == $slug][0]._id)`,
    { siteSlug, slug: slug || '/' },
  )
}

async function main() {
  const siteRecord = await ensureSite()
  const guidePages = pages.filter(
    (page) =>
      page.siteSlug === fixtureSiteSlug && (page.slug === 'guides' || page.slug.startsWith('guides/')),
  )

  let createdCount = 0
  let skippedCount = 0

  for (const page of guidePages) {
    const exists = await hasExistingPage(siteRecord.slug, page.slug)

    if (exists) {
      skippedCount += 1
      continue
    }

    await client.create(toSanityDocument(page, siteRecord._id))
    createdCount += 1
  }

  console.log(
    `Seeded ${createdCount} missing guide documents for ${siteRecord.slug}. Skipped ${skippedCount} existing guides.`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
