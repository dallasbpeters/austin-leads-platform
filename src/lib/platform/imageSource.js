import { createImageUrlBuilder } from '@sanity/image-url'

import { dataset, projectId } from '@/sanity/env'

const imageBuilder =
  projectId && dataset ? createImageUrlBuilder({ projectId, dataset }) : null

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
