// Relative import (not the `@/` alias) so plain Node scripts can import this module too.
import { buildRuntimeKey, cleanRuntimeString } from '../sanity/stega.js'

/**
 * Gallery content model helpers shared by the renderer, the migration script,
 * and tests.
 *
 * A gallery section holds `projects[]`, each with an ordered `photos[]`. Older
 * sections only have a flat `images[]` list; every one of those images becomes
 * a one-photo project here so the grid and lightbox only ever deal with
 * projects. Keys, asset references, crop/hotspot, and order are preserved so
 * the on-screen result for legacy content is identical to the pre-project grid.
 */

const EMPTY = []

const asArray = (value) => (Array.isArray(value) ? value : EMPTY)

const cleanText = (value) => cleanRuntimeString(typeof value === 'string' ? value : '') || ''

const cleanYear = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : ''
  }
  return cleanText(value)
}

const hasAsset = (image) => Boolean(image?.asset)

/** Plain-language fallback when an older image was saved without alt text. */
export const buildLegacyAltText = ({ neighborhood, packageName, year, index, sectionTitle }) => {
  const where = [neighborhood, year].filter(Boolean).join(' ')
  if (packageName && where) {
    return `${packageName} install in ${where}`
  }
  if (where) {
    return `Install in ${where}`
  }
  if (packageName) {
    return `${packageName} install`
  }
  if (sectionTitle) {
    return `${sectionTitle} photo ${index + 1}`
  }
  return `Gallery photo ${index + 1}`
}

const normalizePhoto = (photo, index, projectKey, fallbackAlt) => {
  if (!hasAsset(photo)) {
    return null
  }
  const alt = cleanText(photo.altText) || cleanText(photo.alt) || fallbackAlt
  return {
    key: buildRuntimeKey(projectKey, 'photo', photo._key, photo.asset?._ref || photo.asset?._id, index),
    image: photo,
    alt,
    caption: cleanText(photo.caption),
    width: photo.asset?.metadata?.dimensions?.width ?? null,
    height: photo.asset?.metadata?.dimensions?.height ?? null,
  }
}

const normalizeProject = (project, index, sectionTitle) => {
  const title = cleanText(project?.title)
  const neighborhood = cleanText(project?.neighborhood)
  const year = cleanYear(project?.year)
  const packageName = cleanText(project?.package)
  const key = buildRuntimeKey('gallery-project', project?._key, index)
  const name = title || neighborhood || `Project ${index + 1}`
  const photos = asArray(project?.photos)
    .map((photo, photoIndex) => normalizePhoto(photo, photoIndex, key, `${name} photo ${photoIndex + 1}`))
    .filter(Boolean)
  if (photos.length === 0) {
    return null
  }
  return {
    key,
    // `title` is what the tile caption prints; `name` is the accessible name and
    // lightbox heading, which always has a value.
    title: title || neighborhood,
    name,
    neighborhood,
    year,
    packageName,
    photos,
    cover: photos[0],
    sectionTitle,
  }
}

const legacyImageToProject = (image, index, sectionTitle) => {
  if (!hasAsset(image)) {
    return null
  }
  const neighborhood = cleanText(image.neighborhood)
  const year = cleanYear(image.year)
  const packageName = cleanText(image.package)
  const alt =
    cleanText(image.altText) ||
    cleanText(image.alt) ||
    buildLegacyAltText({ neighborhood, packageName, year, index, sectionTitle })
  const key = buildRuntimeKey('gallery-image', image._key, image.asset?._ref || image.asset?._id, index)
  const photo = {
    key: `${key}::photo`,
    image,
    alt,
    caption: '',
    width: image.asset?.metadata?.dimensions?.width ?? null,
    height: image.asset?.metadata?.dimensions?.height ?? null,
  }
  return {
    key,
    // Legacy tiles only printed a caption when they had a neighborhood; keep that.
    title: neighborhood,
    name: neighborhood || alt,
    neighborhood,
    year,
    packageName,
    photos: [photo],
    cover: photo,
    sectionTitle,
  }
}

/**
 * Resolve a gallery section to its list of renderable projects.
 * Prefers `projects[]`; falls back to legacy `images[]` (one project per image).
 */
export const getGalleryProjects = (section) => {
  const sectionTitle = cleanText(section?.title)
  const projects = asArray(section?.projects)
    .map((project, index) => normalizeProject(project, index, sectionTitle))
    .filter(Boolean)
  if (projects.length > 0) {
    return projects
  }
  return asArray(section?.images)
    .map((image, index) => legacyImageToProject(image, index, sectionTitle))
    .filter(Boolean)
}

/** Secondary caption line: neighborhood (when it is not already the title), year, package. */
export const getProjectMetaLine = (project) =>
  [project.neighborhood !== project.title ? project.neighborhood : '', project.year, project.packageName]
    .filter(Boolean)
    .join(' · ')

export const countGalleryPhotos = (projects) =>
  asArray(projects).reduce((total, project) => total + asArray(project?.photos).length, 0)
