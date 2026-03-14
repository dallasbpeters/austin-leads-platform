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

  if (section.type === 'aboutProfile') {
    const people =
      Array.isArray(section.people) && section.people.length
        ? section.people
        : [
            omitUndefined({
              _key: section.personKey,
              _type: 'aboutProfilePerson',
              label: section.personLabel,
              name: section.personName,
              role: section.personRole,
              blurb: section.personBlurb,
              profileImage: section.profileImage,
              profileImageAsset: section.profileImageAsset,
              certificationLabel: section.certificationLabel,
              certificationTitle: section.certificationTitle,
              badgeImage: section.badgeImage,
              badgeImageAsset: section.badgeImageAsset,
            }),
            omitUndefined({
              _key: section.secondaryPersonKey,
              _type: 'aboutProfilePerson',
              label: section.secondaryPersonLabel,
              name: section.secondaryPersonName,
              role: section.secondaryPersonRole,
              blurb: section.secondaryPersonBlurb,
              profileImage: section.secondaryProfileImage,
              profileImageAsset: section.secondaryProfileImageAsset,
            }),
          ].filter((person) => person.name)

    return omitUndefined({
      _key: section._key,
      _type: 'aboutProfileSection',
      type: 'aboutProfile',
      eyebrow: section.eyebrow,
      title: section.title,
      body: section.body,
      people,
      profileImage: section.profileImage,
      profileImageAsset: section.profileImageAsset,
      personLabel: section.personLabel,
      personName: section.personName,
      personRole: section.personRole,
      personBlurb: section.personBlurb,
      certificationLabel: section.certificationLabel,
      certificationTitle: section.certificationTitle,
      badgeImage: section.badgeImage,
      badgeImageAsset: section.badgeImageAsset,
      secondaryProfileImage: section.secondaryProfileImage,
      secondaryProfileImageAsset: section.secondaryProfileImageAsset,
      secondaryPersonLabel: section.secondaryPersonLabel,
      secondaryPersonName: section.secondaryPersonName,
      secondaryPersonRole: section.secondaryPersonRole,
      secondaryPersonBlurb: section.secondaryPersonBlurb,
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

    if (Array.isArray(normalizedSection?.people)) {
      keyedSection.people = withObjectArrayKeys(normalizedSection.people, 'person', 'name')
    }

    return keyedSection
  })
}
