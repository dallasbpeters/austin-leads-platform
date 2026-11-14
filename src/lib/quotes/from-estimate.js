/*
 * A draft quote from a "See if solar is right for you" estimate, so the team
 * starts the real quote from what the homeowner already told us instead of a
 * blank form. The draft is saved like any other quote (status 'draft') with the
 * roof picture as its system layout image, which the quote editor can replace
 * under System Layout → Upload. Nothing is emailed or synced to Zoho: that only
 * happens when someone saves or sends the quote from /quotes.
 */

import { computeQuote, DEFAULT_RATE_ESCALATION, DEFAULT_UTILITY_RATE } from '@/lib/quotes/calc'
import { ensureQuotesTable, hasQuoteDatabase, insertQuote } from '@/lib/quotes/db'
import { roofPhoto } from '@/lib/solar-fit/google'
import { renderRoofLayout } from '@/lib/solar-fit/roof-render'

const finite = (value) => (Number.isFinite(Number(value)) ? Number(value) : null)

/** "13205 Shady Mountain Rd, Leander, TX 78641, USA" -> street, city, state, zip. */
export function splitAddress(address = '') {
  const parts = String(address)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.at(-1) === 'USA') {
    parts.pop()
  }
  const stateZip = parts.length >= 3 ? parts.pop().match(/^([A-Z]{2})\s*(\d{5})?/) : null
  const city = parts.length >= 2 ? parts.pop() : ''
  return {
    propertyAddress: parts.join(', '),
    propertyCity: city,
    propertyState: stateZip?.[1] || 'TX',
    propertyZip: stateZip?.[2] || '',
  }
}

/** The label of the option the visitor picked, e.g. "Tesla Powerwall 3" for 2. */
function optionLabel(model, key, value) {
  const input = model.inputs.find((candidate) => candidate.key === key)
  return input?.options?.find((option) => String(option.value) === String(value))?.label || ''
}

/**
 * Quote inputs from an estimate. Pure, so it is tested without a database.
 *
 * @param {object} params
 * @param {object} params.lead     fullName, email, phone, address
 * @param {object} params.model    resolveModel() result, for constants and option labels
 * @param {object} params.answers  the visitor's answers, by input key
 * @param {object} params.results  the estimate's outputs, by output key
 * @param {object} params.roof     roofExtras() result (roofFound, roofPanels, roofSystemKw, roofYearlyKwh)
 * @param {string} [params.layoutImage] data URL of the roof picture
 * @param {string} [params.leadId]
 */
export function estimateToQuoteInputs({
  lead,
  model,
  answers = {},
  results = {},
  roof = {},
  layoutImage,
  leadId,
}) {
  const constants = Object.fromEntries(
    (model.constants || []).map((constant) => [constant.key, constant.value]),
  )
  const austinEnergy = Number(answers.austinEnergy) === 1
  // Oncor and PEC share the answer 0 on the form, so anything else is left as "Other" to fill in.
  const utilityProvider =
    'austinEnergy' in answers ? (austinEnergy ? 'Austin Energy' : 'Other') : 'Austin Energy'
  const rebate = utilityProvider === 'Austin Energy' ? (finite(constants.rebate) ?? 4000) : 0

  const panelQuantity = Math.round(finite(results.panels) ?? finite(roof.roofPanels) ?? 0)
  const panelWatts =
    roof.roofFound && roof.roofPanels > 0
      ? Math.round((roof.roofSystemKw * 1000) / roof.roofPanels)
      : Math.round((finite(constants.panelKw) ?? 0.4) * 1000)
  const annualProductionKwh = roof.roofFound
    ? Math.round(roof.roofYearlyKwh)
    : Math.round((finite(results.systemKw) ?? 0) * (finite(results.sunFactor) ?? 0))

  // The estimate's cost is after the rebate; the quote takes the price before it and subtracts it itself.
  const netCost = finite(results.netCost) ?? 0
  const systemPrice = netCost > 0 ? Math.round(netCost + rebate) : 0

  const batteryType = finite(answers.batteryType) ?? 0
  const battery = batteryType > 0 ? optionLabel(model, 'batteryType', batteryType) : ''

  return {
    customerName: lead.fullName || '',
    customerEmail: lead.email || '',
    customerPhone: lead.phone || '',
    ...splitAddress(lead.address),
    utilityProvider,
    utilityRebate: rebate,
    panelMakeModel: '',
    panelWatts,
    panelQuantity,
    inverterMakeModel: '',
    inverterQuantity: 1,
    batteryMakeModel: battery,
    batteryQuantity: battery ? (finite(answers.batteries) ?? 1) : '',
    warrantyDetails: '25-Year Panel Product and Performance Warranty',
    annualProductionKwh,
    annualConsumptionKwh: Math.round((finite(answers.consumption) ?? 0) * 12),
    utilityRate: finite(results.rate) ? Math.round(results.rate * 10_000) / 10_000 : DEFAULT_UTILITY_RATE,
    rateEscalation: finite(constants.increase) ?? DEFAULT_RATE_ESCALATION,
    buybackRate: 0,
    systemPrice,
    discount: 0,
    systemLayoutMode: 'upload',
    systemLayout: null,
    systemLayoutUrl: layoutImage || '',
    estimateLeadId: leadId || '',
  }
}

/** The roof picture, or '' when there is no roof or the photo can't be made. */
async function layoutImageFor(fullRoof, panelCount) {
  if (!fullRoof?.panels?.length || !(panelCount > 0)) {
    return ''
  }
  try {
    const photo = await roofPhoto(fullRoof)
    return await renderRoofLayout({ roof: fullRoof, photo, count: panelCount })
  } catch (error) {
    console.warn('[estimate-quote] roof picture failed; saving the draft without it', error)
    return ''
  }
}

/**
 * Saves a draft quote for an estimate. Never throws, so a failure here can't
 * lose the lead; it reports what happened instead.
 *
 * @param {object} params  As estimateToQuoteInputs, plus:
 * @param {object} [params.fullRoof]  roofAt() result, for the picture
 * @param {number} [params.panelCount]
 */
export async function createDraftQuoteFromEstimate({ fullRoof, panelCount, ...estimate }) {
  if (!hasQuoteDatabase()) {
    return { status: 'skipped', reason: 'Database is not configured.' }
  }
  try {
    const layoutImage = await layoutImageFor(fullRoof, panelCount)
    const inputs = estimateToQuoteInputs({ ...estimate, layoutImage })
    if (!(inputs.panelQuantity > 0 && inputs.panelWatts > 0 && inputs.systemPrice > 0)) {
      return { status: 'skipped', reason: 'The estimate has no panel count or price.' }
    }
    await ensureQuotesTable()
    const quote = await insertQuote({ inputs, computed: computeQuote(inputs) })
    return {
      status: 'created',
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      image: Boolean(layoutImage),
    }
  } catch (error) {
    console.error('[estimate-quote] draft quote failed', error)
    return { status: 'failed', reason: error instanceof Error ? error.message : String(error) }
  }
}
