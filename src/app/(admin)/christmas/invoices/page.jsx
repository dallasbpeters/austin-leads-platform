import ChristmasInvoicesClient from '@/components/admin/christmas-invoices-client'
import { safeAuth } from '@/lib/auth/session'
import { CHRISTMAS_PACKAGE_PRESETS } from '@/lib/christmas/invoice-calc'
import { ensureChristmasInvoiceTables, getInvoice, listInvoices } from '@/lib/christmas/invoice-db'
import { getChristmasInvoiceSettings } from '@/lib/christmas/invoice-settings'
import { INVOICE_TEMPLATES } from '@/lib/christmas/invoice-templates'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Christmas Lights — Invoices' }

export default async function ChristmasInvoicesPage({ searchParams }) {
  const params = await searchParams
  const editId = typeof params?.edit === 'string' ? params.edit : null
  const dupeId = typeof params?.dupe === 'string' ? params.dupe : null
  const fromMockup = params?.fromMockup === '1'
  const session = await safeAuth()

  let invoices = []
  let settings = null
  // The invoice behind ?edit= / ?dupe=, loaded by id so the builder can open it
  // even when it falls outside the recent-invoice list below.
  let preloadInvoice = null

  try {
    await ensureChristmasInvoiceTables()
    const [list, loadedSettings, target] = await Promise.all([
      listInvoices({ limit: 200 }),
      getChristmasInvoiceSettings(),
      editId || dupeId ? getInvoice(editId || dupeId) : null,
    ])
    invoices = list
    settings = loadedSettings
    preloadInvoice = target
  } catch (error) {
    console.error('[christmas/invoices/page] db error:', error)
  }

  const zohoAuthEnabled = Boolean(
    (process.env.AUTH_ZOHO_ID || process.env.ZOHO_CLIENT_ID) &&
    (process.env.AUTH_ZOHO_SECRET || process.env.ZOHO_CLIENT_SECRET),
  )

  return (
    <ChristmasInvoicesClient
      dupeId={dupeId}
      editId={editId}
      fromMockup={fromMockup}
      invoices={invoices}
      preloadInvoice={preloadInvoice}
      presets={CHRISTMAS_PACKAGE_PRESETS}
      settings={settings}
      templates={INVOICE_TEMPLATES}
      zohoAuthEnabled={zohoAuthEnabled}
      zohoConnected={Boolean(session?.user?.zohoConnected) && !session?.user?.zohoNeedsReauth}
    />
  )
}
