import { describe, expect, it } from 'vitest'

import { surfaceTone } from '@/lib/platform/surface-tone'

describe(surfaceTone, () => {
  it('picks dark text for light colours and light text for dark ones', () => {
    expect(surfaceTone('#f9f7f4')).toBe('light')
    expect(surfaceTone('#ffd06b')).toBe('light')
    expect(surfaceTone('#082f43')).toBe('dark')
    expect(surfaceTone('#de1017')).toBe('dark')
    expect(surfaceTone('#fff')).toBe('light')
    expect(surfaceTone('rgb(4, 10, 23)')).toBe('dark')
  })

  it('returns null for colours it cannot read, so the section keeps its own text colours', () => {
    expect(surfaceTone('oklch(50% 0 0)')).toBeNull()
    expect(surfaceTone('')).toBeNull()
    expect(surfaceTone(null)).toBeNull()
  })
})
