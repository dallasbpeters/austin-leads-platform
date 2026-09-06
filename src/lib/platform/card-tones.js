/*
 * Card color tokens shared by Sanity (`guideCardColorOptions`) and the
 * renderers. Sanity stores the camelCase key; the CSS custom property is the
 * kebab-case form under `--color-`.
 */
export const CARD_TONE_KEYS = [
  'primary',
  'sweetcorn',
  'voodoo',
  'tidal',
  'secondaryAlt',
  'blue400',
  'secondary',
  'tasman',
  'chaletGreen',
  'metterhorn',
  'heather',
  'wattle',
  'charade',
  'ceramic',
  'tapaGreen',
  'seaMist',
  'blackCurrent',
  'confetti',
]

export const cardToneSlug = (key) => key.replaceAll(/([a-z])([A-Z0-9])/gu, '$1-$2').toLowerCase()

/**
 * @param {unknown} key - A tone key from Sanity.
 * @returns {string|null} The CSS variable for that tone, or null when the key is unknown.
 */
export const cardToneCssVar = (key) =>
  typeof key === 'string' && CARD_TONE_KEYS.includes(key.trim())
    ? `var(--color-${cardToneSlug(key.trim())})`
    : null
