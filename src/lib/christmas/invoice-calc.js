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

export const CHRISTMAS_PACKAGE_PRESETS = [
  {
    id: 'roofline',
    label: 'Roofline Installation',
    startingPriceCents: 30_000,
    description: 'Roofline and gutter runs.',
    included: ['Professional installation', 'Mid-season bulb service', 'Post-holiday removal'],
    lineItems: [
      { description: 'Roofline & gutter LED light installation', quantity: 1, unitPriceCents: 30_000 },
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

export function computeChristmasInvoice(inputs = {}) {
  const rawItems = Array.isArray(inputs.lineItems) ? inputs.lineItems : []
  const lineItems = rawItems
    .map((item, index) => {
      const quantity = Math.max(0, Number(item.quantity) || 0)
      const unitPriceCents = toCents(item.unitPriceCents)
      return {
        key: String(item.key || `line-${index}`),
        description: String(item.description || '').trim(),
        quantity,
        unitPriceCents,
        amountCents: Math.round(quantity * unitPriceCents),
      }
    })
    .filter((item) => item.description || item.amountCents > 0)

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.amountCents, 0)
  const depositCents = toCents(inputs.depositCents)
  const balanceDueCents = Math.max(0, subtotalCents - depositCents)

  return { lineItems, subtotalCents, depositCents, balanceDueCents }
}
