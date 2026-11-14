import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/quotes/db', () => ({}))
vi.mock('@/lib/solar-fit/google', () => ({}))
vi.mock('@/lib/solar-fit/roof-render', () => ({}))

const { estimateToQuoteInputs, splitAddress } = await import('@/lib/quotes/from-estimate')
const { computeQuote } = await import('@/lib/quotes/calc')

const model = {
  inputs: [
    {
      key: 'batteryType',
      options: [
        { label: 'No battery', value: 0 },
        { label: 'FranklinWH', value: 1 },
        { label: 'Tesla Powerwall 3', value: 2 },
      ],
    },
  ],
  constants: [
    { key: 'rebate', value: 4000 },
    { key: 'increase', value: 0.03 },
    { key: 'panelKw', value: 0.4 },
  ],
}

const estimate = {
  lead: {
    fullName: 'Pat Example',
    email: 'pat@example.com',
    phone: '512-555-0100',
    address: '100 Example Rd, Leander, TX 78641, USA',
  },
  model,
  answers: { bill: 450, consumption: 1200, austinEnergy: 0, batteryType: 2, batteries: 2 },
  results: { panels: 25, systemKw: 10, rate: 0.375, netCost: 58_300, sunFactor: 1547.6 },
  roof: { roofFound: 1, roofPanels: 25, roofSystemKw: 10, roofYearlyKwh: 14_840.63 },
  layoutImage: 'data:image/jpeg;base64,AAAA',
  leadId: 'lead-1',
}

describe(splitAddress, () => {
  it('splits a Google address into street, city, state and zip', () => {
    expect(splitAddress('100 Example Rd, Leander, TX 78641, USA')).toStrictEqual({
      propertyAddress: '100 Example Rd',
      propertyCity: 'Leander',
      propertyState: 'TX',
      propertyZip: '78641',
    })
  })

  it('keeps a unit in the street line', () => {
    expect(splitAddress('1 Main St unit 4, Austin, TX 78701, USA').propertyAddress).toBe('1 Main St unit 4')
  })

  it('handles an empty address', () => {
    expect(splitAddress('')).toMatchObject({ propertyAddress: '', propertyCity: '', propertyState: 'TX' })
  })
})

describe(estimateToQuoteInputs, () => {
  it('fills the customer, system, energy and layout fields from the estimate', () => {
    const inputs = estimateToQuoteInputs(estimate)
    expect(inputs).toMatchObject({
      customerName: 'Pat Example',
      customerEmail: 'pat@example.com',
      customerPhone: '512-555-0100',
      propertyCity: 'Leander',
      propertyZip: '78641',
      panelQuantity: 25,
      panelWatts: 400,
      annualProductionKwh: 14_841,
      annualConsumptionKwh: 14_400,
      utilityRate: 0.375,
      rateEscalation: 0.03,
      batteryMakeModel: 'Tesla Powerwall 3',
      batteryQuantity: 2,
      systemLayoutMode: 'upload',
      systemLayoutUrl: 'data:image/jpeg;base64,AAAA',
      estimateLeadId: 'lead-1',
    })
  })

  it('leaves a non-Austin Energy utility as Other with no rebate, at the estimate price', () => {
    const inputs = estimateToQuoteInputs(estimate)
    expect(inputs.utilityProvider).toBe('Other')
    expect(inputs.utilityRebate).toBe(0)
    expect(inputs.systemPrice).toBe(58_300)
  })

  it('adds the Austin Energy rebate back, since the quote subtracts it itself', () => {
    const inputs = estimateToQuoteInputs({ ...estimate, answers: { ...estimate.answers, austinEnergy: 1 } })
    expect(inputs.utilityProvider).toBe('Austin Energy')
    expect(inputs.systemPrice).toBe(62_300)
    expect(computeQuote(inputs).netSystemPrice).toBe(58_300)
  })

  it('has no battery when none was picked', () => {
    const inputs = estimateToQuoteInputs({ ...estimate, answers: { ...estimate.answers, batteryType: 0 } })
    expect(inputs.batteryMakeModel).toBe('')
    expect(inputs.batteryQuantity).toBe('')
  })

  it('uses the panel size constant when no roof was found', () => {
    const inputs = estimateToQuoteInputs({ ...estimate, roof: { roofFound: 0 } })
    expect(inputs.panelWatts).toBe(400)
    expect(inputs.annualProductionKwh).toBe(15_476)
  })

  it('gives inputs the quote math accepts', () => {
    const computed = computeQuote(estimateToQuoteInputs(estimate))
    expect(computed.systemSizeKw).toBe(10)
    expect(computed.systemPrice).toBe(58_300)
  })
})
