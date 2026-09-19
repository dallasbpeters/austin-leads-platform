import Link from 'next/link'
import { notFound } from 'next/navigation'

import DocumentRequestActions from '@/components/admin/document-request-actions'
import PdfPreviewSurface from '@/components/admin/pdf-preview-surface'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ensureDocumentTables,
  getDocumentLibraryItemById,
  getSignatureRequestById,
  hasDocumentDatabase,
  listDocumentAuditEvents,
  listDocumentRecipients,
} from '@/lib/documents/db'

export const metadata = {
  title: 'Document request | Austin Leads Admin',
}

function formatDate(value) {
  if (!value) {
    return 'Not set'
  }
  return new Date(value).toLocaleString()
}

function getStatusLabel(request, recipients) {
  if (request?.status === 'deleted') {
    return 'deleted'
  }
  const statuses = recipients.map((recipient) => recipient.status)
  const completed = statuses.filter((status) => status === 'completed').length
  const declined = statuses.filter((status) => status === 'declined').length
  if (completed && declined) {
    return 'mixed'
  }
  if (completed && completed === recipients.length) {
    return 'completed'
  }
  if (declined && declined === recipients.length) {
    return 'declined'
  }
  return request?.status || 'sent'
}

export default async function DocumentRequestPage({ params }) {
  if (!hasDocumentDatabase()) {
    notFound()
  }

  await ensureDocumentTables()
  const { requestId } = await params
  const request = await getSignatureRequestById(requestId)

  if (!request) {
    notFound()
  }

  const [recipients, auditEvents, documentAsset] = await Promise.all([
    listDocumentRecipients(request.id),
    listDocumentAuditEvents(request.id),
    request.document_asset_id ? getDocumentLibraryItemById(request.document_asset_id) : null,
  ])
  const status = getStatusLabel(request, recipients)
  const providerDocuments =
    request.provider_payload?.documents || request.provider_payload?.submission?.documents || []
  const latestEmailEvent =
    auditEvents.find((event) => event.event_type === 'resend_signature_email_sent') ||
    auditEvents.find((event) => event.event_type === 'resend_signature_email_skipped') ||
    null
  const recipientLinks = recipients.map((recipient) => ({
    label: recipient.name || recipient.email || 'Recipient',
    url: recipient.signing_url || '',
  }))

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Document request</p>
          <h1 className="text-foreground mt-2 text-3xl tracking-normal">{request.title}</h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-[1rem] leading-7">
            Stored document, signer status, and audit records in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{status}</Badge>
          <Badge variant="outline">{request.source_type}</Badge>
          <Button asChild variant="outline">
            <Link href="/documents">Back</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-[1rem]">Preview</CardTitle>
            <CardDescription>Stored PDF or original source file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DocumentRequestActions
              requestId={request.id}
              recipientLinks={recipientLinks}
              canSync={Boolean(request.docuseal_submission_id)}
              canEmail={Boolean(recipientLinks.some((recipient) => recipient.url))}
              canDelete
              previewHref={`/documents/${request.id}/email`}
            />
            {documentAsset ? (
              <>
                <div className="overflow-hidden rounded-lg border">
                  <PdfPreviewSurface
                    sourceUrl={`/api/documents/library/${documentAsset.id}/file`}
                    title={documentAsset.title}
                    emptyLabel="No stored preview is available for this request yet."
                    maxRenderWidth={520}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link
                      href={`/api/documents/library/${documentAsset.id}/file`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open file
                    </Link>
                  </Button>
                </div>
              </>
            ) : providerDocuments.length ? (
              <div className="space-y-3">
                {providerDocuments.map((doc, index) => (
                  <div key={doc.url || index} className="border-border rounded-md border p-3">
                    <div className="font-medium">{doc.name || `Document ${index + 1}`}</div>
                    {doc.url ? (
                      <div className="mt-3 overflow-hidden rounded-lg border">
                        <PdfPreviewSurface
                          sourceUrl={doc.url}
                          title={doc.name || `Document ${index + 1}`}
                          emptyLabel="No source preview available."
                          maxRenderWidth={520}
                        />
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm break-all">{doc.url}</div>
                    )}
                    {doc.url ? (
                      <Button asChild variant="outline" size="sm" className="mt-3">
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground border-border rounded-md border p-4 text-sm">
                No stored preview is available for this request yet.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[1rem]">Request</CardTitle>
              <CardDescription>Stored metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6">
              <div>
                <div className="text-muted-foreground">Client</div>
                <div className="font-medium">{request.client_name || 'Unknown client'}</div>
                <div className="text-muted-foreground">{request.client_email || 'No email'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="font-medium">{status}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Sent</div>
                <div className="font-medium">{formatDate(request.sent_at || request.created_at)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Source submission</div>
                <div className="font-medium">{request.docuseal_submission_id || 'Not set'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Delivery</div>
                <div className="font-medium">{request.send_channel || 'resend'}</div>
                <div className="text-muted-foreground">
                  {latestEmailEvent
                    ? latestEmailEvent.event_summary
                    : 'No email audit recorded yet. Use Resend email to send or retry delivery.'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[1rem]">Recipients</CardTitle>
              <CardDescription>Signer status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recipients.map((recipient) => (
                <div key={recipient.id} className="border-border rounded-md border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{recipient.name || recipient.email}</div>
                      <div className="text-muted-foreground">{recipient.email}</div>
                    </div>
                    <Badge variant="outline">{recipient.status}</Badge>
                  </div>
                  <div className="text-muted-foreground mt-2 text-xs">
                    {recipient.role || 'Signer'} · {formatDate(recipient.sent_at || recipient.created_at)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[1rem]">Audit</CardTitle>
              <CardDescription>Events stored for the request.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditEvents.map((event) => (
                <div key={event.id} className="border-border rounded-md border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium">{event.event_type}</div>
                    <div className="text-muted-foreground text-xs">{formatDate(event.created_at)}</div>
                  </div>
                  <div className="text-muted-foreground mt-2 text-sm">{event.event_summary}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
