/*
 * Sends a Christmas invoice PDF to the customer via Resend.
 * Mirrors the Solar quote email flow but with the Texas Christmas Lights
 * brand and the invoice's own company settings.
 */

import { Resend } from 'resend'

import { getChristmasCompanyInfo } from './invoice-pdf.js'
import { getChristmasInvoiceSettings } from './invoice-settings.js'

const escapeHtml = (value) =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

/**
 * Prefers the Christmas company's own name + email (from invoice settings)
 * so invoices never go out under the Solar brand's shared RESEND_FROM_EMAIL.
 * Falls back to RESEND_FROM_EMAIL's domain (with the Christmas name) only if
 * no Christmas company email is configured — Resend requires the "from"
 * domain to be verified, so an unconfigured Christmas domain would otherwise
 * hard-fail the send.
 */
function parseFromAddress(companyName, companyEmail) {
  const email = String(companyEmail || '').trim()
  if (email && /^[^<>@\s]+@[^<>@\s]+$/.test(email)) {
    return `${companyName} <${email}>`
  }

  const rawValue = process.env.RESEND_FROM_EMAIL?.trim().replaceAll(/^["']|["']$/g, '')
  if (!rawValue) {
    return null
  }

  const formattedMatch = rawValue.match(/^(.+?)\s*<([^<>@\s]+@[^<>@\s]+)>$/)
  if (formattedMatch) {
    return `${companyName} <${formattedMatch[2].trim()}>`
  }

  if (!/^[^<>@\s]+@[^<>@\s]+$/.test(rawValue)) {
    return null
  }

  return `${companyName} <${rawValue}>`
}

export function hasInvoiceEmailConfig(companyName, companyEmail) {
  return Boolean(process.env.RESEND_API_KEY?.trim() && parseFromAddress(companyName, companyEmail))
}

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0) / 100)

function fmtDate(str) {
  if (!str) {
    return ''
  }
  const d = new Date(str)
  if (Number.isNaN(d.getTime())) {
    return ''
  }
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function buildInvoiceEmailHtml({ invoice, company, message }) {
  const { inputs = {}, computed = {} } = invoice.data || {}
  const firstName = String(invoice.customerFirstName || inputs.customerFirstName || '').trim() || 'there'

  const balanceDueCents = Number(invoice.balanceDueCents ?? computed.balanceDueCents ?? 0)
  const installDate = fmtDate(inputs.installDate)
  const dueDate = fmtDate(inputs.dueDate || invoice.dueDate)

  const custom = message
    ? `<p style="margin:0 0 16px">${escapeHtml(message).replaceAll('\n', '<br />')}</p>`
    : ''

  return `
  <div style="background:#0d1f0e;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;">
      <div style="padding:26px 28px;background:linear-gradient(135deg,#0d3b1c 0%,#14532d 100%);color:#ffffff;text-align:center;">
        <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.75;margin-bottom:8px;">
          ${escapeHtml(company.name)}
        </div>
        <h1 style="margin:0;font-size:22px;line-height:1.2;font-weight:700;">Invoice ${escapeHtml(invoice.invoiceNumber || '')}</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Hi ${escapeHtml(firstName)},</p>
        ${custom}
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
          Your invoice is attached as a PDF. Here are the highlights:
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin:0 0 20px;">
          <tr>
            <td style="padding:8px 20px;color:#6b7280;width:150px;">Package</td>
            <td style="padding:8px 20px;color:#111827;font-weight:600;text-align:right;">${escapeHtml(inputs.packageLabel || '—')}</td>
          </tr>
          <tr>
            <td style="padding:8px 20px;color:#6b7280;">Install date</td>
            <td style="padding:8px 20px;color:#111827;font-weight:600;text-align:right;">${escapeHtml(installDate || '—')}</td>
          </tr>
          <tr>
            <td style="padding:8px 20px;color:#6b7280;">Due date</td>
            <td style="padding:8px 20px;color:#111827;font-weight:600;text-align:right;">${escapeHtml(dueDate || '—')}</td>
          </tr>
          <tr>
            <td style="padding:8px 20px;color:#6b7280;">Balance due</td>
            <td style="padding:8px 20px;color:#ea580c;font-size:19px;font-weight:700;text-align:right;">${escapeHtml(money(balanceDueCents))}</td>
          </tr>
        </table>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#374151;">
          Your attached PDF has the full line-item breakdown. Reply to this email with any questions —
          we're happy to help.
        </p>
        <p style="margin:0;">Thank you,<br /><strong>${escapeHtml(company.name)}</strong><br />${escapeHtml(company.tagline || '')}</p>
      </div>
      <div style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          Texas Christmas Lights · Austin, TX · ${escapeHtml(company.phone || '')} · ${escapeHtml(company.website || '')}
        </p>
      </div>
    </div>
  </div>`
}

/**
 * Send the invoice PDF to the customer via Resend.
 *
 * @param {object} params
 * @param {object} params.invoice    Invoice record
 * @param {Buffer} params.pdfBuffer  Rendered invoice PDF
 * @param {string} params.fileName   Attachment file name
 * @param {string} [params.to]       Defaults to the invoice's customer email
 * @param {string} [params.message]  Optional personal note placed above the summary
 * @param {object} [params.company]  Resolved company settings (fetched if omitted)
 */
export async function sendInvoiceEmail({ invoice, pdfBuffer, fileName, to, message, company }) {
  const config = company || (await getChristmasInvoiceSettings().catch(() => getChristmasCompanyInfo()))
  const companyName = config?.companyName || getChristmasCompanyInfo().name
  const companyEmail = config?.companyEmail || getChristmasCompanyInfo().email

  if (!hasInvoiceEmailConfig(companyName, companyEmail)) {
    throw new Error('Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.')
  }

  const recipient = String(to || invoice.customerEmail || '').trim()
  if (!recipient) {
    throw new Error('No recipient email address. Add a customer email or provide one when sending.')
  }

  const from = parseFromAddress(companyName, companyEmail)
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL must be a valid email or "Name <email>" string.')
  }

  const resend = new Resend(process.env.RESEND_API_KEY.trim())
  const { data, error } = await resend.emails.send({
    from,
    to: [recipient],
    subject: `Your Invoice ${invoice.invoiceNumber || ''} — ${companyName}`,
    html: buildInvoiceEmailHtml({ invoice, company: config, message }),
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer.toString('base64'),
      },
    ],
  })

  if (error) {
    throw new Error(`Resend send failed: ${error.message || JSON.stringify(error)}`)
  }
  return { id: data?.id || null, to: recipient }
}
