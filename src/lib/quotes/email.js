/*
 * Sends a quote PDF to the customer via the existing Resend account.
 * Reuses RESEND_API_KEY / RESEND_FROM_EMAIL / RESEND_FROM_NAME env vars.
 */

import { Resend } from 'resend'

import { getCompanyInfo } from './pdf.js'

const escapeHtml = (value) =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

/** Accepts bare email or `Name <email@domain>` (same as documents email). */
function parseFromAddress() {
  const rawValue = process.env.RESEND_FROM_EMAIL?.trim().replaceAll(/^["']|["']$/g, '')
  if (!rawValue) {
    return null
  }

  const formattedMatch = rawValue.match(/^(.+?)\s*<([^<>@\s]+@[^<>@\s]+)>$/)
  if (formattedMatch) {
    return `${formattedMatch[1].trim()} <${formattedMatch[2].trim()}>`
  }

  if (!/^[^<>@\s]+@[^<>@\s]+$/.test(rawValue)) {
    return null
  }

  const fromName = process.env.RESEND_FROM_NAME?.trim() || getCompanyInfo().name
  return `${fromName} <${rawValue}>`
}

export function hasQuoteEmailConfig() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && parseFromAddress())
}

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

function buildQuoteEmailHtml({ quote, message }) {
  const company = getCompanyInfo()
  const { computed = {} } = quote.data || {}
  const firstName =
    String(quote.customerName || '')
      .trim()
      .split(/\s+/)[0] || 'there'

  const custom = message
    ? `<p style="margin:0 0 16px">${escapeHtml(message).replaceAll('\n', '<br />')}</p>`
    : ''

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1d2733;max-width:560px;margin:0 auto">
    <div style="background:#16324f;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:18px">${escapeHtml(company.name)}</h1>
      <p style="margin:4px 0 0;color:#f5a623;font-size:12px">${escapeHtml(company.tagline)}</p>
    </div>
    <div style="border:1px solid #dde4ea;border-top:0;padding:24px;border-radius:0 0 8px 8px">
      <p style="margin:0 0 16px">Hi ${escapeHtml(firstName)},</p>
      ${custom}
      <p style="margin:0 0 16px">
        Your solar quote <strong>${escapeHtml(quote.quoteNumber)}</strong> is attached as a PDF.
        Here are the highlights:
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin:0 0 16px">
        <tr>
          <td style="padding:6px 0;color:#5b6b7b">System Size</td>
          <td style="padding:6px 0;text-align:right"><strong>${escapeHtml(String(computed.systemSizeKw ?? '—'))} kW</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#5b6b7b">Estimated Annual Production</td>
          <td style="padding:6px 0;text-align:right"><strong>${Number(computed.annualProductionKwh || 0).toLocaleString()} kWh</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#5b6b7b">Net System Price</td>
          <td style="padding:6px 0;text-align:right"><strong>${money(computed.netSystemPrice)}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#5b6b7b">25-Year Estimated Savings</td>
          <td style="padding:6px 0;text-align:right"><strong>${money(computed.lifetimeSavings)}</strong></td>
        </tr>
      </table>
      <p style="margin:0 0 16px">This quote is valid for 30 days. Reply to this email with any questions — we're happy to help.</p>
      <p style="margin:0">Thank you,<br /><strong>${escapeHtml(company.name)}</strong></p>
    </div>
  </div>`
}

/**
 * @param {object} params
 * @param {object} params.quote     Quote record
 * @param {Buffer} params.pdfBuffer Rendered quote PDF
 * @param {string} params.fileName  Attachment file name
 * @param {string} [params.to]      Defaults to the quote's customer email
 * @param {string} [params.message] Optional personal note placed above the summary
 */
export async function sendQuoteEmail({ quote, pdfBuffer, fileName, to, message }) {
  if (!hasQuoteEmailConfig()) {
    throw new Error('Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.')
  }

  const recipient = String(to || quote.customerEmail || '').trim()
  if (!recipient) {
    throw new Error('No recipient email address. Add a customer email or provide one when sending.')
  }

  const from = parseFromAddress()
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL must be a valid email or "Name <email>" string.')
  }

  const resend = new Resend(process.env.RESEND_API_KEY.trim())

  const { data, error } = await resend.emails.send({
    from,
    to: [recipient],
    subject: `Your Solar Quote ${quote.quoteNumber} — ${getCompanyInfo().name}`,
    html: buildQuoteEmailHtml({ quote, message }),
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
