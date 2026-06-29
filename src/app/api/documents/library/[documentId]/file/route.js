import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { ensureDocumentTables, getDocumentLibraryItemById, hasDocumentDatabase } from '@/lib/documents/db'

export const runtime = 'nodejs'

const decodeBase64 = (value) => {
  return Uint8Array.from(Buffer.from(String(value || ''), 'base64'))
}

const safeFileName = (value) => {
  return (
    String(value || 'document.pdf')
      .replaceAll('"', '')
      .trim() || 'document.pdf'
  )
}

export const GET = async (request, { params }) => {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  if (!hasDocumentDatabase()) {
    return NextResponse.json({ error: 'Document database is not configured.' }, { status: 503 })
  }

  const { documentId } = await params
  await ensureDocumentTables()

  const document = await getDocumentLibraryItemById(documentId)
  if (!document) {
    return NextResponse.json({ error: 'Document not found.' }, { status: 404 })
  }

  const bytes = decodeBase64(document.file_base64)
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': document.file_mime_type || 'application/pdf',
      'Content-Disposition': `inline; filename="${safeFileName(document.file_name)}"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  })
}
