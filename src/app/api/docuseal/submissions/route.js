import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { safeAuth } from '@/lib/auth/session'
import {
  createDocumentAuditEvent,
  createDocumentLibraryItem,
  createDocumentRecipient,
  createSignatureRequest,
  ensureDocumentTables,
  getDocumentClientById,
  getDocumentLibraryItemById,
  hasDocumentDatabase,
  updateSignatureRequestAfterSend,
} from '@/lib/documents/db'
import { sendDocumentSignatureEmail } from '@/lib/documents/email'

export const runtime = 'nodejs'

const DEFAULT_DOCUSEAL_BASE_URL = 'https://api.docuseal.com'

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanOptionalString(value) {
  const cleaned = cleanString(value)
  return cleaned || undefined
}

function normalizeSubmitters(submitters) {
  if (!Array.isArray(submitters)) return []

  return submitters
    .map((submitter, index) => ({
      name: cleanOptionalString(submitter?.name),
      email: cleanString(submitter?.email).toLowerCase(),
      role: cleanOptionalString(submitter?.role) || `Signer ${index + 1}`,
      order: Number.isInteger(submitter?.order) ? submitter.order : index,
      require_email_2fa: Boolean(submitter?.requireEmail2fa),
    }))
    .filter((submitter) => submitter.email)
}

function normalizeBaseUrl(value) {
  const baseUrl = cleanString(value) || DEFAULT_DOCUSEAL_BASE_URL
  return baseUrl.replace(/\/+$/, '')
}

function getSubmittersFromDocusealResponse(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.submitters)) return data.submitters
  if (Array.isArray(data?.submission?.submitters)) return data.submission.submitters
  return []
}

function getSubmitterId(submitter) {
  return submitter?.id || submitter?.uuid || submitter?.submitter_id || null
}

function submitterLink(submitter) {
  if (submitter?.embed_src) return submitter.embed_src
  if (submitter?.slug) return `https://docuseal.com/s/${submitter.slug}`
  if (submitter?.url) return submitter.url
  return ''
}

function buildAppSigningLink(request, requestId, recipientId) {
  return new URL(`/sign/${requestId}/${recipientId}`, request.url).toString()
}

async function sha256Hex(value) {
  if (!value) return null

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  if (!hasDocumentDatabase()) {
    return NextResponse.json(
      { error: 'Document database is required before sending signature requests.' },
      { status: 503 },
    )
  }

  const apiKey = process.env.DOCUSEAL_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'DOCUSEAL_API_KEY is not configured for this environment.' },
      { status: 503 },
    )
  }

  await ensureDocumentTables()

  const session = await safeAuth()
  const actorEmail = session?.user?.email || null
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null
  const userAgent = request.headers.get('user-agent') || null
  const body = await request.json()
  const submitters = normalizeSubmitters(body?.submitters)
  const clientId = cleanString(body?.clientId)
  const documentAssetId = cleanString(body?.documentAssetId)
  const client = clientId ? await getDocumentClientById(clientId) : null
  const existingAsset = documentAssetId ? await getDocumentLibraryItemById(documentAssetId) : null

  if (!submitters.length) {
    return NextResponse.json({ error: 'Add at least one recipient email.' }, { status: 400 })
  }

  if (!client) {
    return NextResponse.json({ error: 'Choose a stored client before sending.' }, { status: 400 })
  }

  if (body?.legalDisclosureAccepted !== true) {
    return NextResponse.json(
      { error: 'Confirm the e-sign consent and audit disclosure before sending.' },
      { status: 400 },
    )
  }

  const message = {
    subject: cleanOptionalString(body?.message?.subject),
    body: cleanOptionalString(body?.message?.body),
  }
  const hasMessage = Boolean(message.subject || message.body)
  const sendEmail = body?.sendEmail !== false
  const order = body?.order === 'random' ? 'random' : 'preserved'
  const title = cleanOptionalString(body?.name) || cleanOptionalString(body?.title) || 'Signature request'
  const consentText =
    cleanOptionalString(body?.consentText) ||
    'Client consented to receive and sign documents electronically. Audit records include request metadata, recipient delivery details, provider identifiers, IP address, user agent, and timestamps.'

  const endpoint = '/submissions/pdf'
  let payload
  let fileName = cleanString(body?.fileName)
  let fileBase64
  let fileSha256 = null
  let documentAsset = existingAsset
  fileBase64 = cleanString(body?.fileBase64)
  const documentFields = Array.isArray(body?.documentFields) ? body.documentFields : []

  if (documentAsset) {
    fileName = documentAsset.file_name
    fileBase64 = documentAsset.file_base64
    fileSha256 = documentAsset.file_sha256 || null
  }

  if (!fileName || !fileBase64) {
    return NextResponse.json({ error: 'Upload a PDF before sending.' }, { status: 400 })
  }

  fileSha256 = fileSha256 || (await sha256Hex(fileBase64))

  payload = {
    name: title || fileName.replace(/\.pdf$/i, ''),
    send_email: false,
    order,
    documents: [
      {
        name: fileName,
        file: fileBase64,
        ...(documentFields.length ? { fields: documentFields } : {}),
      },
    ],
    submitters,
    remove_tags: body?.removeTags !== false,
    ...(hasMessage ? { message } : {}),
  }

  const signatureRequest = await createSignatureRequest({
    clientId: client.id,
    documentAssetId: documentAsset?.id || null,
    title,
    sourceType: body?.sourceMode || 'upload',
    fileName,
    fileSha256,
    sendChannel: sendEmail ? 'resend' : 'manual',
    consentText,
    createdByEmail: actorEmail,
    providerPayload: {
      sourceMode: body?.sourceMode || 'upload',
      pageSize: body?.pageSize || null,
      builderFields: Array.isArray(body?.builderFields) ? body.builderFields : [],
      documentFields,
      submitters,
      fileName,
    },
    complianceSnapshot: {
      acceptedAt: new Date().toISOString(),
      ipAddress,
      userAgent,
      recipientCount: submitters.length,
      sourceType: body?.sourceMode || 'upload',
      docusealEmailsDisabled: true,
      resendRequested: sendEmail,
    },
  })

  if (!documentAsset && fileBase64) {
    documentAsset = await createDocumentLibraryItem({
      clientId: client.id,
      requestId: signatureRequest.id,
      title,
      fileName,
      fileBase64,
      fileSha256,
      sourceType: body?.sourceMode === 'generated' ? 'generated' : 'upload',
      metadata: {
        requestId: signatureRequest.id,
        sourceMode: body?.sourceMode || 'upload',
        createdByEmail: actorEmail,
        pageSize: body?.pageSize || null,
      },
    })
  }

  await createDocumentAuditEvent({
    requestId: signatureRequest.id,
    clientId: client.id,
    actorEmail,
    eventType: 'signature_request_created',
    eventSummary: 'Signature request created.',
    ipAddress,
    userAgent,
    metadata: {
      recipientCount: submitters.length,
      fileName,
      fileSha256,
      documentAssetId: documentAsset?.id || null,
      sourceMode: body?.sourceMode || 'upload',
    },
  })

  const docusealBaseUrl = normalizeBaseUrl(process.env.DOCUSEAL_API_BASE_URL)
  const response = await fetch(`${docusealBaseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': apiKey,
    },
    body: JSON.stringify(payload),
  })
  const text = await response.text()
  let data

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: text }
  }

  if (!response.ok) {
    const error = data?.error || data?.message || 'The signing service rejected the submission request.'

    await createDocumentAuditEvent({
      requestId: signatureRequest.id,
      clientId: client.id,
      actorEmail,
      eventType: 'signature_request_failed',
      eventSummary: 'The signing service rejected the signature request.',
      ipAddress,
      userAgent,
      metadata: {
        status: response.status,
        endpoint,
        error,
        details: data,
      },
    })

    console.error('Signing service submission request failed.', {
      status: response.status,
      endpoint,
      error,
    })

    return NextResponse.json({ error, request: signatureRequest, details: data }, { status: response.status })
  }

  const docusealSubmitters = getSubmittersFromDocusealResponse(data)
  const storedRecipients = await Promise.all(
    submitters.map((submitter, index) => {
      const recipientId = crypto.randomUUID()
      const providerSubmitter = docusealSubmitters[index] || {}
      return createDocumentRecipient({
        id: recipientId,
        requestId: signatureRequest.id,
        clientId: client.id,
        name: submitter.name,
        email: submitter.email,
        role: submitter.role,
        status: 'pending',
        signingUrl: buildAppSigningLink(request, signatureRequest.id, recipientId),
        providerSubmitterId: getSubmitterId(providerSubmitter),
        metadata: {
          docusealSubmitter: providerSubmitter,
          requireEmail2fa: submitter.require_email_2fa,
          providerSigningUrl: submitterLink(providerSubmitter),
        },
      })
    }),
  )

  const sentRequest = await updateSignatureRequestAfterSend(signatureRequest.id, {
    docusealSubmissionId: data?.id || data?.submission_id || data?.submission?.id || null,
    documentAssetId: documentAsset?.id || null,
    providerPayload: {
      ...(signatureRequest.provider_payload || {}),
      docuseal: data || {},
    },
  })

  await createDocumentAuditEvent({
    requestId: signatureRequest.id,
    clientId: client.id,
    actorEmail,
    eventType: 'signature_request_prepared',
    eventSummary: 'Signature request created and delivery prepared.',
    ipAddress,
    userAgent,
    metadata: {
      endpoint,
      docusealSubmissionId: sentRequest.docuseal_submission_id,
      submitterCount: docusealSubmitters.length,
    },
  })

  const emailResult = sendEmail
    ? await sendDocumentSignatureEmail({
        client,
        request: sentRequest,
        recipients: storedRecipients,
        message,
      })
    : { status: 'skipped', reason: 'Email delivery disabled by sender.' }

  await createDocumentAuditEvent({
    requestId: signatureRequest.id,
    clientId: client.id,
    actorEmail,
    eventType:
      emailResult.status === 'sent' ? 'resend_signature_email_sent' : 'resend_signature_email_skipped',
    eventSummary:
      emailResult.status === 'sent'
        ? 'Signature request email sent through Resend.'
        : `Signature request email not sent: ${emailResult.reason}`,
    ipAddress,
    userAgent,
    metadata: emailResult,
  })

  return NextResponse.json({
    endpoint,
    request: sentRequest,
    client,
    recipients: storedRecipients,
    email: emailResult,
    submitters: docusealSubmitters,
    submission: data,
    documentAsset,
  })
}
