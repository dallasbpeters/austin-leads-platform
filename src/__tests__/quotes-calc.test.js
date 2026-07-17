import { describe, expect, it } from 'vitest'

import {
  AUSTIN_ENERGY_REBATE,
  computeQuote,
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

describe('computeQuote', () => {
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
    expect(result.netSystemPrice).toBe(ZIMMERMAN.systemPrice - AUSTIN_ENERGY_REBATE)
    expect(result.firstYearSavings).toBeCloseTo(11_707 * VALUE_OF_SOLAR_RATE, 0)
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

describe('isAustinEnergy', () => {
  it('matches variants', () => {
    expect(isAustinEnergy('Austin Energy')).toBe(true)
    expect(isAustinEnergy('austin  energy')).toBe(true)
    expect(isAustinEnergy('Oncor')).toBe(false)
    expect(isAustinEnergy('')).toBe(false)
  })
})
