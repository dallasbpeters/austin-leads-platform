import { describe, expect, it } from 'vitest'

import { getAvatarInitials } from '@/components/consultation-section'

/**
 * Sanity hides invisible click-to-edit markers inside string fields. `personName`
 * and `avatarName` reach the browser with those markers still attached, on purpose,
 * so the Presentation overlay can make them clickable. Initials are built by taking
 * single characters out of that string, so the markers have to come off first —
 * otherwise an initial can be a lone invisible character and the Studio logs
 * "Failed to decode stega for string".
 */
const STEGA = '\u200B\u200C\u200D\u200B\u200C\u200D'

describe('getAvatarInitials', () => {
  const invisible = /[\u200B-\u200F\u2060\uFEFF]/

  it('returns plain letters when the name carries edit markers', () => {
    const initials = getAvatarInitials(`Dallas${STEGA} Peters${STEGA}`)
    expect(initials).toBe('DP')
    expect(invisible.test(initials)).toBe(false)
  })

  it('never emits an invisible character when markers lead the name', () => {
    const initials = getAvatarInitials(`${STEGA}Dallas Peters`)
    expect(initials).toBe('DP')
    expect(invisible.test(initials)).toBe(false)
  })

  it('still works on a plain name', () => {
    expect(getAvatarInitials('Dallas Peters')).toBe('DP')
    expect(getAvatarInitials('Cher')).toBe('C')
  })

  it('uses at most the first two words', () => {
    expect(getAvatarInitials('Mary Jo Anne Smith')).toBe('MJ')
  })

  it('returns an empty string for a missing name', () => {
    expect(getAvatarInitials(null)).toBe('')
    expect(getAvatarInitials('')).toBe('')
  })
})
