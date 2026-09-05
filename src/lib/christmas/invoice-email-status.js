/*
 * Delivery verification for sent invoices.
 *
 * The send itself only proves Resend accepted the message. This asks Resend
 * what actually happened to it afterwards -- delivered, bounced, opened -- so
 * the admin can confirm the customer really received the invoice.
 *
 * This is a pull: it queries Resend on demand rather than waiting for a
 * webhook. That means it works with nothing configured but RESEND_API_KEY, and
 * it reports the current truth every time it is asked. (The quotes side also
 * receives Resend webhooks at /api/quotes/email-events; the two approaches are
 * complementary and both read the same `last_event` values.)
 */

import { Resend } from 'resend'

export { EMAIL_STATUS_LABELS } from './invoice-email-labels.js'

/*
 * Reading delivery state needs a Resend key with full access -- a key created
 * with "Sending access" can send mail but answers every read with HTTP 401
 * `restricted_api_key`. RESEND_READ_API_KEY exists so the send path can keep
 * using a restricted key while verification uses a full-access one; if it is
 * unset, RESEND_API_KEY is used and must itself have full access.
 */
const RESTRICTED_KEY_MESSAGE =
  'The Resend API key is send-only, so delivery cannot be read. Add a full-access key as RESEND_READ_API_KEY.'

function getReadApiKey() {
  return (process.env.RESEND_READ_API_KEY || process.env.RESEND_API_KEY || '').trim()
}

export function hasResendApiKey() {
  return Boolean(getReadApiKey())
}

function getResend() {
  return new Resend(getReadApiKey())
}

const isRestrictedKeyError = (error) =>
  error?.name === 'restricted_api_key' || /restricted to only send/i.test(error?.message || '')

const isNotFoundError = (error) => error?.name === 'not_found' || /not found/i.test(error?.message || '')

/**
 * Maps an expected Resend error to a message for the admin. Returns null for
 * anything unexpected, which the caller then throws.
 */
function describeResendError(error) {
  if (isRestrictedKeyError(error)) {
    return RESTRICTED_KEY_MESSAGE
  }
  /*
   * Resend retains message history for a limited window, so an id stored on an
   * older invoice can outlive the record it points at. That is a stale
   * reference, not a failure worth logging as one.
   */
  if (isNotFoundError(error)) {
    return 'Resend no longer has a record of this message — it may have aged out of your retention window.'
  }
  return null
}

const normalizeEmail = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const matchesInvoice = (email, invoice) => {
  const recipients = (email.to || []).map(normalizeEmail)
  const expected = normalizeEmail(invoice.emailedTo || invoice.customerEmail)
  if (!expected || !recipients.includes(expected)) {
    return false
  }
  const invoiceNumber = String(invoice.invoiceNumber || '').trim()
  return invoiceNumber ? String(email.subject || '').includes(invoiceNumber) : true
}

/*
 * Invoices sent before delivery tracking existed have no stored message id.
 * For those, the sent mail is found by scanning the recent Resend history for
 * a message addressed to this customer whose subject carries the invoice
 * number. Only used as a fallback -- a stored id is always preferred.
 */
async function findEmailByInvoice(invoice) {
  const { data, error } = await getResend().emails.list({ limit: 100 })
  if (error) {
    const reason = describeResendError(error)
    if (reason) {
      return { reason }
    }
    throw new Error(`Resend lookup failed: ${error.message || JSON.stringify(error)}`)
  }
  return { record: (data?.data || []).find((email) => matchesInvoice(email, invoice)) || null }
}

/**
 * Ask Resend for the current delivery state of an invoice's email.
 *
 * @param {object} invoice Invoice record (needs resendEmailId, or emailedTo +
 *   invoiceNumber for the history fallback)
 * @returns {Promise<object>} `{ok: true, status, resendEmailId, to, subject,
 *   sentAt}` when Resend answered, otherwise `{ok: false}` with a `reason`
 *   (expected, shown to the admin) or an `error` (unexpected failure).
 */
export async function fetchResendEmailStatus(invoice) {
  if (!hasResendApiKey()) {
    return { ok: false, reason: 'Email is not configured. Set RESEND_API_KEY.' }
  }
  if (invoice.status !== 'sent' && !invoice.resendEmailId) {
    return { ok: false, reason: 'This invoice has not been emailed yet.' }
  }

  try {
    let record = null

    if (invoice.resendEmailId) {
      const { data, error } = await getResend().emails.get(invoice.resendEmailId)
      if (error) {
        const reason = describeResendError(error)
        if (reason) {
          return { ok: false, reason }
        }
        throw new Error(error.message || JSON.stringify(error))
      }
      record = data
    } else {
      const found = await findEmailByInvoice(invoice)
      if (found.reason) {
        return { ok: false, reason: found.reason }
      }
      record = found.record
      if (!record) {
        return {
          ok: false,
          reason:
            'No matching message found in the recent Resend history. It may be older than the last 100 sends.',
        }
      }
    }

    return {
      ok: true,
      status: record.last_event || 'sent',
      resendEmailId: record.id,
      to: (record.to || [])[0] || null,
      subject: record.subject || null,
      sentAt: record.created_at || null,
    }
  } catch (error) {
    console.error('[christmas/invoices] resend status lookup failed', error)
    return { ok: false, error: error.message || 'Resend lookup failed.' }
  }
}
