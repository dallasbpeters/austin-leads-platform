import DocumentsClient from '@/components/admin/documents-client'
import {
  ensureDocumentTables,
  hasDocumentDatabase,
  listDocumentClients,
  listDocumentLibraryItems,
  listSignatureRequests,
} from '@/lib/documents/db'
import { hasDocumentEmailProvider } from '@/lib/documents/email'

export const metadata = {
  title: 'Documents | Austin Leads Admin',
}

export default async function DocumentsPage() {
  const dbConfigured = hasDocumentDatabase()
  let documentDbReady = false
  let clients = []
  let requests = []
  let documents = []
  let dbError = null

  if (dbConfigured) {
    try {
      await ensureDocumentTables()
      const [loadedClients, loadedRequests, loadedDocuments] = await Promise.all([
        listDocumentClients({ limit: 200 }),
        listSignatureRequests({ limit: 100 }),
        listDocumentLibraryItems({ limit: 50 }),
      ])
      clients = loadedClients
      requests = loadedRequests
      documents = loadedDocuments
      documentDbReady = true
    } catch (error) {
      dbError = {
        message: error?.message || String(error),
        code: error?.code || error?.name || null,
      }
      console.error('[documents] failed to load document database', error)
    }
  }

  return (
    <DocumentsClient
      docusealConfigured={Boolean(process.env.DOCUSEAL_API_KEY)}
      docusealBaseUrl={process.env.DOCUSEAL_API_BASE_URL || 'https://api.docuseal.com'}
      resendConfigured={hasDocumentEmailProvider()}
      documentDbReady={documentDbReady}
      dbConfigured={dbConfigured}
      dbError={dbError}
      initialClients={clients}
      initialRequests={requests}
      initialDocuments={documents}
      showHistory={false}
    />
  )
}
