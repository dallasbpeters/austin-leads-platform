import { NextResponse } from 'next/server'

import {
  createDocumentAuditEvent,
  ensureDocumentTables,
  getDocumentRecipientById,
  getSignatureRequestById,
  hasDocumentDatabase,
  listDocumentRecipients,
  updateDocumentRecipientStatus,
  updateSignatureRequestStatus,
} from '@/lib/documents/db'

export const runtime = 'nodejs'

const DEFAULT_DOCUSEAL_BASE_URL = 'https://api.docuseal.com'

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeBaseUrl(value) {
  const baseUrl = cleanString(value) || DEFAULT_DOCUSEAL_BASE_URL
  return baseUrl.replace(/\/+$/, '')
}

function normalizeSubmitters(data) {
  if (Array.isArray(data?.submitters)) return data.submitters
  if (Array.isArray(data?.submission?.submitters)) return data.submission.submitters
  return []
}

function determineRequestStatus(providerStatus) {
  if (providerStatus === 'completed') return 'completed'
  if (providerStatus === 'declined') return 'declined'
  if (providerStatus === 'archived') return 'archived'
  return 'sent'
}

function determineOverallStatus(statuses, providerStatus) {
  const normalized = statuses.map((status) => cleanString(status).toLowerCase()).filter(Boolean)
  const completed = normalized.filter((status) => status === 'completed').length
  const declined = normalized.filter((status) => status === 'declined').length
  const active = normalized.filter((status) =>
    ['sent', 'pending', 'opened', 'started', 'awaiting'].includes(status),
  ).length

  if (providerStatus === 'archived') return 'archived'
  if (completed && declined) return 'mixed'
  if (completed && !declined && !active) return 'completed'
  if (declined && !completed && !active) return 'declined'
  if (completed) return 'signed'
  if (declined) return 'declined'
  if (active) return 'sent'
  return providerStatus || 'sent'
}

function determineRecipientStatus(providerStatus, completedAt, declinedAt) {
  if (providerStatus === 'completed' || completedAt) return 'completed'
  if (providerStatus === 'declined' || declinedAt) return 'declined'
  if (providerStatus === 'opened') return 'opened'
  if (providerStatus === 'started') return 'started'
  return 'sent'
}

function matchesRecipient(recipient, submitter) {
  const recipientSlug = recipient?.metadata?.docusealSubmitter?.slug
  const recipientSubmitterId = recipient?.provider_submitter_id
  const submitterSlug = submitter?.slug || submitter?.embed_src?.split('/s/').pop() || null
  const submitterId = submitter?.id || submitter?.uuid || submitter?.submitter_id || null

  return (
    (recipientSlug && submitterSlug && recipientSlug === submitterSlug) ||
    (recipientSubmitterId && submitterId && String(recipientSubmitterId) === String(submitterId)) ||
    (recipient?.email &&
      submitter?.email &&
      String(recipient.email).toLowerCase() === String(submitter.email).toLowerCase())
  )
}

async function loadProviderSubmission(request) {
  const apiKey = process.env.DOCUSEAL_API_KEY
  if (!apiKey) return null

  const submissionId = request?.docuseal_submission_id
  if (!submissionId) return null

  const response = await fetch(
    `${normalizeBaseUrl(process.env.DOCUSEAL_API_BASE_URL)}/submissions/${submissionId}`,
    {
      headers: {
        'X-Auth-Token': apiKey,
      },
    },
  )

  if (!response.ok) {
    return null
  }

  return response.json()
}

export async function POST(request, { params }) {
  if (!hasDocumentDatabase()) {
    return NextResponse.json({ error: 'Document database is not configured.' }, { status: 503 })
  }

  const { requestId } = await params
  await ensureDocumentTables()

  const body = await request.json().catch(() => ({}))
  const recipientId = cleanString(body?.recipientId) || null
  const requestRecord = await getSignatureRequestById(requestId)

  if (!requestRecord) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
  }

  const recipient = recipientId ? await getDocumentRecipientById(recipientId) : null
  if (recipientId && (!recipient || recipient.request_id !== requestRecord.id)) {
    return NextResponse.json({ error: 'Recipient not found.' }, { status: 404 })
  }

  const providerSubmission = await loadProviderSubmission(requestRecord)
  const inferredStatus = body?.completedAt
    ? 'completed'
    : body?.declinedAt
      ? 'declined'
      : body?.status || body?.providerStatus || null
  const providerStatus = cleanString(
    providerSubmission?.status || inferredStatus || requestRecord.status,
  ).toLowerCase()
  const providerRecipients = normalizeSubmitters(providerSubmission)
  const nextRequestStatus = determineRequestStatus(providerStatus)
  const nextRecipientStatus = determineRecipientStatus(
    providerStatus,
    body?.completedAt || providerSubmission?.completed_at || null,
    body?.declinedAt || providerSubmission?.declined_at || null,
  )

  const updatedRequest = await updateSignatureRequestStatus(requestRecord.id, {
    status: nextRequestStatus,
    sentAt: requestRecord.sent_at || body?.sentAt || null,
    providerPayload: {
      providerSubmission,
      webhook: body,
    },
  })

  const allRecipients = await listDocumentRecipients(requestRecord.id)
  const overallStatus = determineOverallStatus(
    allRecipients.map((item) => (item.id === recipient?.id ? nextRecipientStatus : item.status)),
    providerStatus,
  )

  const finalRequest =
    overallStatus === nextRequestStatus
      ? updatedRequest
      : await updateSignatureRequestStatus(requestRecord.id, {
          status: overallStatus,
          sentAt: requestRecord.sent_at || body?.sentAt || null,
          providerPayload: {
            providerSubmission,
            webhook: body,
          },
        })

  let updatedRecipient = recipient
  if (recipient) {
    const matchedProviderRecipient =
      providerRecipients.find((item) => matchesRecipient(recipient, item)) || {}
    updatedRecipient = await updateDocumentRecipientStatus(recipient.id, {
      status: nextRecipientStatus,
      sentAt: recipient.sent_at || body?.sentAt || null,
      providerSubmitterId:
        matchedProviderRecipient?.id ||
        matchedProviderRecipient?.uuid ||
        matchedProviderRecipient?.submitter_id ||
        recipient.provider_submitter_id,
      signingUrl:
        matchedProviderRecipient?.embed_src || matchedProviderRecipient?.url || matchedProviderRecipient?.slug
          ? `https://docuseal.com/s/${matchedProviderRecipient.slug}`
          : recipient.signing_url,
      metadata: {
        docusealSubmitter: matchedProviderRecipient || recipient.metadata?.docusealSubmitter || {},
        lastSync: new Date().toISOString(),
      },
    })
  }

  await createDocumentAuditEvent({
    requestId: requestRecord.id,
    clientId: requestRecord.client_id,
    actorEmail: null,
    eventType: `signature_${overallStatus}_sync`,
    eventSummary: `Signature request synced as ${overallStatus}.`,
    metadata: {
      requestStatus: overallStatus,
      recipientStatus: updatedRecipient?.status || null,
      providerStatus,
      providerSubmissionId: providerSubmission?.id || requestRecord.docuseal_submission_id || null,
    },
  })

  return NextResponse.json({
    request: finalRequest,
    recipient: updatedRecipient,
    providerStatus,
  })
}
