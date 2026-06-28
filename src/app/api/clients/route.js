import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import {
  ensureDocumentTables,
  hasDocumentDatabase,
  listDocumentClients,
  upsertDocumentClient,
} from '@/lib/documents/db'

export const runtime = 'nodejs'

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function GET(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  if (!hasDocumentDatabase()) {
    return NextResponse.json({ error: 'Document database is not configured.' }, { status: 503 })
  }

  await ensureDocumentTables()

  const { searchParams } = new URL(request.url)
  const clients = await listDocumentClients({
    search: searchParams.get('search') || '',
    limit: Number(searchParams.get('limit') || 200),
  })

  return NextResponse.json({ clients })
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

  const body = await request.json()
  const name = cleanString(body?.name)
  const email = cleanString(body?.email).toLowerCase()

  if (!name || !email) {
    return NextResponse.json({ error: 'Client name and email are required.' }, { status: 400 })
  }

  const client = await upsertDocumentClient({
    id: cleanString(body?.id) || undefined,
    status: cleanString(body?.status) || 'active',
    name,
    email,
    phone: cleanString(body?.phone) || null,
    company: cleanString(body?.company) || null,
    address: cleanString(body?.address) || null,
    notes: cleanString(body?.notes) || null,
  })

  return NextResponse.json({ client }, { status: 201 })
}
