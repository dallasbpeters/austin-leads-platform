import ChristmasMockupClient from '@/components/admin/christmas-mockup-client'
import { ensureChristmasInvoiceTables, getInvoice } from '@/lib/christmas/invoice-db'
import {
  ensureChristmasMockupTables,
  getMockup,
  getMockupForInvoice,
  getMockupRates,
} from '@/lib/christmas/mockup-db'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Christmas Lights — Mockup' }

const param = (params, key) => (typeof params?.[key] === 'string' ? params[key] : null)

async function loadInvoiceSummary(invoiceId) {
  const found = invoiceId ? await getInvoice(invoiceId) : null
  return found ? { id: found.id, invoiceNumber: found.invoiceNumber, customerName: found.customerName } : null
}

/*
 * ?invoice=<id> opens (or starts) the mockup saved with that invoice.
 * ?id=<mockup id> reopens a saved mockup. With neither, it's a new mockup
 * that can be saved under a customer or address name.
 */
export default async function ChristmasMockupPage({ searchParams }) {
  const params = await searchParams
  const mockupId = param(params, 'id')
  const invoiceId = param(params, 'invoice')

  let invoice = null
  let mockup = null
  let rates = {}
  try {
    await ensureChristmasInvoiceTables()
    await ensureChristmasMockupTables()
    rates = await getMockupRates()
    if (mockupId) {
      mockup = await getMockup(mockupId)
      invoice = await loadInvoiceSummary(mockup?.invoiceId)
    } else if (invoiceId) {
      invoice = await loadInvoiceSummary(invoiceId)
      mockup = invoice ? await getMockupForInvoice(invoiceId) : null
    }
  } catch (error) {
    console.error('[christmas/mockup/page] load failed', error)
  }

  return <ChristmasMockupClient initialRates={rates} invoice={invoice} savedMockup={mockup} />
}
