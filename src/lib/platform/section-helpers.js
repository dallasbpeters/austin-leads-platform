/**
 * Match a homepage/page hero block from Sanity sections.
 * Older or Canvas-sourced docs may omit the hidden `type` field and only set `_type: 'heroSection'`.
 */
export const isHeroSectionBlock = (section) =>
  Boolean(section && (section.type === 'hero' || section._type === 'heroSection'))
