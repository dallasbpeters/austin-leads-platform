/*
 * Pull-based repair for quote delivery status, for events the Resend webhook
 * missed. See "Email tracking" in docs/quotes-setup.md.
 */

import { setTimeout as wait } from 'node:timers/promises'

import { fetchResendEmailStatus, hasResendApiKey } from '../christmas/invoice-email-status.js'
import { applyEmailEvent, getQuote, listQuotesAwaitingDelivery } from './db.js'

// Resend allows 2 API requests per second by default.
const REQUEST_GAP_MS = 600

// Resend usually reports delivery a few seconds after the send.
const DELIVERY_CHECK_DELAY_MS = 15_000

const AWAITING_DELIVERY = new Set(['sent', 'delivery_delayed'])

/** @returns {Promise<boolean|null>} Whether the quote changed, or null when Resend gave no answer. */
async function applyResendStatus(quote) {
  const result = await fetchResendEmailStatus(quote)
  if (!result.ok) {
    return null
  }
  if (result.status === (quote.emailStatus || 'sent')) {
    return false
  }

  // Resend reports the latest event but not when it happened. The send
  // time is the closest known time for it.
  const quoteId = await applyEmailEvent({
    resendEmailId: quote.resendEmailId,
    type: `email.${result.status}`,
    occurredAt: result.sentAt,
  })
  return Boolean(quoteId)
}

/** @returns {Promise<object>} `{checked, updated, skipped}` counts. */
export async function syncQuoteEmailStatuses() {
  if (!hasResendApiKey()) {
    return { checked: 0, updated: 0, skipped: 0 }
  }

  const quotes = await listQuotesAwaitingDelivery()
  let updated = 0
  let skipped = 0

  for (const [index, quote] of quotes.entries()) {
    if (index > 0) {
      await wait(REQUEST_GAP_MS)
    }

    const changed = await applyResendStatus(quote)
    if (changed === null) {
      skipped += 1
    } else if (changed) {
      updated += 1
    }
  }

  return { checked: quotes.length, updated, skipped }
}

/*
 * One delayed pull after a send, so a delivered quote does not depend on the
 * webhook alone or on someone pressing Refresh. A quote the webhook already
 * moved past "sent" is left alone, so an open is never counted twice.
 */
export async function checkQuoteDeliveryAfterSend(quoteId) {
  if (!hasResendApiKey()) {
    return
  }

  await wait(DELIVERY_CHECK_DELAY_MS)
  try {
    const quote = await getQuote(quoteId)
    if (quote?.resendEmailId && AWAITING_DELIVERY.has(quote.emailStatus || 'sent')) {
      await applyResendStatus(quote)
    }
  } catch (error) {
    console.error('[quotes] post-send delivery check failed', error)
  }
}
