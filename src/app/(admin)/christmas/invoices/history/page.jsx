import ChristmasInvoicesHistoryClient from '@/components/admin/christmas-invoices-history-client'
import { ensureChristmasInvoiceTables, hasInvoiceDatabase, listInvoices } from '@/lib/christmas/invoice-db'
import { INVOICE_TEMPLATES } from '@/lib/christmas/invoice-templates'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Invoice History | Austin Leads Admin' }

export default async function ChristmasInvoicesHistoryPage() {
  const dbConfigured = hasInvoiceDatabase()
  let invoices = []
  let dbError = null

  if (dbConfigured) {
    try {
      await ensureChristmasInvoiceTables()
      invoices = await listInvoices({ limit: 500 })
    } catch (error) {
      dbError = { message: error?.message || String(error) }
      console.error('[christmas/invoices/history] failed to load invoices', error)
    }
  }

  return (
    <ChristmasInvoicesHistoryClient
      dbConfigured={dbConfigured}
      dbError={dbError}
      initialInvoices={invoices}
      templates={INVOICE_TEMPLATES}
    />
  )
}
