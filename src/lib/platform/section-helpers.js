/**
 * Match a homepage/page hero block from Sanity sections.
 * Older or Canvas-sourced docs may omit the hidden `type` field and only set `_type: 'heroSection'`.
 */
export const isHeroSectionBlock = (section) =>
  Boolean(section && (section.type === 'hero' || section._type === 'heroSection'))

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
export const shouldShowClouds = (cloudVisibility) => !['hide', 'off', false].includes(cloudVisibility)
