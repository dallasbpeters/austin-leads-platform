import { cleanRuntimeString } from '../sanity/stega'

/**
 * Reads a section setting (an enum like `hide`, `dark`, `grid`) safely.
 *
 * In draft mode Sanity encodes invisible edit markers into every string it
 * returns, so a stored `'hide'` no longer equals the literal `'hide'` and every
 * comparison silently flips. Settings are compared, never displayed, so they
 * are always cleaned first.
 *
 * @param {unknown} value - The stored value.
 * @returns {unknown} The value with any edit markers removed.
 */
export const sectionSetting = (value) => cleanRuntimeString(value)

/**
 * Match a homepage/page hero block from Sanity sections.
 * Older or Canvas-sourced docs may omit the hidden `type` field and only set `_type: 'heroSection'`.
 */
export const isHeroSectionBlock = (section) =>
  Boolean(section && (sectionSetting(section.type) === 'hero' || section._type === 'heroSection'))

/**
 * Whether a section should draw the decorative cloud layer.
 *
 * Editors can turn clouds off from Sanity, and older documents spell that
 * choice three different ways, so the check lives here rather than being
 * re-derived at each call site.
 *
 * @param {string | boolean | undefined} cloudVisibility - The section's stored choice.
 * @returns {boolean} True when the clouds should render.
 */
export const shouldShowClouds = (cloudVisibility) =>
  !['hide', 'off', false].includes(sectionSetting(cloudVisibility))
