import { describe, expect, it } from 'vitest'

import {
  AUSTIN_ENERGY_REBATE,
  computeQuote,
  defaultRebateForUtility,
  isAustinEnergy,
  MONTHLY_PRODUCTION_FACTORS,
  VALUE_OF_SOLAR_RATE,
} from '@/lib/quotes/calc'

// Baseline mirrors the real Zimmerman/Leander example proposal:
// 21 × 435W (9.135 kW), 11,707 kWh/yr, 12,910 kWh usage, $0.12/kWh, $32,130.
const ZIMMERMAN = {
  panelQuantity: 21,
  panelWatts: 435,
  annualProductionKwh: 11_707,
  annualConsumptionKwh: 12_910,
  utilityProvider: 'Oncor',
  utilityRate: 0.12,
  rateEscalation: 0.05,
  systemPrice: 32_130,
}

describe(computeQuote, () => {
  it('computes system size from panel count and wattage', () => {
    const result = computeQuote(ZIMMERMAN)
    expect(result.systemSizeKw).toBe(9.135)
  })

  it('matches the reference proposal lifetime savings within 5%', () => {
    // Reference proposal: $61,733 lifetime bill savings over 25 years.
    const result = computeQuote(ZIMMERMAN)
    expect(result.lifetimeSavings).toBeGreaterThan(61_733 * 0.95)
    expect(result.lifetimeSavings).toBeLessThan(61_733 * 1.05)
  })

  it('never includes a federal tax credit', () => {
    const result = computeQuote(ZIMMERMAN)
    const serialized = JSON.stringify(result).toLowerCase()
    expect(serialized).not.toContain('federal')
    expect(serialized).not.toContain('tax')
    // Non-Austin-Energy: net price equals gross price (no other discounts).
    expect(result.netSystemPrice).toBe(result.systemPrice)
  })

  it('applies the Austin Energy rebate and Value of Solar savings', () => {
    const result = computeQuote({ ...ZIMMERMAN, utilityProvider: 'Austin Energy' })
    expect(result.rebate).toBe(AUSTIN_ENERGY_REBATE)
    expect(result.rebateLabel).toBe('Austin Energy Rebate')
    expect(result.netSystemPrice).toBe(ZIMMERMAN.systemPrice - AUSTIN_ENERGY_REBATE)
    expect(result.firstYearSavings).toBeCloseTo(11_707 * VALUE_OF_SOLAR_RATE, 0)
  })

  it('applies a per-provider or custom utility rebate', () => {
    expect(defaultRebateForUtility('Austin Energy')).toBe(AUSTIN_ENERGY_REBATE)
    expect(defaultRebateForUtility('Oncor')).toBe(0)

    const custom = computeQuote({
      ...ZIMMERMAN,
      utilityProvider: 'Custom Energy Co',
      utilityRebate: 1200,
    })
    expect(custom.rebate).toBe(1200)
    expect(custom.rebateLabel).toBe('Custom Energy Co Rebate')
    expect(custom.netSystemPrice).toBe(ZIMMERMAN.systemPrice - 1200)
  })

  it('lets an explicit zero rebate override the provider default', () => {
    const overridden = computeQuote({
      ...ZIMMERMAN,
      utilityProvider: 'Austin Energy',
      utilityRebate: 0,
    })
    expect(overridden.rebate).toBe(0)
    expect(overridden.netSystemPrice).toBe(ZIMMERMAN.systemPrice)
  })

  it('applies an optional discount only when entered', () => {
    const without = computeQuote(ZIMMERMAN)
    expect(without.discount).toBe(0)
    expect(without.netSystemPrice).toBe(ZIMMERMAN.systemPrice)

    const withDiscount = computeQuote({ ...ZIMMERMAN, discount: 1500 })
    expect(withDiscount.discount).toBe(1500)
    expect(withDiscount.netSystemPrice).toBe(ZIMMERMAN.systemPrice - 1500)

    const withBoth = computeQuote({
      ...ZIMMERMAN,
      utilityProvider: 'Austin Energy',
      discount: 1000,
    })
    expect(withBoth.netSystemPrice).toBe(ZIMMERMAN.systemPrice - AUSTIN_ENERGY_REBATE - 1000)
  })

  it('estimates production from system size when not provided', () => {
    const result = computeQuote({ ...ZIMMERMAN, annualProductionKwh: 0 })
    expect(result.annualProductionKwh).toBeGreaterThan(9.135 * 1200)
    expect(result.annualProductionKwh).toBeLessThan(9.135 * 1500)
  })

  it('distributes monthly production that sums to the annual total', () => {
    const result = computeQuote(ZIMMERMAN)
    const total = result.monthlyProductionKwh.reduce((sum, kwh) => sum + kwh, 0)
    expect(total).toBeGreaterThan(11_707 * 0.995)
    expect(total).toBeLessThan(11_707 * 1.005)
    expect(MONTHLY_PRODUCTION_FACTORS.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 3)
  })

  it('caps savings at self-consumption for standard utilities without buyback', () => {
    const result = computeQuote({
      ...ZIMMERMAN,
      annualProductionKwh: 20_000, // oversized vs 12,910 usage
    })
    expect(result.firstYearSavings).toBeCloseTo(12_910 * 0.12, 0)
  })

  it('reports payback within a sensible range', () => {
    const result = computeQuote(ZIMMERMAN)
    expect(result.paybackYears).toBeGreaterThan(5)
    expect(result.paybackYears).toBeLessThan(25)
  })

  it('handles junk input without throwing', () => {
    const result = computeQuote({ panelQuantity: 'abc', panelWatts: null, systemPrice: -5 })
    expect(result.systemSizeKw).toBe(0)
    expect(result.netSystemPrice).toBe(0)
  })
})

describe(isAustinEnergy, () => {
  it('matches variants', () => {
    expect(isAustinEnergy('Austin Energy')).toBeTruthy()
    expect(isAustinEnergy('austin  energy')).toBeTruthy()
    expect(isAustinEnergy('Oncor')).toBeFalsy()
    expect(isAustinEnergy('')).toBeFalsy()
  })
})

describe('panel geometry', () => {
  it('builds a closed ring for rotated panels', async () => {
    const { panelCornerRing, PANEL_SIZES } = await import('@/lib/quotes/panel-geometry')
    const size = PANEL_SIZES['72-portrait']
    const ring = panelCornerRing(-97.74, 30.27, size.widthM, size.heightM, 45)
    expect(ring).toHaveLength(5)
    expect(ring[0]).toStrictEqual(ring[4])
  })

  it('scales panel footprints', async () => {
    const { panelSizeMeta, clampPanelScale, PANEL_SCALE_DEFAULT } =
      await import('@/lib/quotes/panel-geometry')
    const base = panelSizeMeta('72-portrait', 1)
    const scaled = panelSizeMeta('72-portrait', 2)
    expect(scaled.widthM).toBeCloseTo(base.widthM * 2)
    expect(scaled.heightM).toBeCloseTo(base.heightM * 2)
    expect(clampPanelScale()).toBe(PANEL_SCALE_DEFAULT)
  })
})
