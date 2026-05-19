import { Resend } from 'resend'

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || ''
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function fmt(cents) {
  if (!cents && cents !== 0) return ''
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function fmtDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function buildInvoiceHtml({ job, amountDueCents, hostedUrl, dueDate }) {
  const customerFirstName = (job.full_name || '').split(' ')[0] || 'there'
  const packageLabel = (job.package_slug || '')
    .replace(/^xmas-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const dueLine = dueDate
    ? `<p style="margin:0 0 6px;font-size:14px;color:#6b7280;">Due by ${escapeHtml(fmtDate(dueDate))}</p>`
    : ''

  return `
    <div style="background:#0d1f0e;padding:32px;font-family:Manrope,Arial,sans-serif;color:#1a1a1a;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;">

        <!-- Header -->
        <div style="padding:28px 32px;background:linear-gradient(135deg,#0d1f0e 0%,#1a4a1c 100%);color:#ffffff;text-align:center;">
          <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.7;margin-bottom:10px;">
            Texas Christmas Lights
          </div>
          <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:700;">
            Your Balance Invoice
          </h1>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#374151;">
            Hi ${escapeHtml(customerFirstName)},
          </p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#374151;">
            Your installation is almost here! Below is your remaining balance invoice for your
            ${escapeHtml(packageLabel)} package. Please pay before your scheduled install date so
            your crew is all set to go.
          </p>

          <!-- Summary card -->
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;margin:0 0 28px;">
            <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6;">
              <tr>
                <td style="padding:6px 0;color:#6b7280;width:140px;">Property</td>
                <td style="padding:6px 0;color:#111827;font-weight:600;">${escapeHtml(job.address || '—')}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;">Install date</td>
                <td style="padding:6px 0;color:#111827;font-weight:600;">${escapeHtml(fmtDate(job.install_date) || '—')}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;">Package</td>
                <td style="padding:6px 0;color:#111827;font-weight:600;">${escapeHtml(packageLabel || '—')}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;">Amount due</td>
                <td style="padding:6px 0;color:#111827;font-size:20px;font-weight:700;">${escapeHtml(fmt(amountDueCents))}</td>
              </tr>
            </table>
          </div>

          ${dueLine}

          <!-- CTA -->
          <div style="text-align:center;margin:28px 0 8px;">
            <a
              href="${escapeHtml(hostedUrl)}"
              style="display:inline-block;background:#1a4a1c;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.02em;"
            >
              Pay Invoice →
            </a>
          </div>

          <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#9ca3af;text-align:center;">
            Or copy this link: <a href="${escapeHtml(hostedUrl)}" style="color:#1a4a1c;word-break:break-all;">${escapeHtml(hostedUrl)}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
            Questions? Reply to this email or call us directly.<br/>
            Texas Christmas Lights · Austin, TX
          </p>
        </div>

      </div>
    </div>
  `
}

function buildInvoiceText({ job, amountDueCents, hostedUrl, dueDate }) {
  const packageLabel = (job.package_slug || '').replace(/^xmas-/, '').replace(/-/g, ' ')
  const lines = [
    'Your Texas Christmas Lights Balance Invoice',
    '',
    `Property: ${job.address || '—'}`,
    `Install date: ${fmtDate(job.install_date) || '—'}`,
    `Package: ${packageLabel || '—'}`,
    `Amount due: ${fmt(amountDueCents)}`,
    dueDate ? `Due by: ${fmtDate(dueDate)}` : '',
    '',
    `Pay here: ${hostedUrl}`,
    '',
    'Questions? Reply to this email.',
    'Texas Christmas Lights · Austin, TX',
  ].filter((l) => l !== undefined)

  return lines.join('\n')
}

/**
 * Send a branded invoice email to the customer.
 * Non-fatal — logs errors but does not throw so the invoice creation still succeeds.
 */
export async function sendInvoiceEmail({ job, amountDueCents, hostedUrl, dueDate = null }) {
  const apiKey = getResendApiKey()
  if (!apiKey) {
    console.warn('[christmas/email] Resend API key not configured — invoice email skipped.')
    return { status: 'skipped', reason: 'Resend API key not configured.' }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
  if (!fromEmail) {
    console.warn('[christmas/email] RESEND_FROM_EMAIL not configured — invoice email skipped.')
    return { status: 'skipped', reason: 'RESEND_FROM_EMAIL not configured.' }
  }

  const fromName = 'Texas Christmas Lights'
  const from = `${fromName} <${fromEmail}>`
  const subject = `Your balance invoice — ${fmt(amountDueCents)} due`

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to: [job.email],
      subject,
      html: buildInvoiceHtml({ job, amountDueCents, hostedUrl, dueDate }),
      text: buildInvoiceText({ job, amountDueCents, hostedUrl, dueDate }),
    })

    if (error) {
      console.error('[christmas/email] Resend error sending invoice email.', { error, to: job.email })
      return { status: 'error', reason: error.message }
    }

    console.info('[christmas/email] Invoice email sent.', { resendId: data?.id, to: job.email })
    return { status: 'sent', id: data?.id }
  } catch (err) {
    console.error('[christmas/email] Unexpected error sending invoice email.', { err, to: job.email })
    return { status: 'error', reason: err?.message ?? 'Unknown error' }
  }
}
