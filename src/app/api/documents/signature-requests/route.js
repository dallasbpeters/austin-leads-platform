import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { ensureDocumentTables, hasDocumentDatabase, listSignatureRequests } from '@/lib/documents/db'

export const runtime = 'nodejs'

export const GET = async (request) => {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  if (!hasDocumentDatabase()) {
    return NextResponse.json({ error: 'Document database is not configured.' }, { status: 503 })
  }

  await ensureDocumentTables()

  const { searchParams } = new URL(request.url)
  const requests = await listSignatureRequests({
    limit: Number(searchParams.get('limit') || 100),
  })

  return NextResponse.json({ requests })
}
