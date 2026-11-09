import { describe, expect, it } from 'vitest'

import { roofView } from '@/components/platform/sections/solar-fit-roof'

const photo = (panels) => ({ metersWide: 80, metersTall: 80, panels })

describe(roofView, () => {
  it('shows as much of the photo as fits the map shape when there are no panels', () => {
    const view = roofView(photo([]), 1.9)
    expect(view.width).toBe(80)
    expect(view.width / view.height).toBeCloseTo(6 / 5)
    expect(view.y).toBeGreaterThan(0)
  })

  it('zooms to the panels with a margin around them', () => {
    const view = roofView(
      photo([
        { x: 30, y: 40 },
        { x: 50, y: 40 },
      ]),
      1.9,
    )
    expect(view.x).toBeLessThanOrEqual(30 - 1.9 - 3)
    expect(view.x + view.width).toBeGreaterThanOrEqual(50 + 1.9 + 3)
    expect(view.width).toBeLessThan(80)
    expect(view.width / view.height).toBeCloseTo(6 / 5)
  })

  it('stays inside the photo when the panels sit near its edge', () => {
    const view = roofView(
      photo([
        { x: 1, y: 1 },
        { x: 20, y: 2 },
      ]),
      1.9,
    )
    expect(view.x).toBeGreaterThanOrEqual(0)
    expect(view.y).toBeGreaterThanOrEqual(0)
    expect(view.x + view.width).toBeLessThanOrEqual(80)
    expect(view.y + view.height).toBeLessThanOrEqual(80)
  })
})
