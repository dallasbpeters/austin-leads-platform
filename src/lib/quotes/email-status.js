/*
 * Pull-based repair for quote delivery status.
 *
 * The Resend webhook (/api/quotes/email-events) is the normal path. Resend
 * does not resend events that the webhook missed, so this asks Resend for the
 * current state of each quote that still reads "sent" and applies it through
 * the same forward-only rules the webhook uses.
 */

import { setTimeout as wait } from 'node:timers/promises'

import { fetchResendEmailStatus, hasResendApiKey } from '../christmas/invoice-email-status.js'
import { applyEmailEvent, listQuotesAwaitingDelivery } from './db.js'

// Resend allows 2 API requests per second by default.
const REQUEST_GAP_MS = 600

/**
 * @returns {Promise<object>} `{checked, updated, skipped}` counts, or
 *   `{reason}` when Resend is not configured.
 */
export async function syncQuoteEmailStatuses({ requestGapMs = REQUEST_GAP_MS } = {}) {
  if (!hasResendApiKey()) {
    return { checked: 0, updated: 0, skipped: 0, reason: 'Email is not configured. Set RESEND_API_KEY.' }
  }

  const quotes = await listQuotesAwaitingDelivery()
  let updated = 0
  let skipped = 0

  for (const [index, quote] of quotes.entries()) {
    if (index > 0) {
      await wait(requestGapMs)
    }

    const result = await fetchResendEmailStatus(quote)
    if (!result.ok) {
      skipped += 1
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
