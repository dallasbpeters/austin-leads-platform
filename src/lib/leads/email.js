import { Resend } from 'resend'
import { getLeadRoutingSettings } from './settings'

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

function formatValue(value, fallback = 'Not provided') {
  return value ? String(value).trim() : fallback
}

function formatSubmittedAt(value) {
  const date = value ? new Date(value) : new Date()

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Chicago',
  }).format(date)
}

function buildLeadRows(lead) {
  return [
    ['Name', lead.fullName],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Service interest', lead.serviceInterest],
    ['Lead type', lead.sourceType],
    ['Section', lead.sourceSection],
    ['Site', lead.siteName],
    ['Domain', lead.sourceDomain],
    ['Page', lead.pagePath],
    ['Page title', lead.pageTitle],
    ['Submitted', formatSubmittedAt(lead.createdAt)],
    ['Notes', lead.notes],
  ]
}

function buildHtmlBody(lead) {
  const rows = buildLeadRows(lead)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border:1px solid #d8dee5;background:#f7f8fa;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border:1px solid #d8dee5;vertical-align:top;">${escapeHtml(formatValue(value))}</td>
        </tr>
      `,
    )
    .join('')

  return `
    <div style="background:#f3efe8;padding:32px;font-family:Manrope,Arial,sans-serif;color:#10202b;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #d8dee5;border-radius:18px;overflow:hidden;">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#10202b 0%,#1b4158 100%);color:#ffffff;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.72;">New lead submission</div>
          <h1 style="margin:10px 0 0;font-size:32px;line-height:1.1;">${escapeHtml(lead.fullName)}</h1>
        </div>
        <div style="padding:24px 28px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#375062;">
            A new lead came in from ${escapeHtml(lead.siteName)}. Review the details below and follow up directly with the homeowner.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;">
            ${rows}
          </table>
        </div>
      </div>
    </div>
  `
}

function buildTextBody(lead) {
  const lines = buildLeadRows(lead).map(([label, value]) => `${label}: ${formatValue(value)}`)

  return ['New lead submission', '', ...lines].join('\n')
}

export function hasLeadEmailProvider() {
  return Boolean(getResendApiKey())
}

function formatFromAddress(settings) {
  if (!settings.fromEmail) {
    return ''
  }

  return settings.fromName ? `${settings.fromName} <${settings.fromEmail}>` : settings.fromEmail
}

export async function sendLeadNotificationEmail(lead) {
  const settings = await getLeadRoutingSettings()

  if (!settings.emailNotificationsEnabled) {
    return {
      status: 'skipped',
      reason: 'Lead email notifications are disabled.',
    }
  }

  if (!hasLeadEmailProvider()) {
    return {
      status: 'skipped',
      reason: 'Resend API key is not configured.',
    }
  }

  if (!settings.fromEmail) {
    return {
      status: 'skipped',
      reason: 'Sender email is not configured.',
    }
  }

  if (!settings.notificationToEmail) {
    return {
      status: 'skipped',
      reason: 'Lead recipient email is not configured.',
    }
  }

  const resend = new Resend(getResendApiKey())

  const { data, error } = await resend.emails.send({
    from: formatFromAddress(settings),
    to: [settings.notificationToEmail],
    replyTo: lead.email,
    subject: `${settings.subjectPrefix}: ${lead.fullName} (${lead.siteName})`,
    html: buildHtmlBody(lead),
    text: buildTextBody(lead),
  })

  if (error) {
    throw new Error(error.message || 'Unable to send lead notification email.')
  }

  return {
    status: 'sent',
    id: data?.id || null,
  }
}
