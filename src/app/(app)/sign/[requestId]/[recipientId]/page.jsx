import { notFound } from 'next/navigation'

import DocumentSigningClient from '@/components/documents/document-signing-client'
import {
  ensureDocumentTables,
  getDocumentLibraryItemById,
  getDocumentRecipientById,
  getSignatureRequestById,
  hasDocumentDatabase,
} from '@/lib/documents/db'

export const metadata = {
  title: 'Sign document | Austin Leads Platform',
}

export default async function SignDocumentPage({ params }) {
  const { requestId, recipientId } = await params

  if (!hasDocumentDatabase()) {
    notFound()
  }

  await ensureDocumentTables()

  const [request, recipient] = await Promise.all([
    getSignatureRequestById(requestId),
    getDocumentRecipientById(recipientId),
  ])

  if (!request || !recipient || recipient.request_id !== request.id) {
    notFound()
  }

  const documentAsset = request.document_asset_id
    ? await getDocumentLibraryItemById(request.document_asset_id)
    : null
  const previewUrl = documentAsset
    ? `/api/documents/library/${documentAsset.id}/file`
    : request.provider_payload?.submission?.documents?.[0]?.url ||
      request.provider_payload?.documents?.[0]?.url ||
      ''
  const client =
    request.client_name || request.client_email
      ? { name: request.client_name, email: request.client_email }
      : null

  return (
    <DocumentSigningClient request={request} recipient={recipient} client={client} previewUrl={previewUrl} />
  )
}
