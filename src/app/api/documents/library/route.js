import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { createDocumentLibraryItem, ensureDocumentTables, hasDocumentDatabase } from '@/lib/documents/db'

export const runtime = 'nodejs'

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildDocumentPayload(body, title, fileName, fileBase64) {
  return {
    clientId: cleanString(body?.clientId) || null,
    requestId: cleanString(body?.requestId) || null,
    title,
    fileName,
    fileMimeType: cleanString(body?.fileMimeType) || 'application/pdf',
    fileBase64,
    fileSha256: cleanString(body?.fileSha256) || null,
    sourceType: cleanString(body?.sourceType) || 'generated',
    metadata: body?.metadata || {},
  }
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  if (!hasDocumentDatabase()) {
    return NextResponse.json({ error: 'Document database is not configured.' }, { status: 503 })
  }

  await ensureDocumentTables()

  const body = await request.json().catch(() => ({}))
  const title = cleanString(body?.title)
  const fileName = cleanString(body?.fileName)
  const fileBase64 = cleanString(body?.fileBase64)

  if (!title) {
    return NextResponse.json({ error: 'Enter a document title.' }, { status: 400 })
  }
  if (!fileName || !fileBase64) {
    return NextResponse.json({ error: 'Provide a PDF file before saving.' }, { status: 400 })
  }

  const document = await createDocumentLibraryItem(buildDocumentPayload(body, title, fileName, fileBase64))

  return NextResponse.json({ document })
}
