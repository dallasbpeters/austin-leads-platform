import { describe, expect, it } from 'vitest'

import { computeChristmasInvoice } from '@/lib/christmas/invoice-calc'
import { ChristmasInvoiceDocument } from '@/lib/christmas/invoice-pdf'

function textContent(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(textContent).join(' ')
  }
  return node?.props ? textContent(node.props.children) : ''
}

describe('christmas quote pricing', () => {
  it('shows discounted materials and tax that add up to the contract total', () => {
    const inputs = {
      lineItems: [{ description: 'Roofline', quantity: 1, unitPriceCents: 101_250 }],
      earlyPaymentDiscountPercent: 20,
      salesTaxRatePercent: 8.25,
    }
    const computed = computeChristmasInvoice(inputs)
    const document = ChristmasInvoiceDocument({ invoiceNumber: 'TEST', data: { inputs, computed } })
    const text = textContent(document)

    expect(text).toContain('EARLY PRICE MATERIALS $810.00')
    expect(text).toContain('SALES TAX (8.25%) $66.83')
    expect(text).toContain('TOTAL CONTRACT COST $876.83')
    expect(computed.earlyMaterialsTotalCents + computed.earlySalesTaxCents).toBe(
      computed.totalContractCostCents,
    )
  })
})
