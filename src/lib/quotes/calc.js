/*
 * Quote calculation engine for Texas Solar and Roofing Pros.
 *
 * IMPORTANT: The federal solar tax credit expired Dec 31, 2025 and must NOT
 * appear anywhere in these calculations or in generated documents.
 *
 * Incentives currently modeled:
 *  - Per-utility one-time rebate (defaults below; override per quote via utilityRebate)
 *  - Austin Energy Value of Solar (VoS) bill credits at 9.91¢/kWh on all
 *    solar production (customer is billed for full consumption at retail,
 *    credited for all production at the VoS rate)
 *  - Other utilities: savings from self-consumed solar at the retail rate,
 *    plus optional buyback rate on exported excess
 */

export const AUSTIN_ENERGY_REBATE = 2500
export const VALUE_OF_SOLAR_RATE = 0.0991 // $/kWh
export const DEFAULT_UTILITY_RATE = 0.12 // $/kWh retail
export const DEFAULT_RATE_ESCALATION = 0.04 // 4%/yr energy cost increase
export const DEFAULT_YIELD_KWH_PER_KW = 1350 // Austin-area annual yield per kW DC
export const PANEL_DEGRADATION = 0.005 // 0.5%/yr
export const SYSTEM_LIFETIME_YEARS = 25
export const CO2_LBS_PER_KWH = 0.8 // ERCOT grid average displaced emissions
export const LBS_PER_TON = 2000

/** Known utility providers and their default one-time rebate ($). Edit to update form defaults. */
export const UTILITY_REBATE_DEFAULTS = {
  'Austin Energy': AUSTIN_ENERGY_REBATE,
  Oncor: 0,
  'Pedernales Electric Cooperative': 0,
  'Bluebonnet Electric Cooperative': 0,
  'CenterPoint Energy': 0,
  Other: 0,
}

export const UTILITY_PROVIDER_OPTIONS = [...Object.keys(UTILITY_REBATE_DEFAULTS)]

// Monthly share of annual production for Central Texas (sums to 1).
// Derived from a PVWatts v8 run for the Austin area.
export const MONTHLY_PRODUCTION_FACTORS = [
  0.0611, 0.0575, 0.078, 0.096, 0.0998, 0.1074, 0.1092, 0.1071, 0.0866, 0.0771, 0.0642, 0.0561,
]

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const toNumber = (value, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const round = (value, digits = 0) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function isAustinEnergy(utilityProvider) {
  return /austin\s*energy/i.test(String(utilityProvider || ''))
}

/**
 * Default rebate ($) for a utility provider name.
 * Known list values use UTILITY_REBATE_DEFAULTS; Austin Energy variants match by name;
 * unknown / custom providers default to $0 (set utilityRebate on the quote).
 */
export function defaultRebateForUtility(utilityProvider) {
  const name = String(utilityProvider || '').trim()
  if (!name) {
    return 0
  }
  if (Object.hasOwn(UTILITY_REBATE_DEFAULTS, name)) {
    return UTILITY_REBATE_DEFAULTS[name]
  }
  if (isAustinEnergy(name)) {
    return AUSTIN_ENERGY_REBATE
  }
  return 0
}

/**
 * Resolve rebate from an explicit per-quote amount, else the provider default.
 * Pass utilityRebate (including 0) to override; omit / null / '' to use the default.
 */
export function resolveUtilityRebate(input = {}) {
  const raw = input.utilityRebate
  if (raw !== undefined && raw !== null && raw !== '') {
    return Math.max(0, toNumber(raw))
  }
  return defaultRebateForUtility(input.utilityProvider)
}

/**
 * Compute every derived number a quote needs from raw form inputs.
 *
 * @param {object} input
 * @param {number} input.panelQuantity    Number of panels
 * @param {number} input.panelWatts       Watts per panel (DC)
 * @param {number} [input.annualProductionKwh] Override; estimated from size if omitted
 * @param {number} [input.annualConsumptionKwh] Household usage; used for offset %
 * @param {string} [input.utilityProvider]
 * @param {number} [input.utilityRebate]  One-time utility rebate ($); defaults per provider
 * @param {number} [input.utilityRate]    Retail $/kWh
 * @param {number} [input.buybackRate]    $/kWh credited for exported excess (non-Austin Energy)
 * @param {number} [input.rateEscalation] Annual energy cost increase (fraction)
 * @param {number} input.systemPrice      Gross system price in dollars
 * @param {number} [input.discount]       Optional dollar discount (only applied when > 0)
 * @returns {object} computed quote values
 */
export function computeQuote(input = {}) {
  const panelQuantity = Math.max(0, Math.trunc(toNumber(input.panelQuantity)))
  const panelWatts = Math.max(0, toNumber(input.panelWatts))
  const systemSizeKw = (panelQuantity * panelWatts) / 1000

  const annualProductionKwh =
    toNumber(input.annualProductionKwh) > 0
      ? toNumber(input.annualProductionKwh)
      : systemSizeKw * DEFAULT_YIELD_KWH_PER_KW

  const annualConsumptionKwh = Math.max(0, toNumber(input.annualConsumptionKwh))
  const utilityRate = toNumber(input.utilityRate, DEFAULT_UTILITY_RATE)
  const buybackRate = Math.max(0, toNumber(input.buybackRate))
  const rateEscalation = toNumber(input.rateEscalation, DEFAULT_RATE_ESCALATION)
  const systemPrice = Math.max(0, toNumber(input.systemPrice))
  const discount = Math.max(0, toNumber(input.discount))

  const utilityName = String(input.utilityProvider || '').trim() || 'Utility'
  const austinEnergy = isAustinEnergy(input.utilityProvider)
  const rebate = resolveUtilityRebate(input)
  const netSystemPrice = Math.max(0, systemPrice - rebate - discount)

  const monthlyProductionKwh = MONTHLY_PRODUCTION_FACTORS.map((factor) => round(annualProductionKwh * factor))

  // First-year bill savings.
  let firstYearSavings
  if (austinEnergy) {
    // Billed full consumption at retail, credited all production at VoS.
    firstYearSavings = annualProductionKwh * VALUE_OF_SOLAR_RATE
  } else {
    const selfConsumedKwh = Math.min(annualProductionKwh, annualConsumptionKwh || annualProductionKwh)
    const exportedKwh = Math.max(0, annualProductionKwh - selfConsumedKwh)
    firstYearSavings = selfConsumedKwh * utilityRate + exportedKwh * buybackRate
  }

  // Year-by-year projection: savings escalate with energy prices while
  // production degrades slightly each year.
  const yearlySavings = []
  let lifetimeSavings = 0
  let cumulative = 0
  let paybackYears = null
  for (let year = 1; year <= SYSTEM_LIFETIME_YEARS; year += 1) {
    const savings =
      firstYearSavings * (1 + rateEscalation) ** (year - 1) * (1 - PANEL_DEGRADATION) ** (year - 1)
    const previousCumulative = cumulative
    cumulative += savings
    lifetimeSavings += savings
    yearlySavings.push(round(savings, 2))
    if (paybackYears === null && cumulative >= netSystemPrice && savings > 0) {
      paybackYears = year - 1 + (netSystemPrice - previousCumulative) / savings
    }
  }

  // Lifetime production with degradation, for CO2 offset.
  let lifetimeProductionKwh = 0
  for (let year = 1; year <= SYSTEM_LIFETIME_YEARS; year += 1) {
    lifetimeProductionKwh += annualProductionKwh * (1 - PANEL_DEGRADATION) ** (year - 1)
  }
  const co2OffsetTons = (lifetimeProductionKwh * CO2_LBS_PER_KWH) / LBS_PER_TON

  const consumptionOffsetPct = annualConsumptionKwh
    ? Math.min(150, round((annualProductionKwh / annualConsumptionKwh) * 100))
    : null

  return {
    systemSizeKw: round(systemSizeKw, 3),
    annualProductionKwh: round(annualProductionKwh),
    monthlyProductionKwh,
    isAustinEnergy: austinEnergy,
    rebate: round(rebate, 2),
    rebateLabel: rebate > 0 ? `${utilityName} Rebate` : null,
    discount: round(discount, 2),
    systemPrice: round(systemPrice, 2),
    netSystemPrice: round(netSystemPrice, 2),
    firstYearSavings: round(firstYearSavings, 2),
    yearlySavings,
    lifetimeSavings: round(lifetimeSavings, 2),
    netLifetimeSavings: round(lifetimeSavings - netSystemPrice, 2),
    averageAnnualSavings: round(lifetimeSavings / SYSTEM_LIFETIME_YEARS, 2),
    paybackYears: paybackYears === null ? null : round(paybackYears, 1),
    consumptionOffsetPct,
    co2OffsetTons: round(co2OffsetTons, 1),
    assumptions: {
      utilityRate,
      buybackRate,
      rateEscalation,
      panelDegradation: PANEL_DEGRADATION,
      valueOfSolarRate: austinEnergy ? VALUE_OF_SOLAR_RATE : null,
      yieldKwhPerKw: round(annualProductionKwh / (systemSizeKw || 1)),
      lifetimeYears: SYSTEM_LIFETIME_YEARS,
      co2LbsPerKwh: CO2_LBS_PER_KWH,
    },
  }
}
