import { portableTextToPlainText } from './portableText'

/*
 * Turns one page section into another section type, carrying its content
 * across (Studio's "Change type" menu, src/sanity/components/section-type-switcher.jsx).
 *
 * Works on Sanity's compiled schema types: { name, jsonType, fields: [{ name, type }], of: [type] }.
 * A field takes the source field of the same name, else the first unused field
 * of the same meaning (FIELD_GROUPS), as long as the value fits the new field.
 * List items are converted the same way, one level down. Anything left over is
 * reported as { field, where } (where: the list it sat in), or { field, lost, of }
 * for list items that could not be placed, so the editor sees it before converting.
 */

/** Fields that mean the same thing under different names, in order of preference. */
const FIELD_GROUPS = [
  ['title', 'question', 'label', 'name', 'heading', 'titlePrimary', 'secondaryTitle'],
  ['body', 'subtitle', 'answer', 'description', 'text', 'summary', 'cardCopy', 'statement', 'intro'],
  ['eyebrow', 'kicker', 'avatarEyebrow'],
  [
    'items',
    'reasons',
    'notes',
    'panelTabs',
    'people',
    'storyPhotos',
    'images',
    'projects',
    'secondaryItems',
    'roofingItems',
  ],
  [
    'imageAsset',
    'image',
    'logo',
    'posterImage',
    'heroAsset',
    'heroCutout',
    'backgroundImageAsset',
    'roofImageAsset',
    'panelImageAsset',
    'avatarImageAsset',
  ],
  ['href', 'ctaHref', 'link'],
  ['ctaLabel', 'linkLabel', 'submitLabel'],
]

/** Keys that belong to the section type itself and never carry across. */
const SKIP_KEYS = new Set(['type'])

const candidatesFor = (name) => {
  const group = FIELD_GROUPS.find((names) => names.includes(name))
  return group ? [name, ...group.filter((other) => other !== name)] : [name]
}

const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => key.startsWith('_')))

/** True for `image` or any type built on it. */
const isImageType = (type) => {
  for (let current = type; current; current = current.type) {
    if (current.name === 'image') {
      return true
    }
  }
  return false
}

const hasImageAsset = (value) =>
  typeof value?.asset?._ref === 'string' && value.asset._ref.startsWith('image-')

const isPortableTextType = (type) =>
  type?.jsonType === 'array' && (type.of || []).some((member) => member.name === 'block')

/** A field with a fixed list of choices (options.list) only takes one of them. */
const isAllowed = (value, type) => {
  const list = type.options?.list
  return (
    !list?.length || list.some((choice) => (typeof choice === 'object' ? choice?.value : choice) === value)
  )
}

const randomKey = () => Math.random().toString(36).slice(2, 14)

const textToBlocks = (text) =>
  String(text)
    .split(/\n{2,}/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      _type: 'block',
      _key: randomKey(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: randomKey(), text: paragraph, marks: [] }],
    }))

/** Image keys that carry over between any two image types. */
const IMAGE_KEYS = ['asset', 'crop', 'hotspot']
const ALT_NAMES = new Set(['alt', 'altText'])

/**
 * An image retyped as `type`: the picture itself, plus the alt text under the
 * name `type` uses for it (alt or altText). Other fields are reported.
 */
function toImage(image, type, report, where, fallbackAlt = '') {
  const result = { _type: type.name }
  for (const key of IMAGE_KEYS) {
    if (image[key] !== undefined) {
      result[key] = image[key]
    }
  }
  const alt = image.alt || image.altText || fallbackAlt
  const altField = (type.fields || []).find((field) => ALT_NAMES.has(field.name))
  if (alt && altField) {
    result[altField.name] = alt
  } else if (alt) {
    report({ field: image.alt ? 'alt' : 'altText', where })
  }
  for (const [key, value] of Object.entries(image)) {
    if (!key.startsWith('_') && !IMAGE_KEYS.includes(key) && !ALT_NAMES.has(key) && !isEmpty(value)) {
      report({ field: key, where })
    }
  }
  return result
}

/** The first image found in an item, for list items that become plain images. */
const firstImageIn = (value) =>
  Object.entries(value || {}).find(([key, child]) => !key.startsWith('_') && hasImageAsset(child))

/** Converts one list item to one of the array's member types, or returns null. */
function convertItem(item, members, report, where) {
  if (item === null || item === undefined || typeof item === 'number') {
    return null
  }
  if (typeof item === 'string') {
    return members.some((member) => member.jsonType === 'string') ? item : null
  }
  const key = item._key || randomKey()
  const same = members.find((member) => member.name === item._type)
  if (same) {
    return { ...item, _key: key }
  }
  const imageMember = members.find(isImageType)
  if (imageMember) {
    if (hasImageAsset(item)) {
      return { ...toImage(item, imageMember, report, where), _key: key }
    }
    const found = firstImageIn(item)
    if (found) {
      const [field, image] = found
      // The item's own alt text, else its title, describes the picture.
      const titleText = portableTextToPlainText(item.title || item.label || '')
      const altText = image.alt || image.altText || item.alt || item.altText || titleText
      const usedTitle = altText === titleText && titleText !== ''
      for (const [name, value] of Object.entries(item)) {
        const carried =
          name === field || ALT_NAMES.has(name) || (usedTitle && ['title', 'label'].includes(name))
        if (!name.startsWith('_') && !carried && !isEmpty(value)) {
          report({ field: name, where })
        }
      }
      return { ...toImage(image, imageMember, report, where, altText), _key: key }
    }
  }
  const objectMember = members.find(
    (member) =>
      member.jsonType === 'object' &&
      member.name !== 'reference' &&
      !isImageType(member) &&
      member.name !== 'block',
  )
  if (!objectMember || item._ref || item._type === 'block') {
    return null
  }
  const converted = convertObject(item, objectMember, report, where)
  return converted ? { ...converted, _key: key } : null
}

/** Converts a value to fit a field type, or returns null when it cannot. */
function convertValue(value, type, report, where) {
  if (isEmpty(value) || !type) {
    return null
  }
  switch (type.jsonType) {
    case 'string': {
      const text =
        typeof value === 'string' ? value : Array.isArray(value) ? portableTextToPlainText(value) : ''
      return text && isAllowed(text, type) ? text : null
    }
    case 'number':
    case 'boolean': {
      return typeof value === type.jsonType ? value : null
    }
    case 'array': {
      if (typeof value === 'string') {
        return isPortableTextType(type) ? textToBlocks(value) : null
      }
      if (!Array.isArray(value)) {
        return null
      }
      const members = type.of || []
      const items = value.map((item) => convertItem(item, members, report, where)).filter(Boolean)
      if (items.length < value.length) {
        report({ field: where, lost: value.length - items.length, of: value.length })
      }
      return items.length ? items : null
    }
    case 'object': {
      if (Array.isArray(value) || typeof value !== 'object') {
        return null
      }
      if (isImageType(type)) {
        return hasImageAsset(value) ? toImage(value, type, report, where) : null
      }
      if (hasImageAsset(value) || value._ref) {
        return null
      }
      if (value._type === type.name) {
        return value
      }
      // Two plain objects of different types (e.g. a color and a hero image) are not interchangeable.
      if (value._type && type.fields?.length && !type.fields.some((field) => field.name in value)) {
        return null
      }
      return convertObject(value, type, report, where)
    }
    default: {
      return null
    }
  }
}

/**
 * Builds an object of `type` from `source`, field by field: every field takes its
 * same-named source field first, then the empty ones take a field of the same meaning.
 */
function convertObject(source, type, report, where) {
  const result = { _type: type.name }
  const used = new Set()
  const fields = (type.fields || []).filter((field) => !SKIP_KEYS.has(field.name))
  const take = (field, candidate) => {
    if (used.has(candidate) || isEmpty(source[candidate])) {
      return false
    }
    // What this attempt could not carry counts only if the attempt is kept.
    const attempt = []
    const value = convertValue(source[candidate], field.type, (entry) => attempt.push(entry), field.name)
    if (value === null) {
      return false
    }
    result[field.name] = value
    used.add(candidate)
    for (const entry of attempt) {
      report(entry)
    }
    return true
  }
  for (const field of fields) {
    take(field, field.name)
  }
  for (const field of fields) {
    if (!(field.name in result)) {
      candidatesFor(field.name).some((candidate) => take(field, candidate))
    }
  }
  for (const [key, value] of Object.entries(source)) {
    if (!key.startsWith('_') && !SKIP_KEYS.has(key) && !used.has(key) && !isEmpty(value)) {
      report({ field: key, where })
    }
  }
  return Object.keys(result).length > 1 ? result : null
}

/**
 * Converts a section to `targetType`. Returns { value, dropped }: the new
 * section (same _key) and what will not carry across ({ field, where } for a
 * field, { field, lost, of } for list items that could not be placed).
 */
export function convertSection(section, targetType, initialValue = {}) {
  const dropped = new Map()
  const report = (entry) => dropped.set(JSON.stringify(entry), entry)
  const converted = convertObject(section, targetType, report, '') || { _type: targetType.name }
  const value = {
    ...initialValue,
    ...converted,
    _type: targetType.name,
    _key: section._key,
    type: initialValue.type || targetType.name.replace(/Section$/u, ''),
  }
  return { value, dropped: [...dropped.values()] }
}

/** The fields of `section` that hold content, for showing what will carry across. */
export function filledFields(section) {
  return Object.keys(section || {}).filter(
    (key) => !key.startsWith('_') && !SKIP_KEYS.has(key) && !isEmpty(section[key]),
  )
}
