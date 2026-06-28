import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import {
  createDocumentAuditEvent,
  ensureDocumentTables,
  getSignatureRequestById,
  hasDocumentDatabase,
  listDocumentAuditEvents,
  listDocumentRecipients,
  updateSignatureRequestStatus,
} from '@/lib/documents/db'

export const runtime = 'nodejs'

export async function DELETE(request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  if (!hasDocumentDatabase()) {
    return NextResponse.json({ error: 'Document database is not configured.' }, { status: 503 })
  }

  await ensureDocumentTables()

  const { requestId } = await params
  const requestRecord = await getSignatureRequestById(requestId)

  if (!requestRecord) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
  }

  await createDocumentAuditEvent({
    requestId: requestRecord.id,
    clientId: requestRecord.client_id,
    actorEmail: null,
    eventType: 'signature_request_deleted',
    eventSummary: 'Signature request deleted by an admin.',
    metadata: {
      requestId: requestRecord.id,
      sourceType: requestRecord.source_type,
      docusealSubmissionId: requestRecord.docuseal_submission_id || null,
    },
  })

  await updateSignatureRequestStatus(requestId, {
    status: 'deleted',
    providerPayload: {
      deletedAt: new Date().toISOString(),
      sourceType: requestRecord.source_type,
      docusealSubmissionId: requestRecord.docuseal_submission_id || null,
    },
  })

  return NextResponse.json({ ok: true, requestId })
}

export async function POST(request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  if (!hasDocumentDatabase()) {
    return NextResponse.json({ error: 'Document database is not configured.' }, { status: 503 })
  }

  await ensureDocumentTables()

  const { requestId } = await params
  const requestRecord = await getSignatureRequestById(requestId)

  if (!requestRecord) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
  }

  const [recipients, auditEvents] = await Promise.all([
    listDocumentRecipients(requestRecord.id),
    listDocumentAuditEvents(requestRecord.id),
  ])

  const body = await request.json().catch(() => ({}))
  const client = {
    id: requestRecord.client_id,
    name: requestRecord.client_name,
    email: requestRecord.client_email,
  }

  const { sendDocumentSignatureEmail } = await import('@/lib/documents/email')
  const emailResult = await sendDocumentSignatureEmail({
    client,
    request: requestRecord,
    recipients,
    message: body?.message || null,
  })

  await createDocumentAuditEvent({
    requestId: requestRecord.id,
    clientId: requestRecord.client_id,
    actorEmail: null,
    eventType:
      emailResult.status === 'sent' ? 'resend_signature_email_sent' : 'resend_signature_email_skipped',
    eventSummary:
      emailResult.status === 'sent'
        ? 'Signature request email sent through Resend.'
        : `Signature request email not sent: ${emailResult.reason}`,
    metadata: {
      ...emailResult,
      requestAuditCount: auditEvents.length,
    },
  })

  return NextResponse.json({ ok: true, email: emailResult })
}
