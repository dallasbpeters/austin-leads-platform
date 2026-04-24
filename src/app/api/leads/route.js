import { NextResponse } from 'next/server'

import { createLeadSubmission, ensureLeadSubmissionsTable, hasLeadDatabase } from '@/lib/leads/db'
import { sendLeadNotificationEmail } from '@/lib/leads/email'

function badRequest(message, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function normalizeString(value) {
  return String(value || '').trim()
}

export async function POST(request) {
  if (!hasLeadDatabase()) {
    return badRequest('Lead database is not configured.', 503)
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return badRequest('Invalid request body.')
  }

  const fullName = normalizeString(payload.fullName)
  const email = normalizeEmail(payload.email)
  const phone = normalizeString(payload.phone)
  const siteSlug = normalizeString(payload.siteSlug)
  const siteName = normalizeString(payload.siteName)
  const sourceDomain = normalizeString(payload.sourceDomain)
  const pagePath = normalizeString(payload.pagePath || '/')
  const privacyAccepted = payload.privacyAccepted === true

  if (!fullName) {
    return badRequest('Full name is required.')
  }

  if (!email || !email.includes('@')) {
    return badRequest('A valid email address is required.')
  }

  if (!siteSlug || !siteName || !sourceDomain) {
    return badRequest('Lead source context is incomplete.', 422)
  }

  if (!privacyAccepted) {
    return badRequest('You must agree to be contacted to submit this form.')
  }

  await ensureLeadSubmissionsTable()

  const leadInput = {
    fullName,
    email,
    phone,
    notes: normalizeString(payload.notes),
    sourceType: normalizeString(payload.sourceType) || 'consultation',
    sourceSection: normalizeString(payload.sourceSection),
    serviceInterest: normalizeString(payload.serviceInterest),
    siteSlug,
    siteName,
    sourceDomain,
    pagePath,
    pageTitle: normalizeString(payload.pageTitle),
    metadata: payload.metadata || {},
  }

  const submission = await createLeadSubmission(leadInput)
  console.info('Lead submission stored.', {
    leadId: submission.id,
    siteSlug: leadInput.siteSlug,
    siteName: leadInput.siteName,
    pagePath: leadInput.pagePath,
    serviceInterest: leadInput.serviceInterest || null,
    sourceSection: leadInput.sourceSection || null,
    sourceType: leadInput.sourceType,
    email: leadInput.email,
    phone: leadInput.phone || null,
  })

  let notification = { status: 'skipped' }

  try {
    notification = await sendLeadNotificationEmail({
      ...leadInput,
      id: submission.id,
      createdAt: submission.created_at,
      status: submission.status,
    })
    console.info('Lead notification result.', {
      leadId: submission.id,
      notification,
    })
  } catch (error) {
    console.error('Lead notification email failed.', {
      leadId: submission.id,
      message: error instanceof Error ? error.message : String(error),
    })
  }

  return NextResponse.json({
    ok: true,
    submission: {
      id: submission.id,
      createdAt: submission.created_at,
      status: submission.status,
    },
    notification,
  })
}
