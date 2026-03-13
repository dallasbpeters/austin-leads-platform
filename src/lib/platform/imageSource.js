export function getSanityAssetUrl(imageField) {
  return imageField?.asset?.url || ''
}

export function getImageUrl(imageField, fallbackImage = null) {
  return (
    getSanityAssetUrl(imageField) ||
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
