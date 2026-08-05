import ChristmasInvoiceSettingsClient from '@/components/admin/christmas-invoice-settings-client'
import { ensureChristmasInvoiceTables } from '@/lib/christmas/invoice-db'
import { getChristmasInvoiceSettings } from '@/lib/christmas/invoice-settings'
import { INVOICE_TEMPLATES } from '@/lib/christmas/invoice-templates'
import { hasJobberCredentials } from '@/lib/jobber/auth'
import { ensureJobberTables, getJobberConnection, isJobberConnected } from '@/lib/jobber/db'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Christmas Lights — Invoice Settings' }

async function loadJobberStatus() {
  if (!hasJobberCredentials()) {
    return { hasCredentials: false, connected: false, accountName: null }
  }
  try {
    await ensureJobberTables()
    const connection = await getJobberConnection()
    return {
      hasCredentials: true,
      connected: isJobberConnected(connection),
      accountName: connection?.accountName || null,
    }
  } catch (error) {
    console.error('[christmas/invoices/settings/page] jobber status error:', error)
    return { hasCredentials: true, connected: false, accountName: null }
  }
}

export default async function ChristmasInvoiceSettingsPage({ searchParams }) {
  const params = await searchParams
  let settings = null

  try {
    await ensureChristmasInvoiceTables()
    settings = await getChristmasInvoiceSettings()
  } catch (error) {
    console.error('[christmas/invoices/settings/page] db error:', error)
  }

  const jobber = await loadJobberStatus()

  return (
    <ChristmasInvoiceSettingsClient
      initialSettings={settings}
      jobber={jobber}
      jobberConnectError={typeof params?.jobber_error === 'string' ? params.jobber_error : null}
      jobberJustConnected={params?.jobber_connected === '1'}
      templates={INVOICE_TEMPLATES}
    />
  )
}
