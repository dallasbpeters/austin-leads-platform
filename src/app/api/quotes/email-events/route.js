import { createHmac, timingSafeEqual } from 'node:crypto'

import { NextResponse } from 'next/server'

import { applyEmailEvent, ensureQuotesTable, hasQuoteDatabase } from '@/lib/quotes/db'

export const runtime = 'nodejs'

/*
 * Resend webhook receiver for quote email tracking.
 *
 * Setup (see docs/quotes-setup.md):
 *   1. Enable open tracking for the sending domain in the Resend dashboard.
 *   2. Add a webhook pointing at {SITE_URL}/api/quotes/email-events with the
 *      events: email.delivered, email.opened, email.bounced, email.complained.
 *   3. Set RESEND_WEBHOOK_SECRET to the webhook's signing secret (whsec_…).
 *
 * Resend signs webhooks with the Svix scheme: HMAC-SHA256 over
 * "{svix-id}.{svix-timestamp}.{raw body}" using the base64 part of the
 * secret, compared against the space-separated "v1,<base64>" signatures in
 * the svix-signature header.
 */

const TOLERANCE_SECONDS = 5 * 60

function verifySvixSignature({ secret, id, timestamp, signature, payload }) {
  if (!secret || !id || !timestamp || !signature) {
    return false
  }

  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) {
    return false
  }

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const signedContent = `${id}.${timestamp}.${payload}`
  const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64')
  const expectedBuffer = Buffer.from(expected)

  return signature.split(' ').some((candidate) => {
    const value = candidate.includes(',') ? candidate.split(',')[1] : candidate
    const candidateBuffer = Buffer.from(value || '')
    return (
      candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer)
    )
  })
}

export async function POST(request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }
  if (!hasQuoteDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const payload = await request.text()
  const verified = verifySvixSignature({
    secret,
    id: request.headers.get('svix-id'),
    timestamp: request.headers.get('svix-timestamp'),
    signature: request.headers.get('svix-signature'),
    payload,
  })
  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event
  try {
    event = JSON.parse(payload)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const resendEmailId = event?.data?.email_id || event?.data?.id
  if (!event?.type || !resendEmailId) {
    // Acknowledge unknown shapes so Resend doesn't retry forever.
    return NextResponse.json({ ok: true, ignored: true })
  }

  try {
    await ensureQuotesTable()
    const quoteId = await applyEmailEvent({
      resendEmailId,
      type: event.type,
      occurredAt: event.created_at || event.data?.created_at,
    })
    return NextResponse.json({ ok: true, matched: Boolean(quoteId) })
  } catch (error) {
    console.error('[quotes] email event failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
