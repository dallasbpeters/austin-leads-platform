import { describe, expect, it } from 'vitest'

import { findOffset } from '@/lib/solar-fit/align'

// A fake roof: two rectangles and a diagonal ridge, in metres from the centre.
const roof = (x, y) => {
  if (Math.abs(x) < 6 && Math.abs(y) < 4) {
    return x > y ? 180 : 120
  }
  if (x > 2 && x < 9 && y > 4 && y < 9) {
    return 200
  }
  return 40
}

describe(findOffset, () => {
  it('finds how far the roof moved between two photos', () => {
    // The second photo shows the same roof 1.6 m east and 0.8 m north (y is south).
    const result = findOffset(roof, (x, y) => roof(x - 1.6, y + 0.8))
    expect(result.dx).toBeCloseTo(1.6, 5)
    expect(result.dy).toBeCloseTo(-0.8, 5)
    expect(result.score).toBeGreaterThan(0.5)
  })

  it('finds no shift when the photos already line up', () => {
    const result = findOffset(roof, roof)
    expect(result.dx).toBeCloseTo(0, 5)
    expect(result.dy).toBeCloseTo(0, 5)
  })
})
