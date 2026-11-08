import { describe, expect, it } from 'vitest'

import { roofView } from '@/components/platform/sections/solar-fit-roof'

const photo = (panels) => ({ metersWide: 80, metersTall: 80, panels })

describe(roofView, () => {
  it('shows the whole photo when there are no panels', () => {
    expect(roofView(photo([]), 1.9)).toStrictEqual({ x: 0, y: 0, size: 80 })
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
    expect(view.x + view.size).toBeGreaterThanOrEqual(50 + 1.9 + 3)
    expect(view.size).toBeLessThan(80)
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
    expect(view.x + view.size).toBeLessThanOrEqual(80)
  })
})
