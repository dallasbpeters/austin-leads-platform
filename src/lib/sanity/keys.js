function toKeyPart(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

function createKey(prefix, index, value) {
  const fallback = `${prefix}-${index + 1}`
  const keyPart = toKeyPart(value)
  const suffix = keyPart || fallback

  return `${prefix}-${index + 1}-${suffix}`.slice(0, 96)
}

function withObjectArrayKeys(items, prefix, titleField = 'title') {
  return (items || []).map((item, index) => ({
    _key: item?._key || createKey(prefix, index, item?.[titleField] || item?.label),
    ...item,
  }))
}

export function withSectionKeys(sections) {
  return (sections || []).map((section, index) => ({
    _key: section?._key || createKey('section', index, section?.title || section?.type),
    ...section,
    metrics: withObjectArrayKeys(section?.metrics, 'metric', 'label'),
    items: withObjectArrayKeys(section?.items, 'item', 'title'),
  }))
}
