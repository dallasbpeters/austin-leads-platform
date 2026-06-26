import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import {
  createDocumentAuditEvent,
  createDocumentLibraryItem,
  ensureDocumentTables,
  getDocumentRecipientById,
  getDocumentLibraryItemById,
  getSignatureRequestById,
  hasDocumentDatabase,
  listDocumentRecipients,
  updateDocumentRecipientStatus,
  updateSignatureRequestStatus,
} from '@/lib/documents/db'

export const runtime = 'nodejs'

function deriveRequestStatus(recipients) {
  const statuses = recipients.map((recipient) => String(recipient.status || '').toLowerCase())
  if (statuses.some((status) => status === 'declined')) return 'declined'
  if (statuses.length && statuses.every((status) => status === 'completed')) return 'completed'
  if (statuses.some((status) => ['sent', 'pending', 'opened', 'started'].includes(status))) return 'sent'
  return 'completed'
}

function decodeDataUrl(dataUrl) {
  const value = String(dataUrl || '')
  const [, payload = ''] = value.split(',')
  return Buffer.from(payload, 'base64')
}

async function loadPdfFromAsset(requestRecord) {
  if (!requestRecord.document_asset_id) return null

  const asset = await getDocumentLibraryItemById(requestRecord.document_asset_id)
  if (!asset?.file_base64) return null

  return {
    bytes: Buffer.from(String(asset.file_base64), 'base64'),
    fileName: asset.file_name || `${requestRecord.title || 'document'}.pdf`,
    title: asset.title || requestRecord.title || 'Signed document',
  }
}

function getProviderDocumentUrl(requestRecord) {
  return (
    requestRecord.provider_payload?.submission?.documents?.[0]?.url ||
    requestRecord.provider_payload?.documents?.[0]?.url ||
    ''
  )
}

async function loadPdfFromUrl(requestRecord) {
  const sourceUrl = getProviderDocumentUrl(requestRecord)
  if (!sourceUrl) return null

  const response = await fetch(sourceUrl)
  if (!response.ok) return null

  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    fileName: `${(requestRecord.title || 'document').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`,
    title: requestRecord.title || 'Signed document',
  }
}

async function loadSourcePdfBytes(requestRecord) {
  const fromAsset = await loadPdfFromAsset(requestRecord)
  if (fromAsset) return fromAsset
  return loadPdfFromUrl(requestRecord)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function cleanFieldText(value) {
  return String(value || '').trim()
}

function getFieldBox(field, pageWidth, pageHeight) {
  const x = clamp(Number(field?.x) || 0, 0, 1)
  const y = clamp(Number(field?.y) || 0, 0, 1)
  const w = clamp(Number(field?.w) || 0, 0.02, 1)
  const h = clamp(Number(field?.h) || 0, 0.02, 1)

  return {
    x: x * pageWidth,
    y: (1 - y - h) * pageHeight,
    width: w * pageWidth,
    height: h * pageHeight,
  }
}

function getSignatureText(field, signerName, signatureText) {
  if (field?.type === 'initials') {
    const source = signatureText || signerName || ''
    return source
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
  }

  return signatureText || signerName || ''
}

async function createSignedPdfBytes({
  sourceBytes,
  signerName,
  signatureText,
  signatureImage,
  completedAt,
  builderFields = [],
}) {
  const pdfDoc = await PDFDocument.load(sourceBytes)
  const pages = pdfDoc.getPages()
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const dateText = new Date(completedAt || new Date().toISOString()).toLocaleDateString()

  for (const field of Array.isArray(builderFields) ? builderFields : []) {
    const pageIndex = Math.max(0, (Number(field?.page) || 1) - 1)
    const page = pages[pageIndex]
    if (!page) continue

    const { width, height } = page.getSize()
    const box = getFieldBox(field, width, height)
    const fieldType = String(field?.type || 'text')

    if (fieldType === 'signature' || fieldType === 'initials') {
      const text = getSignatureText(field, signerName, signatureText)
      if (signatureImage) {
        const signatureBytes = decodeDataUrl(signatureImage)
        const image = await pdfDoc.embedPng(signatureBytes)
        const fitted = image.scaleToFit(box.width, box.height)
        page.drawImage(image, {
          x: box.x,
          y: box.y + Math.max(0, (box.height - fitted.height) / 2),
          width: fitted.width,
          height: fitted.height,
        })
      } else if (cleanFieldText(text)) {
        const size = clamp(box.height * 0.64, 10, 24)
        page.drawText(text, {
          x: box.x,
          y: box.y + Math.max(0, (box.height - size) / 2),
          size,
          font: italicFont,
          color: rgb(0.06, 0.21, 0.29),
          maxWidth: box.width,
        })
      }
      continue
    }

    if (fieldType === 'date') {
      page.drawText(dateText, {
        x: box.x,
        y: box.y + Math.max(0, box.height * 0.18),
        size: clamp(box.height * 0.42, 8, 14),
        font: boldFont,
        color: rgb(0.06, 0.21, 0.29),
        maxWidth: box.width,
      })
      continue
    }

    if (fieldType === 'checkbox') {
      const size = clamp(Math.min(box.width, box.height) * 0.55, 8, 16)
      page.drawRectangle({
        x: box.x,
        y: box.y + Math.max(0, (box.height - size) / 2),
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: rgb(0.22, 0.29, 0.35),
      })
      if (field.defaultValue || field.required) {
        page.drawText('x', {
          x: box.x + 2,
          y: box.y + Math.max(0, (box.height - size) / 2) + 1,
          size: size * 0.9,
          font: boldFont,
          color: rgb(0.22, 0.29, 0.35),
        })
      }
      continue
    }

    const value = cleanFieldText(field.defaultValue)
    if (!value) continue

    page.drawText(value, {
      x: box.x,
      y: box.y + Math.max(0, box.height * 0.18),
      size: clamp(box.height * 0.38, 8, 13),
      font: bodyFont,
      color: rgb(0.12, 0.16, 0.2),
      maxWidth: box.width,
    })
  }

  return Buffer.from(await pdfDoc.save())
}

function extractBuilderFields(requestRecord) {
  return (
    requestRecord.provider_payload?.builderFields ||
    requestRecord.provider_payload?.documentFields ||
    requestRecord.provider_payload?.submission?.documents?.[0]?.fields ||
    requestRecord.provider_payload?.docuseal?.submission?.documents?.[0]?.fields ||
    []
  )
}

async function createSignedDocument(requestRecord, recipient, body, completedAt) {
  try {
    const sourcePdf = await loadSourcePdfBytes(requestRecord)
    if (!sourcePdf) return { assetId: requestRecord.document_asset_id || null, document: null }

    const signedPdfBytes = await createSignedPdfBytes({
      sourceBytes: sourcePdf.bytes,
      signerName: body?.signerName || recipient.name || recipient.email || null,
      signatureText: body?.signatureText || null,
      signatureImage: body?.signatureImage || null,
      completedAt,
      builderFields: extractBuilderFields(requestRecord),
    })

    const savedDocument = await createDocumentLibraryItem({
      clientId: requestRecord.client_id || null,
      requestId: requestRecord.id,
      title: `${sourcePdf.title || requestRecord.title || 'Signed document'} (signed)`,
      fileName: sourcePdf.fileName.replace(/\.pdf$/i, '-signed.pdf'),
      fileMimeType: 'application/pdf',
      fileBase64: signedPdfBytes.toString('base64'),
      sourceType: 'signed',
      status: 'available',
      metadata: {
        signedFromRequestId: requestRecord.id,
        signedFromRecipientId: recipient.id,
        signerName: body?.signerName || recipient.name || recipient.email || null,
        signedAt: completedAt,
      },
    })

    return {
      assetId: savedDocument.id,
      document: {
        id: savedDocument.id,
        title: savedDocument.title,
        fileName: savedDocument.file_name,
        fileUrl: `/api/documents/library/${savedDocument.id}/file`,
      },
    }
  } catch (error) {
    console.error('[documents/signatures] Unable to stamp signed PDF.', {
      requestId: requestRecord.id,
      recipientId: recipient.id,
      error,
    })
    return { assetId: requestRecord.document_asset_id || null, document: null }
  }
}

function buildCompletedRecipientPayload(recipient, body) {
  return {
    status: 'completed',
    sentAt: recipient.sent_at || body?.completedAt || null,
    metadata: {
      ...recipient.metadata,
      signedAt: body?.completedAt || new Date().toISOString(),
      signerName: body?.signerName || recipient.name || null,
      signatureText: body?.signatureText || null,
      signatureImage: body?.signatureImage || null,
      comment: body?.comment || null,
      signingMode: body?.signatureImage ? 'draw' : 'type',
      completedOnApp: true,
    },
  }
}

async function createCompletionAuditEvent(requestRecord, recipient, body, signedDocumentAssetId) {
  await createDocumentAuditEvent({
    requestId: requestRecord.id,
    clientId: requestRecord.client_id,
    actorEmail: recipient.email,
    eventType: 'signature_completed',
    eventSummary: 'Signature completed inside the app.',
    metadata: {
      recipientId: recipient.id,
      signerName: body?.signerName || recipient.name || null,
      signatureMode: body?.signatureImage ? 'draw' : 'type',
      signedDocumentAssetId,
    },
  })
}

export async function POST(request, { params }) {
  if (!hasDocumentDatabase())
    return NextResponse.json({ error: 'Document database is not configured.' }, { status: 503 })

  await ensureDocumentTables()

  const { requestId } = await params
  const body = await request.json().catch(() => ({}))
  const recipientId = String(body?.recipientId || '').trim()

  if (!recipientId) return NextResponse.json({ error: 'recipientId is required.' }, { status: 400 })

  const [requestRecord, recipient] = await Promise.all([
    getSignatureRequestById(requestId),
    getDocumentRecipientById(recipientId),
  ])

  if (!requestRecord || !recipient || recipient.request_id !== requestRecord.id) {
    return NextResponse.json({ error: 'Request or recipient not found.' }, { status: 404 })
  }

  const updatedRecipient = await updateDocumentRecipientStatus(
    recipient.id,
    buildCompletedRecipientPayload(recipient, body),
  )

  const recipients = await listDocumentRecipients(requestRecord.id)
  const status = deriveRequestStatus(recipients)
  const completedAt = body?.completedAt || new Date().toISOString()

  const { assetId: signedDocumentAssetId, document: signedDocument } = await createSignedDocument(
    requestRecord,
    recipient,
    body,
    completedAt,
  )

  const updatedRequest = await updateSignatureRequestStatus(requestRecord.id, {
    status,
    sentAt: requestRecord.sent_at || body?.completedAt || null,
    documentAssetId: signedDocumentAssetId,
    providerPayload: {
      ...requestRecord.provider_payload,
      appCompletion: { recipientId: recipient.id, completedAt, signedDocumentAssetId },
    },
  })

  await createCompletionAuditEvent(requestRecord, recipient, body, signedDocumentAssetId)

  return NextResponse.json({ ok: true, request: updatedRequest, recipient: updatedRecipient, signedDocument })
}
