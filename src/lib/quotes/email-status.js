/*
 * Pull-based repair for quote delivery status, for events the Resend webhook
 * missed. See "Email tracking" in docs/quotes-setup.md.
 */

import { setTimeout as wait } from 'node:timers/promises'

import { fetchResendEmailStatus, hasResendApiKey } from '../christmas/invoice-email-status.js'
import { applyEmailEvent, listQuotesAwaitingDelivery } from './db.js'

// Resend allows 2 API requests per second by default.
const REQUEST_GAP_MS = 600

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

    const result = await fetchResendEmailStatus(quote)
    if (!result.ok) {
      skipped += 1
      continue
    }
    if (result.status === (quote.emailStatus || 'sent')) {
      continue
    }

    // Resend reports the latest event but not when it happened. The send
    // time is the closest known time for it.
    const quoteId = await applyEmailEvent({
      resendEmailId: quote.resendEmailId,
      type: `email.${result.status}`,
      occurredAt: result.sentAt,
    })
    if (quoteId) {
      updated += 1
    }
  }

  return { checked: quotes.length, updated, skipped }
}
