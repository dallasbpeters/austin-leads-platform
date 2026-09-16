import { describe, expect, it } from 'vitest'

import {
  CHRISTMAS_LIGHT_COLORS,
  CHRISTMAS_SERVICE_TYPES,
  computeChristmasInvoice,
  optionsWithCurrent,
} from '@/lib/christmas/invoice-calc'

describe('christmas quote service options', () => {
  it('offers exactly the five service types', () => {
    expect(CHRISTMAS_SERVICE_TYPES).toStrictEqual([
      'Tree lights',
      'Stake lights',
      'Roofline / ridge',
      'Garland',
      'Wreath',
    ])
  })

  it('offers exactly the three colors', () => {
    expect(CHRISTMAS_LIGHT_COLORS).toStrictEqual(['Warm white', 'Multicolor', 'Bright white'])
  })

  it('keeps a legacy free-text value selectable', () => {
    expect(optionsWithCurrent(CHRISTMAS_LIGHT_COLORS, 'Multi Colored')).toStrictEqual([
      ...CHRISTMAS_LIGHT_COLORS,
      'Multi Colored',
    ])
    expect(optionsWithCurrent(CHRISTMAS_LIGHT_COLORS, 'Warm white')).toBe(CHRISTMAS_LIGHT_COLORS)
    expect(optionsWithCurrent(CHRISTMAS_LIGHT_COLORS, '')).toBe(CHRISTMAS_LIGHT_COLORS)
  })

  it('carries service and color through to the priced line item', () => {
    const { lineItems } = computeChristmasInvoice({
      lineItems: [
        {
          category: 'Garland',
          color: 'Bright white',
          description: 'Porch',
          quantity: 2,
          unitPriceCents: 5000,
        },
      ],
    })
    expect(lineItems[0]).toMatchObject({ category: 'Garland', color: 'Bright white', amountCents: 10_000 })
  })
})
