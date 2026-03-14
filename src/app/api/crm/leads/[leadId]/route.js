import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import {
  ensureLeadSubmissionsTable,
  getLeadSubmissionById,
  hasLeadDatabase,
  updateLeadSubmission,
} from '@/lib/leads/db'

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdminRequest()

  if (unauthorized) {
    return unauthorized
  }

  if (!hasLeadDatabase()) {
    return NextResponse.json({ error: 'Lead database is not configured.' }, { status: 503 })
  }

  await ensureLeadSubmissionsTable()

  const { leadId } = await params
  const payload = await request.json()
  const lead = await updateLeadSubmission(leadId, payload)

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  }

  return NextResponse.json({ lead })
}

export async function GET(_request, { params }) {
  const unauthorized = await requireAdminRequest()

  if (unauthorized) {
    return unauthorized
  }

  if (!hasLeadDatabase()) {
    return NextResponse.json({ error: 'Lead database is not configured.' }, { status: 503 })
  }

  await ensureLeadSubmissionsTable()

  const { leadId } = await params
  const lead = await getLeadSubmissionById(leadId)

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  }

  return NextResponse.json({ lead })
}
