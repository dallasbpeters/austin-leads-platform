/** Social previews (OG / Twitter) — length targets from common checker heuristics. */
export const SHARE_TITLE_MAX = 55
export const SHARE_DESCRIPTION_MAX = 155

/**
 * Trim to max length on a word boundary when possible; append ellipsis when truncated.
 *
 * @param {string} text
 * @param {number} maxLen
 */
export const truncateForShare = (text, maxLen) => {
  if (!text || typeof text !== 'string') {
    return ''
  }
  const t = text.trim().replaceAll(/\s+/g, ' ')
  if (t.length <= maxLen) {
    return t
  }
  const slice = t.slice(0, maxLen - 1)
  const i = slice.lastIndexOf(' ')
  const base = i > Math.floor(maxLen * 0.35) ? slice.slice(0, i) : slice
  return `${base.trimEnd()}…`
}
