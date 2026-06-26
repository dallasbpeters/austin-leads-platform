import { createImageUrlBuilder } from '@sanity/image-url'

import { dataset, projectId } from '@/sanity/env'

const imageBuilder = projectId && dataset ? createImageUrlBuilder({ projectId, dataset }) : null

/**
 * Build a CDN URL that respects Sanity crop + hotspot (uploaded / generated assets).
 * Falls back to stored asset.url when the builder cannot run.
 */
function buildSanityUrlOrFallback(imageField, assetRef, width, height) {
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
    return chain.url()
  } catch {
    return null
  }
}

export function buildSanityImageUrl(imageField, { width = 1920, height } = {}) {
  if (!imageField?.asset) return ''

  const fallbackUrl = imageField.asset?.url || ''
  const assetRef = imageField.asset?._ref || imageField.asset?._id
  if (!imageBuilder || !assetRef) return fallbackUrl

  return buildSanityUrlOrFallback(imageField, assetRef, width, height) || fallbackUrl
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
const VIDEO_SOURCE_RESOLVERS = [
  {
    test: (vf, vaf) => vaf?.asset?.url,
    src: (vf, vaf) => vaf.asset.url,
    type: (vf, vaf) => vaf.asset?.mimeType || inferVideoMimeFromUrl(vaf.asset.url),
  },
  {
    test: (vf) => vf?.urls?.mp4,
    src: (vf) => vf.urls.mp4,
    type: () => 'video/mp4',
  },
  {
    test: (vf) => vf?.urls?.webm,
    src: (vf) => vf.urls.webm,
    type: () => 'video/webm',
  },
  {
    test: (vf) => vf?.urls?.hls,
    src: (vf) => vf.urls.hls,
    type: () => 'application/x-mpegURL',
  },
  {
    test: (vf) => vf?.url,
    src: (vf) => vf.url,
    type: (vf) => inferVideoMimeFromUrl(vf.url),
  },
]

function resolveHeroVideoProvider(videoField, videoAssetField) {
  if (typeof videoField?.provider === 'string' && videoField.provider) return videoField.provider
  return videoAssetField?.asset ? 'upload' : 'external'
}

function resolveHeroVideoPoster(videoField, options) {
  const posterField = videoField?.posterImage
  return (
    buildSanityImageUrl(posterField, { width: options.posterWidth || 1920 }) || videoField?.urls?.poster || ''
  )
}

function resolveVideoDimension(value) {
  return typeof value === 'number' ? value : null
}

export function getHeroVideoSource(videoField, videoAssetField = null, options = {}) {
  const provider = resolveHeroVideoProvider(videoField, videoAssetField)
  const resolver = VIDEO_SOURCE_RESOLVERS.find((r) => r.test(videoField, videoAssetField))
  const src = resolver ? resolver.src(videoField, videoAssetField) : ''
  const type = resolver ? resolver.type(videoField, videoAssetField) : null

  if (!src) return null

  return {
    provider,
    src,
    type,
    poster: resolveHeroVideoPoster(videoField, options),
    externalId: videoField?.externalId || '',
    alt: videoField?.alt || '',
    autoplay: videoField?.autoplay !== false,
    loop: videoField?.loop !== false,
    muted: videoField?.muted !== false,
    controls: Boolean(videoField?.controls),
    playsInline: videoField?.playsInline !== false,
    width: resolveVideoDimension(videoField?.width),
    height: resolveVideoDimension(videoField?.height),
  }
}

export function hasHeroVideoSource(videoField, videoAssetField = null) {
  return Boolean(getHeroVideoSource(videoField, videoAssetField))
}
