import { createImageUrlBuilder } from '@sanity/image-url'

import { dataset, projectId } from '@/sanity/env'

const imageBuilder = projectId && dataset ? createImageUrlBuilder({ projectId, dataset }) : null

/**
 * Build a CDN URL that respects Sanity crop + hotspot (uploaded / generated assets).
 * Falls back to stored asset.url when the builder cannot run.
 */
export function buildSanityImageUrl(imageField, { width = 1920, height } = {}) {
  if (!imageField?.asset) {
    return ''
  }

  const fallbackUrl = imageField.asset?.url || ''
  const assetRef = imageField.asset?._ref || imageField.asset?._id
  if (!imageBuilder || !assetRef) {
    return fallbackUrl
  }

  try {
    const source = {
      _type: 'image',
      asset: { _ref: assetRef },
      ...(imageField.crop ? { crop: imageField.crop } : {}),
      ...(imageField.hotspot ? { hotspot: imageField.hotspot } : {}),
    }

    let chain = imageBuilder.image(source).auto('format').fit('max')
    const dims = imageField.asset?.metadata?.dimensions
    const maxW = dims?.width ? Math.min(width, Math.round(dims.width)) : width
    chain = chain.width(Math.max(1, maxW))
    if (height) {
      chain = chain.height(Math.round(height))
    }
    return chain.url() || fallbackUrl
  } catch {
    return fallbackUrl
  }
}

export function getSanityAssetUrl(imageField, options) {
  return buildSanityImageUrl(imageField, options)
}

export function getHeroImageUrl(imageField, fallbackImage = null, options) {
  const fromAsset = buildSanityImageUrl(imageField, options)
  if (fromAsset) {
    return fromAsset
  }
  return (
    fallbackImage?.urls?.full ||
    fallbackImage?.urls?.regular ||
    fallbackImage?.urls?.small ||
    fallbackImage?.urls?.thumb ||
    ''
  )
}

export function getImageUrl(imageField, fallbackImage = null, options) {
  const fromAsset = buildSanityImageUrl(imageField, options)
  if (fromAsset) {
    return fromAsset
  }
  return (
    fallbackImage?.urls?.full ||
    fallbackImage?.urls?.regular ||
    fallbackImage?.urls?.small ||
    fallbackImage?.urls?.thumb ||
    ''
  )
}

export function getImageAlt(imageField, fallbackImage = null, fallbackText = '') {
  return imageField?.altText || imageField?.alt || fallbackImage?.alt || fallbackText || ''
}

export function hasImageSource(imageField, fallbackImage = null) {
  return Boolean(getImageUrl(imageField, fallbackImage))
}

const VIDEO_MIME_BY_EXT = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  ogv: 'video/ogg',
  m3u8: 'application/x-mpegURL',
}

function inferVideoMimeFromUrl(url) {
  if (!url) return null
  const cleaned = String(url).split('?')[0].split('#')[0]
  const ext = cleaned.split('.').pop()?.toLowerCase()
  return ext && VIDEO_MIME_BY_EXT[ext] ? VIDEO_MIME_BY_EXT[ext] : null
}

/**
 * Resolve a playable hero video source from the schema fields.
 *
 * Reads from (in order):
 *  1. Sanity-uploaded asset: heroVideoAsset.asset->url
 *  2. Encoded URLs: heroVideo.urls.mp4 / .webm / .hls
 *  3. Direct URL: heroVideo.url
 *
 * Returns null when no playable HTML5 source can be resolved.
 *
 * @returns {{
 *   provider: string,
 *   src: string,
 *   type: string|null,
 *   poster: string,
 *   externalId: string,
 *   alt: string,
 *   autoplay: boolean,
 *   loop: boolean,
 *   muted: boolean,
 *   controls: boolean,
 *   playsInline: boolean,
 *   width: number|null,
 *   height: number|null,
 * } | null}
 */
export function getHeroVideoSource(videoField, videoAssetField = null, options = {}) {
  const provider =
    (typeof videoField?.provider === 'string' && videoField.provider) ||
    (videoAssetField?.asset ? 'upload' : 'external')

  let src = ''
  let type = null

  const uploadedUrl = videoAssetField?.asset?.url || ''
  if (uploadedUrl) {
    src = uploadedUrl
    type = videoAssetField?.asset?.mimeType || inferVideoMimeFromUrl(uploadedUrl)
  } else if (videoField?.urls?.mp4) {
    src = videoField.urls.mp4
    type = 'video/mp4'
  } else if (videoField?.urls?.webm) {
    src = videoField.urls.webm
    type = 'video/webm'
  } else if (videoField?.urls?.hls) {
    src = videoField.urls.hls
    type = 'application/x-mpegURL'
  } else if (videoField?.url) {
    src = videoField.url
    type = inferVideoMimeFromUrl(videoField.url)
  }

  if (!src) {
    return null
  }

  const posterField = videoField?.posterImage
  const poster =
    buildSanityImageUrl(posterField, { width: options.posterWidth || 1920 }) || videoField?.urls?.poster || ''

  return {
    provider,
    src,
    type,
    poster,
    externalId: videoField?.externalId || '',
    alt: videoField?.alt || '',
    autoplay: videoField?.autoplay !== false,
    loop: videoField?.loop !== false,
    muted: videoField?.muted !== false,
    controls: Boolean(videoField?.controls),
    playsInline: videoField?.playsInline !== false,
    width: typeof videoField?.width === 'number' ? videoField.width : null,
    height: typeof videoField?.height === 'number' ? videoField.height : null,
  }
}

export function hasHeroVideoSource(videoField, videoAssetField = null) {
  return Boolean(getHeroVideoSource(videoField, videoAssetField))
}
