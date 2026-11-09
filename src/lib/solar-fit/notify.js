/*
 * What happens after someone sends the "See if solar is right for you" form:
 * an email to the team, a copy of the estimate to the homeowner, and a row in
 * the Zoho spreadsheet. Each step reports its own status, so one failure
 * (Zoho down, say) never loses the lead or blocks the emails.
 */

import { Resend } from 'resend'

import { getLeadRoutingSettings } from '@/lib/leads/settings'
import { getZohoAccessToken, zohoAuthHeader } from '@/lib/zoho/auth'

import { formatOutput } from './model'

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const visibleOutputs = (result) => result.outputs.filter((output) => output.format !== 'hidden')

/** "Answer" text for each question, e.g. "Under 10 years" rather than 5. */
function answerRows(model, result) {
  return model.inputs.map((input) => {
    const value = result.values[input.key]
    const option = input.options?.find((candidate) => candidate.value === value)
    const text = option
      ? option.label
      : `${input.prefix || ''}${value?.toLocaleString('en-US')}${input.suffix ? ` ${input.suffix}` : ''}`
    return [input.label, text]
  })
}

function table(rows) {
  return `<table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;">${rows
    .map(
      ([label, value]) => `<tr>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;vertical-align:top;width:45%;">${escapeHtml(label)}</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join('')}</table>`
}

function shell(eyebrow, heading, body) {
  return `<div style="background:#f8fafc;padding:32px;font-family:Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="padding:24px 28px;background:#040a17;color:#ffffff;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#ffd06b;">${escapeHtml(eyebrow)}</div>
        <h1 style="margin:10px 0 0;font-size:26px;line-height:1.2;font-weight:500;">${escapeHtml(heading)}</h1>
      </div>
      <div style="padding:24px 28px;">${body}</div>
    </div>
  </div>`
}

const sectionHeading = (text) =>
  `<h2 style="margin:24px 0 10px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:#62748e;">${escapeHtml(text)}</h2>`

function fitText(model, result) {
  if (result.qualifies === null) {
    return ''
  }
  return result.qualifies ? model.qualifiedMessage : model.notQualifiedMessage
}

export async function sendSolarFitEmails({ lead, model, result, siteName }) {
  const settings = await getLeadRoutingSettings()
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!apiKey || !settings.fromEmail) {
    return { team: 'skipped', homeowner: 'skipped', reason: 'Resend is not configured.' }
  }

  const resend = new Resend(apiKey)
  const from = settings.fromName ? `${settings.fromName} <${settings.fromEmail}>` : settings.fromEmail
  const answers = answerRows(model, result)
  const results = visibleOutputs(result).map((output) => [output.label, formatOutput(output)])
  const fit = fitText(model, result)
  const status = { team: 'skipped', homeowner: 'skipped' }

  if (settings.emailNotificationsEnabled && settings.notificationToEmail) {
    const contact = [
      ['Name', lead.fullName],
      ['Email', lead.email],
      ['Phone', lead.phone || 'Not provided'],
      ['Address', lead.address || 'Not provided'],
      ['Roof (Google Solar)', lead.roofSummary || 'Not mapped'],
      [
        'Good fit?',
        result.qualifies === null ? 'Not scored' : result.qualifies ? 'Yes' : 'Needs a closer look',
      ],
    ]
    const { error } = await resend.emails.send({
      from,
      to: [settings.notificationToEmail],
      replyTo: lead.email,
      subject: `${settings.subjectPrefix}: Solar fit — ${lead.fullName} (${siteName})`,
      html: shell(
        'New solar fit request',
        lead.fullName,
        `${table(contact)}${sectionHeading('Their answers')}${table(answers)}${sectionHeading('Their estimate')}${table(results)}`,
      ),
    })
    status.team = error ? `failed: ${error.message}` : 'sent'
  }

  const { error: homeownerError } = await resend.emails.send({
    from,
    to: [lead.email],
    replyTo: settings.notificationToEmail || undefined,
    subject: `Your solar estimate from ${siteName}`,
    html: shell(
      'Your solar estimate',
      `Thanks, ${lead.fullName.split(' ')[0]}.`,
      `<p style="margin:0 0 8px;font-size:16px;line-height:1.6;">${escapeHtml(fit)}</p>
       <p style="margin:0 0 8px;font-size:16px;line-height:1.6;">Here is what you entered and what we estimated. We will reach out within one business day to go over it with you. No pressure and no commitment.</p>
       ${sectionHeading('Your estimate')}${table(results)}${sectionHeading('Your answers')}${table(answers)}
       <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#62748e;">These are estimates. Real numbers vary by roof, usage, utility and financing. We confirm everything with a free, no-commitment visit.</p>`,
    ),
  })
  status.homeowner = homeownerError ? `failed: ${homeownerError.message}` : 'sent'

  return status
}

/*
 * One row per request in the "Solar Fit" tab (ZOHO_SOLAR_FIT_WORKSHEET_NAME) of
 * the same workbook the quotes use. Zoho matches JSON keys to the header row
 * and drops keys without a column, so the tab needs a header for each field:
 * the fixed contact columns plus one per question label and result label.
 */
export async function appendSolarFitRow({ lead, model, result, pagePath }) {
  const resourceId = process.env.ZOHO_SHEET_RESOURCE_ID?.trim()
  if (!resourceId) {
    return { status: 'skipped', reason: 'ZOHO_SHEET_RESOURCE_ID is not set.' }
  }

  const record = {
    Date: new Date().toISOString(),
    Name: lead.fullName,
    Email: lead.email,
    Phone: lead.phone || '',
    Address: lead.address || '',
    Roof: lead.roofSummary || '',
    'Good Fit': result.qualifies === null ? '' : result.qualifies ? 'Yes' : 'Review',
    Page: pagePath,
    ...Object.fromEntries(answerRows(model, result)),
    ...Object.fromEntries(visibleOutputs(result).map((output) => [output.label, output.value ?? ''])),
  }

  try {
    const token = await getZohoAccessToken()
    const apiUrl = process.env.ZOHO_SHEET_API_URL?.trim() || 'https://sheet.zoho.com'
    const response = await fetch(`${apiUrl}/api/v2/${resourceId}`, {
      method: 'POST',
      headers: { ...zohoAuthHeader(token), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        method: 'worksheet.records.add',
        worksheet_name: process.env.ZOHO_SOLAR_FIT_WORKSHEET_NAME?.trim() || 'Solar Fit',
        header_row: '1',
        json_data: JSON.stringify([record]),
      }).toString(),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || payload.status === 'failure') {
      return { status: 'failed', reason: payload.error_message || `HTTP ${response.status}` }
    }
    return { status: 'added' }
  } catch (error) {
    return { status: 'failed', reason: error instanceof Error ? error.message : String(error) }
  }
}
