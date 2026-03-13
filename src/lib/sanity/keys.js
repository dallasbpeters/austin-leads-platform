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

function omitUndefined(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined))
}

function normalizeSectionItemType(section, item) {
  if (!item) {
    return item
  }

  if (item._type) {
    return item
  }

  if (section?.type === 'resourceGrid') {
    return {
      ...item,
      _type: 'resourceCard',
    }
  }

  return {
    ...item,
    _type: 'pageItem',
  }
}

export function normalizeSectionType(section) {
  if (!section) {
    return section
  }

  const normalizedItems = (section.items || []).map((item) => normalizeSectionItemType(section, item))
  const baseSection = {
    ...section,
    items: normalizedItems,
  }

  if (section.type === 'hero') {
    return {
      ...baseSection,
      _type: 'heroSection',
    }
  }

  if (section.type === 'resourceGrid') {
    return omitUndefined({
      _key: section._key,
      _type: 'resourceGridSection',
      type: 'resourceGrid',
      title: section.title,
      items: normalizedItems,
    })
  }

  if (section.type === 'guideGrid') {
    return omitUndefined({
      _key: section._key,
      _type: 'guideGridSection',
      type: 'guideGrid',
      title: section.title,
      body: section.body,
      items: normalizedItems,
    })
  }

  if (section._type && section._type !== 'object' && section._type !== 'pageSection') {
    return baseSection
  }

  return {
    ...baseSection,
    _type: 'pageSection',
  }
}

export function withSectionKeys(sections) {
  return (sections || []).map((section, index) => {
    const normalizedSection = normalizeSectionType(section)

    const keyedSection = {
      _key: normalizedSection?._key || createKey('section', index, normalizedSection?.title || normalizedSection?.type),
      ...normalizedSection,
    }

    if (Array.isArray(normalizedSection?.metrics)) {
      keyedSection.metrics = withObjectArrayKeys(normalizedSection.metrics, 'metric', 'label')
    }

    if (Array.isArray(normalizedSection?.items)) {
      keyedSection.items = withObjectArrayKeys(normalizedSection.items, 'item', 'title')
    }

    return keyedSection
  })
}
