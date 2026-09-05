/*
 * Resend's `last_event` values and their display labels.
 *
 * Kept in its own dependency-free module because the admin history table (a
 * client component) renders these labels, and importing them from
 * ./invoice-email-status.js would pull the Resend SDK into the browser bundle.
 */

export const EMAIL_STATUS_LABELS = {
  queued: 'Queued',
  scheduled: 'Scheduled',
  sent: 'Sent',
  delivered: 'Delivered',
  delivery_delayed: 'Delayed',
  opened: 'Opened',
  clicked: 'Clicked',
  bounced: 'Bounced',
  complained: 'Marked as spam',
  failed: 'Failed',
  canceled: 'Canceled',
  suppressed: 'Suppressed',
}

/** True once Resend has confirmed the message actually reached the inbox. */
export const CONFIRMED_DELIVERY_STATUSES = new Set(['delivered', 'opened', 'clicked'])
