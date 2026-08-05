import { createHmac, timingSafeEqual } from 'node:crypto'

import { NextResponse } from 'next/server'

import { clearJobberConnection, ensureJobberTables, recordJobberWebhookEvent } from '@/lib/jobber/db'

export const runtime = 'nodejs'

/*
 * Single receiver for every subscribed Jobber webhook topic (Jobber posts
 * one topic per subscription row, all pointed at this same URL — see
 * .env.example for the registered topic list).
 *
 * Every event is verified (X-Jobber-Hmac-SHA256, keyed with the Client
 * Secret) and logged to `jobber_webhook_events` regardless of topic.
 * APP_DISCONNECT is handled concretely (clears stored tokens). The
 * data-sync topics (CLIENT_*, QUOTE_*, INVOICE_*, PAYMENT_CREATE) are only
 * logged for now — turning those into actual two-way sync needs the
 * field-ownership rules decided first (which system wins on which field),
 * not just plumbing.
 */

function verifyJobberSignature(rawBody, signatureHeader) {
  if (!signatureHeader) {
    return false
  }
  const expected = createHmac('sha256', process.env.JOBBER_CLIENT_SECRET || '')
    .update(rawBody, 'utf-8')
    .digest('base64')

  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(signatureHeader)
  if (expectedBuffer.length !== providedBuffer.length) {
    return false
  }
  return timingSafeEqual(expectedBuffer, providedBuffer)
}

export async function POST(request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-jobber-hmac-sha256')

  if (!verifyJobberSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const event = payload?.data?.webHookEvent
  const topic = event?.topic
  if (!topic) {
    return NextResponse.json({ error: 'Missing webHookEvent.topic' }, { status: 400 })
  }

  try {
    await ensureJobberTables()
    await recordJobberWebhookEvent({
      topic,
      accountId: event.accountId,
      itemId: event.itemId,
      payload,
    })

    if (topic === 'APP_DISCONNECT') {
      await clearJobberConnection()
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[jobber/webhooks] failed to process event', { topic, error })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
