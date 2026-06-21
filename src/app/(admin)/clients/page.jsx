import ClientsClient from '@/components/admin/ClientsClient'
import { ensureDocumentTables, hasDocumentDatabase, listDocumentClients } from '@/lib/documents/db'

export const metadata = {
  title: 'Clients | Austin Leads Admin',
}

export default async function ClientsPage() {
  const dbConfigured = hasDocumentDatabase()
  let clientDbReady = false
  let clients = []
  let dbError = null

  if (dbConfigured) {
    try {
      await ensureDocumentTables()
      clients = await listDocumentClients({ limit: 300 })
      clientDbReady = true
    } catch (error) {
      dbError = {
        message: error?.message || String(error),
        code: error?.code || error?.name || null,
      }
      console.error('[clients] failed to load document clients', error)
    }
  }

  return (
    <ClientsClient
      initialClients={clients}
      clientDbReady={clientDbReady}
      dbConfigured={dbConfigured}
      dbError={dbError}
    />
  )
}
