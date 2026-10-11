/**
 * Move the two legacy guide images off the deleted Supabase storage project and
 * onto Sanity image assets.
 *
 * Two solar guides (`guides/how-solar-works-texas`, `guides/solar-costs-and-payback-texas`)
 * were seeded with `heroImage.urls.*` that pointed at
 * `hoirqrkdgbmvpwutwuwj.supabase.co`. That project is gone. This script:
 *
 *   1. Uploads each recovered PNG as a `sanity.imageAsset` (skipped when an
 *      asset with the same SHA-1 already exists, so reruns never duplicate).
 *      The local file must match the expected SHA-1 so a wrong image can never
 *      be substituted by accident.
 *   2. Walks every `page` / `post` document (published AND drafts via the raw
 *      perspective). Wherever a `heroImage` or card `image` still carries the
 *      legacy URL it sets the sibling `heroAsset` / `imageAsset` to the new
 *      asset (keeping the alt text) and rewrites every `urls.*` entry to the
 *      asset's CDN URL, so `description`, `color`, and the rest of the metadata
 *      stay in place and nothing references the dead host anymore.
 *   3. Rescans the dataset and fails if any document still mentions the host.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-guide-images-to-sanity.mjs --dry-run
 *   node --env-file=.env.local scripts/migrate-guide-images-to-sanity.mjs --source <dir-with-pngs>
 *
 * `--source` is only needed when the assets are not in the dataset yet.
 */
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

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

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const sourceFlagIndex = args.indexOf('--source')
const sourceDir = sourceFlagIndex === -1 ? null : args[sourceFlagIndex + 1]

const LEGACY_HOST = 'hoirqrkdgbmvpwutwuwj.supabase.co'
const LEGACY_BASE = `https://${LEGACY_HOST}/storage/v1/object/public/assets/assets`

export const GUIDE_IMAGES = [
  {
    slug: 'guides/how-solar-works-texas',
    file: 'how-solar-works-texas.png',
    legacyUrl: `${LEGACY_BASE}/7c81dc6c-677b-458c-9c27-a3d6ff08395d_1600w.png`,
    sha1: '32e04704af401cd29a2444f7fe31dcddaa64598b',
    alt: 'Modern Austin home with rooftop solar panels in warm afternoon light',
  },
  {
    slug: 'guides/solar-costs-and-payback-texas',
    file: 'solar-costs-and-payback-texas.png',
    legacyUrl: `${LEGACY_BASE}/1619b254-4925-4861-ae23-ae515f16291f_1600w.png`,
    sha1: '8fcd9d85e477e7949833dc1e5e7e587b9ab522fc',
    alt: 'Calculator, utility bill, and warm-toned tabletop still life',
  },
]

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: 'raw',
})

const TARGET_TYPES = ['page', 'post', 'servicePage', 'locationPage']

function log(message) {
  console.log(`${dryRun ? '[dry-run] ' : ''}${message}`)
}

async function findAssetBySha1(sha1) {
  return client.fetch(
    `*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]{_id, url, sha1hash, originalFilename}`,
    {
      sha1,
    },
  )
}

async function ensureAsset(guide) {
  const existing = await findAssetBySha1(guide.sha1)
  if (existing?._id) {
    log(`Asset for ${guide.slug} already exists: ${existing._id}`)
    return existing
  }

  if (!sourceDir) {
    throw new Error(
      `No Sanity asset with sha1 ${guide.sha1} for ${guide.slug}. Pass --source <dir> containing ${guide.file}.`,
    )
  }

  const filePath = resolve(sourceDir, guide.file)
  const buffer = await readFile(filePath)
  const actualSha1 = createHash('sha1').update(buffer).digest('hex')
  if (actualSha1 !== guide.sha1) {
    throw new Error(
      `${filePath} has sha1 ${actualSha1}, expected ${guide.sha1}. Refusing to upload a different image.`,
    )
  }

  if (dryRun) {
    log(`Would upload ${filePath} (${buffer.length} bytes) for ${guide.slug}`)
    return { _id: `image-${guide.sha1}-pending`, url: `(pending upload of ${guide.file})` }
  }

  const asset = await client.assets.upload('image', buffer, {
    filename: guide.file,
    contentType: 'image/png',
    source: { name: 'supabase-legacy', id: guide.legacyUrl, url: guide.legacyUrl },
  })
  log(`Uploaded ${guide.file} → ${asset._id}`)
  return asset
}

function matchGuide(imageField) {
  const urls = imageField?.urls
  if (!urls || typeof urls !== 'object') {
    return null
  }
  const values = Object.values(urls).filter((value) => typeof value === 'string')
  return GUIDE_IMAGES.find((guide) => values.some((value) => value.includes(guide.legacyUrl))) || null
}

function rewriteUrls(imageField, assetUrl) {
  const urls = Object.fromEntries(
    Object.entries(imageField.urls).map(([key, value]) =>
      typeof value === 'string' && value.includes(LEGACY_HOST) ? [key, assetUrl] : [key, value],
    ),
  )
  return { ...imageField, urls }
}

function buildAssetField(assetId, alt) {
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
    ...(alt ? { altText: alt } : {}),
  }
}

/**
 * Migrate one object that may own `heroImage`/`heroAsset` or `image`/`imageAsset`.
 * Recurses into arrays and nested objects first so hero sections, guide-grid
 * items, and any future nesting are all covered.
 */
function migrateNode(node, assets) {
  if (Array.isArray(node)) {
    let changed = false
    const next = node.map((entry) => {
      const result = migrateNode(entry, assets)
      changed = changed || result.changed
      return result.node
    })
    return { node: changed ? next : node, changed }
  }

  if (!node || typeof node !== 'object') {
    return { node, changed: false }
  }

  let changed = false
  const next = {}
  for (const [key, value] of Object.entries(node)) {
    const result = migrateNode(value, assets)
    changed = changed || result.changed
    next[key] = result.node
  }

  for (const [imageKey, assetKey] of [
    ['heroImage', 'heroAsset'],
    ['image', 'imageAsset'],
  ]) {
    const guide = matchGuide(node[imageKey])
    if (!guide) {
      continue
    }
    const asset = assets.get(guide.slug)
    next[imageKey] = rewriteUrls(node[imageKey], asset.url)
    if (!node[assetKey]?.asset?._ref) {
      next[assetKey] = buildAssetField(asset._id, node[imageKey].alt || guide.alt)
    }
    changed = true
  }

  return { node: changed ? next : node, changed }
}

async function fetchCandidateDocuments() {
  const docs = await client.fetch(`*[_type in $types]{_id, _type, title, "slug": slug.current, sections}`, {
    types: TARGET_TYPES,
  })
  return docs.filter((doc) => JSON.stringify(doc.sections || []).includes(LEGACY_HOST))
}

async function migrateDocuments(assets) {
  const docs = await fetchCandidateDocuments()
  log(`Found ${docs.length} document(s) referencing ${LEGACY_HOST}.`)

  let migrated = 0
  for (const doc of docs) {
    const { node: sections, changed } = migrateNode(doc.sections, assets)
    if (!changed) {
      log(`Skip ${doc._id}: no migratable guide image found (manual review needed).`)
      continue
    }
    if (dryRun) {
      log(`Would patch ${doc._id} (${doc._type} ${doc.slug || ''})`)
    } else {
      await client.patch(doc._id).set({ sections }).commit()
      log(`Patched ${doc._id} (${doc._type} ${doc.slug || ''})`)
    }
    migrated += 1
  }
  return migrated
}

async function assertNoLegacyReferences() {
  const docs = await client.fetch(`*[!(_id in path("_.**"))]{_id, _type, sections, "json": null}`)
  const remaining = docs.filter((doc) => JSON.stringify(doc).includes(LEGACY_HOST))
  if (remaining.length) {
    console.error(`Still referencing ${LEGACY_HOST}: ${remaining.map((doc) => doc._id).join(', ')}`)
    process.exitCode = 1
    return
  }
  console.log(`No document references ${LEGACY_HOST}.`)
}

async function main() {
  const assets = new Map()
  for (const guide of GUIDE_IMAGES) {
    const asset = await ensureAsset(guide)
    assets.set(guide.slug, asset)
    log(`${guide.slug} → ${asset._id} ${asset.url}`)
  }

  const migrated = await migrateDocuments(assets)
  log(`Migrated ${migrated} document(s).`)

  if (!dryRun) {
    await assertNoLegacyReferences()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
