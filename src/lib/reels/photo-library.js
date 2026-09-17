import { groq } from 'next-sanity'

import { getSanityServerClient } from '@/sanity/client'

import { themeOf } from './themes'

/*
 * The photo library behind the reel studio.
 *
 * Every image ever uploaded to Sanity is still there, including the shoot from
 * when the Christmas site was built. Landscape and square shots of houses are
 * what a reel needs; logos, icons and screenshots are not, so tiny images are
 * left out and the newest come first.
 */

const PHOTOS = groq`*[_type == "sanity.imageAsset" && (metadata.dimensions.width >= 1200 || _id in $christmas)] | order(_createdAt desc)[0...140]{
  _id,
  url,
  originalFilename,
  "width": metadata.dimensions.width,
  "height": metadata.dimensions.height,
  "lqip": metadata.lqip
}`

/*
 * The night shoot from when the Christmas site was built. These lead the
 * picker; everything else in the library (solar, roofing, sky) follows.
 */
const CHRISTMAS_SHOOT = [
  'image-6e4b4edddedc8423ae78c9ba7497d3fedb5944f1-2752x1536-jpg',
  'image-8eaa2868330f06196bd72f08333ad266f7864d9c-2752x1536-jpg',
  'image-2c5ed6379b54702bafed9d586759caf5f5c6bc7b-2752x1536-jpg',
  'image-2a2bd1bdab153651717c89acc37200dfd678c3e9-2752x1536-jpg',
  'image-fd45d11315d54cb4da8225a7e2672ae4cb8f1afe-2752x1536-jpg',
  'image-aba35750a2a51a6152854b9de84ea55dd16637bc-2752x1536-jpg',
  'image-0d98b6ccfa44f0f2ef70e51e9c2b22971d1961ea-2752x1536-jpg',
  'image-b528fa1080e2087777a86d086a86415aac2f41c1-2752x1536-jpg',
  'image-4070d9a394cda9a6300cbd6aaf663793235ec1f0-5157x3438-jpg',
  'image-b0addc1822e47fdfd2309e4fd28b37b72e1ca6e0-2048x2048-jpg',
  'image-4a79ba244af11829d58a145b5bb990a011d19065-2048x2048-jpg',
  'image-4eb81391f8a8a1264b415df507b5dee49a2a20ec-2048x2048-jpg',
  'image-fcdc425a32c589e74d44a763a2fe68bce8c72efd-2048x2048-jpg',
  'image-13ca14812d7457f0ca50c18ca0cf14725d6cdca0-3934x5245-jpg',
]

const christmasRank = (id) => {
  const index = CHRISTMAS_SHOOT.indexOf(id)
  return index === -1 ? Number.POSITIVE_INFINITY : index
}

/** A thumbnail that is small enough to scroll through on a phone. */
export const thumbUrl = (url) => `${url}?w=320&h=420&fit=crop&auto=format`

/** The size a render should pull: big enough for 1080x1920, small enough to fetch fast. */
export const renderUrl = (url) => `${url}?w=1400&fit=max&auto=format`

/**
 * Every photo a reel can use, best-first.
 *
 * @param {{ theme?: string }} [options] - The reel's theme. The Christmas theme
 *   floats its night shoot to the top; every other theme leaves them in date
 *   order, where a lit roofline is just an old photo rather than the first thing
 *   an operator sees.
 */
export async function listReelPhotos({ theme } = {}) {
  const client = getSanityServerClient({ preview: false, stega: false })
  if (!client) {
    return []
  }
  const assets = await client.fetch(PHOTOS, { christmas: CHRISTMAS_SHOOT }, { next: { revalidate: 300 } })
  // Stable sort: the Christmas shoot first, in its own order; the rest stay newest-first.
  const ordered = themeOf(theme).ranksChristmasPhotosFirst
    ? assets.toSorted((a, b) => christmasRank(a._id) - christmasRank(b._id))
    : assets
  return ordered.map((asset) => ({
    id: asset._id,
    name: asset.originalFilename || 'Photo',
    thumb: thumbUrl(asset.url),
    src: renderUrl(asset.url),
    lqip: asset.lqip || null,
    christmas: CHRISTMAS_SHOOT.includes(asset._id),
  }))
}
