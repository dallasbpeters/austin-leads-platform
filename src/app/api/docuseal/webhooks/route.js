import { NextResponse } from 'next/server'

import {
  createDocumentAuditEvent,
  ensureDocumentTables,
  getSignatureRequestBySubmissionId,
  hasDocumentDatabase,
  listDocumentRecipients,
  updateDocumentRecipientStatus,
  updateSignatureRequestStatus,
} from '@/lib/documents/db'

export const runtime = 'nodejs'

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeProviderStatus(value) {
  return cleanString(value).toLowerCase()
}

function normalizeSubmitters(data) {
  if (Array.isArray(data?.submitters)) {
    return data.submitters
  }
  if (Array.isArray(data?.submission?.submitters)) {
    return data.submission.submitters
  }
  return []
}

function extractSubmissionId(data) {
  return data?.id || data?.submission?.id || data?.submission_id || null
}

function extractRecipientStatus(submitter) {
  return normalizeProviderStatus(submitter?.status)
}

function deriveRequestStatus(recipientStatuses, providerStatus) {
  const statuses = recipientStatuses.map(normalizeProviderStatus).filter(Boolean)
  const hasCompleted = statuses.includes('completed')
  const hasDeclined = statuses.includes('declined')
  const hasActive = statuses.some((status) =>
    ['sent', 'pending', 'opened', 'started', 'awaiting'].includes(status),
  )

  if (providerStatus === 'archived') {
    return 'archived'
  }
  if (providerStatus === 'completed' || (hasCompleted && !hasDeclined && !hasActive)) {
    return 'completed'
  }
  if (providerStatus === 'declined' || (hasDeclined && !hasCompleted && !hasActive)) {
    return 'declined'
  }
  if (hasCompleted && hasDeclined) {
    return 'mixed'
  }
  if (hasCompleted || hasDeclined || hasActive) {
    return 'sent'
  }
  return providerStatus || 'sent'
}

function matchesByDocusealSlug(recipient, submitter) {
  const recipientSlug = recipient?.metadata?.docusealSubmitter?.slug
  const submitterSlug = submitter?.slug || submitter?.embed_src?.split('/s/').pop() || null
  return !!(recipientSlug && submitterSlug && recipientSlug === submitterSlug)
}

function matchesBySubmitterId(recipient, submitter) {
  const recipientSubmitterId = recipient?.provider_submitter_id
  const submitterId = submitter?.id || submitter?.uuid || submitter?.submitter_id || null
  return !!(recipientSubmitterId && submitterId && String(recipientSubmitterId) === String(submitterId))
}

function matchesByEmail(recipient, submitter) {
  return !!(
    recipient?.email &&
    submitter?.email &&
    String(recipient.email).toLowerCase() === String(submitter.email).toLowerCase()
  )
}

function matchesRecipient(recipient, submitter) {
  return (
    matchesByDocusealSlug(recipient, submitter) ||
    matchesBySubmitterId(recipient, submitter) ||
    matchesByEmail(recipient, submitter)
  )
}

async function verifyWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.DOCUSEAL_WEBHOOK_SECRET?.trim()
  if (!secret) {
    return false
  }
  if (!signatureHeader) {
    return false
  }

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const bytes = new Uint8Array(digest)
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  const base64 = Buffer.from(bytes).toString('base64')
  const expected = normalizeProviderStatus(signatureHeader)

  return (
    expected === normalizeProviderStatus(hex) ||
    expected === normalizeProviderStatus(base64) ||
    expected === normalizeProviderStatus(`sha256=${hex}`)
  )
}

function computeNextRecipientStatus(providerStatus, submitter) {
  if (providerStatus === 'completed' || submitter?.completed_at) {
    return 'completed'
  }
  if (providerStatus === 'declined' || submitter?.declined_at) {
    return 'declined'
  }
  if (providerStatus === 'opened') {
    return 'opened'
  }
  if (providerStatus === 'started') {
    return 'started'
  }
  return providerStatus || 'sent'
}

function buildRecipientUpdatePayload(recipient, submitter, nextStatus, payload) {
  return {
    status: nextStatus,
    sentAt: recipient.sent_at || submitter?.sent_at || null,
    providerSubmitterId:
      recipient.provider_submitter_id || submitter?.id || submitter?.uuid || submitter?.submitter_id || null,
    signingUrl:
      recipient.signing_url ||
      submitter?.embed_src ||
      submitter?.url ||
      (submitter?.slug ? `https://docuseal.com/s/${submitter.slug}` : null),
    metadata: {
      docusealSubmitter: submitter,
      webhookEvent: payload?.event_type || null,
      syncedAt: new Date().toISOString(),
    },
  }
}

export async function POST(request) {
  if (!hasDocumentDatabase()) {
    return NextResponse.json({ error: 'Document database is not configured.' }, { status: 503 })
  }

  const signature = request.headers.get('x-docuseal-signature')
  const rawBody = await request.text()

  if (!(await verifyWebhookSignature(rawBody, signature))) {
    return NextResponse.json({ error: 'Invalid DocuSeal webhook signature.' }, { status: 401 })
  }

  let payload
  try {
    payload = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 })
  }

  await ensureDocumentTables()

  const eventType = normalizeProviderStatus(payload?.event_type)
  const data = payload?.data || {}
  const submissionId = extractSubmissionId(data)
  const requestRecord = submissionId ? await getSignatureRequestBySubmissionId(submissionId) : null

  if (!requestRecord) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const providerSubmitters = normalizeSubmitters(data)
  const recipients = await listDocumentRecipients(requestRecord.id)
  const recipientUpdates = []
  const statusMap = new Map()

  for (const submitter of providerSubmitters) {
    const matchingRecipient = recipients.find((recipient) => matchesRecipient(recipient, submitter))
    if (!matchingRecipient) {
      continue
    }

    const providerStatus = extractRecipientStatus(submitter)
    const nextStatus = computeNextRecipientStatus(providerStatus, submitter)

    statusMap.set(matchingRecipient.id, nextStatus)
    recipientUpdates.push(
      updateDocumentRecipientStatus(
        matchingRecipient.id,
        buildRecipientUpdatePayload(matchingRecipient, submitter, nextStatus, payload),
      ),
    )
  }

  const updatedRecipients = await Promise.all(recipientUpdates)
  const currentStatuses = recipients.map((recipient) => statusMap.get(recipient.id) || recipient.status)
  const nextRequestStatus = deriveRequestStatus(
    currentStatuses,
    eventType === 'submission.archived' ? 'archived' : data?.status,
  )

  const updatedRequest = await updateSignatureRequestStatus(requestRecord.id, {
    status: nextRequestStatus,
    sentAt: requestRecord.sent_at || data?.created_at || null,
    providerPayload: {
      webhook: payload,
      submission: data,
    },
  })

  await createDocumentAuditEvent({
    requestId: requestRecord.id,
    clientId: requestRecord.client_id,
    eventType: `signature_${eventType || 'webhook'}_received`,
    eventSummary: `Signature webhook processed as ${nextRequestStatus}.`,
    metadata: {
      eventType,
      submissionId,
      recipientStatuses: currentStatuses,
      requestStatus: nextRequestStatus,
    },
  })

  return NextResponse.json({
    ok: true,
    request: updatedRequest,
    recipients: updatedRecipients,
  })
}
