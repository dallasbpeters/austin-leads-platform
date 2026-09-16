import { groq } from 'next-sanity'

import { getSanityServerClient } from '@/sanity/client'

/*
 * The photo library behind the reel studio.
 *
 * Every image ever uploaded to Sanity is still there, including the shoot from
 * when the Christmas site was built. Landscape and square shots of houses are
 * what a reel needs; logos, icons and screenshots are not, so tiny images are
 * left out and the newest come first.
 */

const PHOTOS = groq`*[_type == "sanity.imageAsset" && metadata.dimensions.width >= 1200] | order(_createdAt desc)[0...120]{
  _id,
  url,
  originalFilename,
  "width": metadata.dimensions.width,
  "height": metadata.dimensions.height,
  "lqip": metadata.lqip
}`

/** A thumbnail that is small enough to scroll through on a phone. */
export const thumbUrl = (url) => `${url}?w=320&h=420&fit=crop&auto=format`

/** The size a render should pull: big enough for 1080x1920, small enough to fetch fast. */
export const renderUrl = (url) => `${url}?w=1400&fit=max&auto=format`

export async function listReelPhotos() {
  const client = getSanityServerClient({ preview: false, stega: false })
  if (!client) {
    return []
  }
  const assets = await client.fetch(PHOTOS, {}, { next: { revalidate: 300 } })
  return assets.map((asset) => ({
    id: asset._id,
    name: asset.originalFilename || 'Photo',
    thumb: thumbUrl(asset.url),
    src: renderUrl(asset.url),
    lqip: asset.lqip || null,
  }))
}
