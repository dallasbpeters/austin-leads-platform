/*
 * Texas Christmas Lights invoice math — shared by the admin builder, the
 * server create flow, and the PDF template so every surface agrees.
 *
 * An invoice is a list of free-form line items (description, quantity, unit
 * price) that make up a custom package for any client, plus an optional
 * deposit that is deducted from the subtotal to leave a balance due.
 *
 * Package presets mirror the packages offered on txchristmaslights.com
 * (Roofline, Full Front, Full Property) plus a fully Custom package. All
 * packages include professional installation, mid-season bulb service, and
 * post-holiday removal.
 */

/** The only four service types we sell — used as the line item category on quotes. */
export const CHRISTMAS_SERVICE_TYPES = ['Tree lights', 'Stake lights', 'Roofline / ridge', 'Garland']

/** The only three bulb colors we offer. */
export const CHRISTMAS_LIGHT_COLORS = ['Warm white', 'Multicolor', 'Bright white']

/*
 * Invoices saved before these lists existed hold free-text values. Keep an
 * unknown saved value selectable so opening an old invoice doesn't blank it.
 */
export function optionsWithCurrent(options, current) {
  const value = String(current || '').trim()
  return value && !options.includes(value) ? [...options, value] : options
}

export const CHRISTMAS_PACKAGE_PRESETS = [
  {
    id: 'roofline',
    label: 'Roofline Installation',
    startingPriceCents: 30_000,
    description: 'Roofline and gutter runs.',
    included: ['Professional installation', 'Mid-season bulb service', 'Post-holiday removal'],
    lineItems: [
      {
        category: 'Roofline / ridge',
        description: 'Roofline & gutter LED light installation',
        quantity: 1,
        unitPriceCents: 30_000,
      },
      { description: 'Mid-season bulb service', quantity: 1, unitPriceCents: 0 },
      { description: 'Post-holiday removal', quantity: 1, unitPriceCents: 0 },
    ],
  },
  {
    id: 'full-front',
    label: 'Full Front Installation',
    startingPriceCents: 50_000,
    description:
      'Everything in the roofline package plus trees, bushes, walkways, and any exterior features along the front of the property.',
    included: ['Professional installation', 'Mid-season bulb service', 'Post-holiday removal'],
    lineItems: [
      {
        description: 'Full front installation (roofline, trees, bushes, walkways & front features)',
        quantity: 1,
        unitPriceCents: 50_000,
      },
      { description: 'Mid-season bulb service', quantity: 1, unitPriceCents: 0 },
      { description: 'Post-holiday removal', quantity: 1, unitPriceCents: 0 },
    ],
  },
  {
    id: 'full-property',
    label: 'Full Property Installation',
    startingPriceCents: 100_000,
    description:
      'Roofline, front yard, backyard, side fences, and trees throughout. The full picture — designed on a walkthrough so nothing gets missed.',
    included: ['Professional installation', 'Mid-season bulb service', 'Post-holiday removal'],
    lineItems: [
      {
        description: 'Full property installation (roofline, front & back yards, fences, trees)',
        quantity: 1,
        unitPriceCents: 100_000,
      },
      { description: 'Mid-season bulb service', quantity: 1, unitPriceCents: 0 },
      { description: 'Post-holiday removal', quantity: 1, unitPriceCents: 0 },
    ],
  },
  {
    id: 'custom',
    label: 'Custom Package',
    startingPriceCents: null,
    description: 'Design your own package line by line for any client.',
    included: ['Professional installation', 'Mid-season bulb service', 'Post-holiday removal'],
    lineItems: [],
  },
]

export function getChristmasPackagePreset(id) {
  return CHRISTMAS_PACKAGE_PRESETS.find((preset) => preset.id === id) || CHRISTMAS_PACKAGE_PRESETS[0]
}

export function presetLineItems(id) {
  return getChristmasPackagePreset(id).lineItems.map((item) => ({ ...item }))
}

const toCents = (value) => Math.max(0, Math.round(Number(value) || 0))

/** Normalizes to 'N', 'R', or '' — anything else is treated as unset. */
const toNrFlag = (value) => {
  const upper = String(value || '')
    .trim()
    .toUpperCase()
  return upper === 'N' || upper === 'R' ? upper : ''
}

const percentOf = (cents, percent) => Math.round((Number(cents) || 0) * ((Number(percent) || 0) / 100))

function computeLineItemPricing(item, index, earlyPaymentDiscountPercent) {
  const quantity = Math.max(0, Number(item.quantity) || 0)
  const unitPriceCents = toCents(item.unitPriceCents)
  const amountCents = Math.round(quantity * unitPriceCents)
  const earlyPriceCents = Math.max(0, amountCents - percentOf(amountCents, earlyPaymentDiscountPercent))

  return {
    key: String(item.key || `line-${index}`),
    category: String(item.category || '').trim(),
    description: String(item.description || '').trim(),
    location: String(item.location || '').trim(),
    color: String(item.color || '').trim(),
    nr: toNrFlag(item.nr),
    quantity,
    unitPriceCents,
    amountCents,
    priceCents: amountCents,
    earlyPriceCents,
  }
}

/** Fully custom per-invoice schedule (e.g. 25% deposit, 40% by a date, 35% final) — % of the total contract cost. */
function computePaymentMilestones(inputs, totalContractCostCents) {
  const rawMilestones = Array.isArray(inputs.paymentMilestones) ? inputs.paymentMilestones : []
  return rawMilestones
    .map((milestone, index) => ({
      key: String(milestone.key || `milestone-${index}`),
      label: String(milestone.label || '').trim(),
      percent: Number(milestone.percent) || 0,
      date: milestone.date || '',
      amountCents: percentOf(totalContractCostCents, milestone.percent),
    }))
    .filter((milestone) => milestone.label || milestone.percent > 0)
}

export function computeChristmasInvoice(inputs = {}) {
  const rawItems = Array.isArray(inputs.lineItems) ? inputs.lineItems : []
  const earlyPaymentDiscountPercent = Number(inputs.earlyPaymentDiscountPercent) || 0
  const lineItems = rawItems
    .map((item, index) => computeLineItemPricing(item, index, earlyPaymentDiscountPercent))
    .filter((item) => item.description || item.amountCents > 0)

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.amountCents, 0)
  const depositCents = toCents(inputs.depositCents)
  const balanceDueCents = Math.max(0, subtotalCents - depositCents)

  // Quote pricing breakdown — regular price and the early-pay price, each with tax.
  const materialsTotalCents = subtotalCents
  const salesTaxRatePercent = Number(inputs.salesTaxRatePercent) || 0
  const salesTaxCents = percentOf(materialsTotalCents, salesTaxRatePercent)

  const earlyMaterialsTotalCents = lineItems.reduce((sum, item) => sum + item.earlyPriceCents, 0)
  const earlySalesTaxCents = percentOf(earlyMaterialsTotalCents, salesTaxRatePercent)
  const totalContractCostCents = earlyMaterialsTotalCents + earlySalesTaxCents

  const payInFullDiscountPercent = Number(inputs.payInFullDiscountPercent) || 0
  const payInFullSavingsCents = percentOf(totalContractCostCents, payInFullDiscountPercent)
  const payInFullAmountCents = totalContractCostCents - payInFullSavingsCents

  const paymentMilestones = computePaymentMilestones(inputs, totalContractCostCents)

  return {
    lineItems,
    subtotalCents,
    depositCents,
    balanceDueCents,
    materialsTotalCents,
    salesTaxRatePercent,
    salesTaxCents,
    earlyMaterialsTotalCents,
    earlyPaymentDiscountPercent,
    earlySalesTaxCents,
    totalContractCostCents,
    payInFullDiscountPercent,
    payInFullSavingsCents,
    payInFullAmountCents,
    paymentMilestones,
  }
}
