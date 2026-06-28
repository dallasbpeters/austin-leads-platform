const RICH_TEXT_KEYS = new Set([
  'body',
  'subtitle',
  'answer',
  'cardCopy',
  'avatarBlurb',
  'blurb',
  'subtitleLabel',
  'subtitleValue',
])

const OBJECT_FIELD_KEYS = new Set([
  'imageAsset',
  'heroAsset',
  'avatarImageAsset',
  'profileImageAsset',
  'badgeImageAsset',
  'secondaryProfileImageAsset',
])

export function textToPortableText(value) {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  return [
    {
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          text: value,
          marks: [],
        },
      ],
    },
  ]
}

export function normalizeRichTextFields(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeRichTextFields)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const next = { ...value }

  for (const key of Object.keys(next)) {
    const fieldValue = next[key]

    if (OBJECT_FIELD_KEYS.has(key) && fieldValue === null) {
      delete next[key]
      continue
    }

    if (RICH_TEXT_KEYS.has(key)) {
      next[key] = textToPortableText(fieldValue)
      continue
    }

    next[key] = normalizeRichTextFields(fieldValue)
  }

  return next
}
