import ChristmasInvoiceSettingsClient from '@/components/admin/christmas-invoice-settings-client'
import { ensureChristmasInvoiceTables } from '@/lib/christmas/invoice-db'
import { getChristmasInvoiceSettings } from '@/lib/christmas/invoice-settings'
import { INVOICE_TEMPLATES } from '@/lib/christmas/invoice-templates'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Christmas Lights — Invoice Settings' }

export default async function ChristmasInvoiceSettingsPage() {
  let settings = null

  try {
    await ensureChristmasInvoiceTables()
    settings = await getChristmasInvoiceSettings()
  } catch (error) {
    console.error('[christmas/invoices/settings/page] db error:', error)
  }

  return <ChristmasInvoiceSettingsClient initialSettings={settings} templates={INVOICE_TEMPLATES} />
}
