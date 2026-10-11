/**
 * Migrate legacy `gallerySection.images[]` (flat `galleryImage` items) into the
 * grouped `projects[]` model (`galleryProject` → `photos[]` of `galleryPhoto`).
 *
 * Each legacy image becomes a one-photo project:
 *   - project `_key`  = the image `_key`             (stable Studio/Presentation keys)
 *   - project title   = neighborhood, else "Install N"
 *   - neighborhood / year / package are copied across
 *   - photo `_key`    = `${image._key}-photo`
 *   - asset, crop, hotspot are copied untouched
 *   - altText         = altText, else legacy `alt`, else a plain fallback built
 *                       from the neighborhood/package/year (the new schema
 *                       requires alt text)
 *
 * Order is preserved. Sections that already have `projects[]` keep them and get
 * the converted images appended after them. Walks published and draft versions
 * (raw perspective). Idempotent: an image whose `_key` already exists as a
 * project `_key` was converted on an earlier `--keep-legacy` run and is not
 * added again, so a later plain run only clears `images[]`.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-gallery-projects.mjs [--dry-run] [--keep-legacy]
 *
 *   --dry-run      Print the planned patches, write nothing.
 *   --keep-legacy  Leave `images[]` in place after writing `projects[]`
 *                  (the renderer prefers `projects[]` whenever it has entries).
 *
 * Run this only after the schema that declares `galleryProject` is deployed;
 * the frontend that reads `projects[]` must also be live before `images[]` is
 * removed, or the public gallery goes empty.
 */
import { createClient } from 'next-sanity'

import { buildLegacyAltText } from '../src/lib/platform/gallery-projects.js'

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const keepLegacy = args.has('--keep-legacy')

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
  perspective: 'raw',
})

const TARGET_TYPES = ['page', 'post', 'servicePage', 'locationPage', 'caseStudy']

const text = (value) => (typeof value === 'string' ? value.trim() : '')

const omitUndefined = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null))

export function legacyImageToProject(image, index, sectionTitle) {
  const neighborhood = text(image.neighborhood)
  const packageName = text(image.package)
  const year = typeof image.year === 'number' ? image.year : undefined
  const altText =
    text(image.altText) ||
    text(image.alt) ||
    buildLegacyAltText({
      neighborhood,
      packageName,
      year: year === undefined ? '' : String(year),
      index,
      sectionTitle,
    })
  const key = image._key || `legacy-image-${index + 1}`

  return omitUndefined({
    _key: key,
    _type: 'galleryProject',
    title: neighborhood || `Install ${index + 1}`,
    neighborhood: neighborhood || undefined,
    year,
    package: packageName || undefined,
    photos: [
      omitUndefined({
        _key: `${key}-photo`,
        _type: 'galleryPhoto',
        asset: image.asset,
        crop: image.crop,
        hotspot: image.hotspot,
        altText,
      }),
    ],
  })
}

export function migrateSection(section) {
  if (!section || section._type !== 'gallerySection') {
    return null
  }
  const images = Array.isArray(section.images) ? section.images.filter((image) => image?.asset) : []
  if (images.length === 0) {
    return null
  }
  const existing = Array.isArray(section.projects) ? section.projects : []
  const existingKeys = new Set(existing.map((project) => project?._key).filter(Boolean))
  const converted = images
    .map((image, index) => legacyImageToProject(image, index, text(section.title)))
    .filter((project) => !existingKeys.has(project._key))
  if (converted.length === 0 && keepLegacy) {
    return null
  }
  const next = { ...section, projects: [...existing, ...converted] }
  if (!keepLegacy) {
    delete next.images
  }
  return next
}

const docs = await client.fetch(
  `*[_type in $types && count(sections[_type == "gallerySection" && count(images) > 0]) > 0]{
    _id,
    _type,
    title,
    sections
  }`,
  { types: TARGET_TYPES },
)

console.log(`${dryRun ? '[dry-run] ' : ''}Found ${docs.length} document(s) with legacy gallery images.`)

let migrated = 0

for (const doc of docs) {
  if (!Array.isArray(doc.sections)) {
    continue
  }

  let docChanged = false
  let projectsWritten = 0
  const nextSections = doc.sections.map((section) => {
    const migratedSection = migrateSection(section)
    if (migratedSection) {
      docChanged = true
      projectsWritten += migratedSection.projects.length
      return migratedSection
    }
    return section
  })

  if (!docChanged) {
    continue
  }

  const label = `${doc._id}${doc.title ? ` (${doc.title})` : ''}: ${projectsWritten} project(s)`
  if (dryRun) {
    console.log(`[dry-run] Would migrate ${label}`)
    continue
  }

  await client.patch(doc._id).set({ sections: nextSections }).commit()
  migrated += 1
  console.log(`Migrated ${label}`)
}

console.log(`${dryRun ? '[dry-run] ' : ''}Migrated ${migrated} document${migrated === 1 ? '' : 's'}.`)
