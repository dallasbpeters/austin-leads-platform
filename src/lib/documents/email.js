import { render } from 'react-email'
import { Resend } from 'resend'

import { DocumentSignatureEmail, buildDocumentSignatureEmailText } from '@/lib/documents/email-template'

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || ''
}

function parseFromAddress() {
  const rawValue = process.env.RESEND_FROM_EMAIL?.trim()
  if (!rawValue) {
    return null
  }

  const formattedMatch = rawValue.match(/^(.+?)\s*<([^<>@\s]+@[^<>@\s]+)>$/)
  if (formattedMatch) {
    return {
      from: `${formattedMatch[1].trim()} <${formattedMatch[2].trim()}>`,
      email: formattedMatch[2].trim(),
      name: formattedMatch[1].trim(),
    }
  }

  if (!/^[^<>@\s]+@[^<>@\s]+$/.test(rawValue)) {
    return null
  }

  const fromName = process.env.RESEND_FROM_NAME?.trim() || 'Texas Solar & Roofing Pros'
  return {
    from: `${fromName} <${rawValue}>`,
    email: rawValue,
    name: fromName,
  }
}

export function hasDocumentEmailProvider() {
  return Boolean(getResendApiKey() && parseFromAddress())
}

export async function renderDocumentSignatureEmailHtml({ client, request, recipients, message }) {
  return render(
    DocumentSignatureEmail({
      client,
      request,
      recipients,
      message,
    }),
  )
}

export async function sendDocumentSignatureEmail({ client, request, recipients, message }) {
  const apiKey = getResendApiKey()
  const fromConfig = parseFromAddress()
  const from = fromConfig?.from || ''

  if (!apiKey) {
    console.warn('[documents/email] Resend API key not configured; signature email skipped.', {
      requestId: request?.id,
      to: recipients.map((recipient) => recipient.email).filter(Boolean),
    })
    return { status: 'skipped', reason: 'RESEND_API_KEY is not configured.' }
  }

  if (!from) {
    console.warn('[documents/email] Resend from address not configured; signature email skipped.', {
      requestId: request?.id,
      to: recipients.map((recipient) => recipient.email).filter(Boolean),
    })
    return {
      status: 'skipped',
      reason: 'RESEND_FROM_EMAIL must be a valid email or "Name <email>" string.',
    }
  }

  const to = [...new Set(recipients.map((recipient) => recipient.email).filter(Boolean))]

  if (!to.length) {
    console.warn('[documents/email] No recipient email addresses provided; signature email skipped.', {
      requestId: request?.id,
    })
    return { status: 'skipped', reason: 'No recipient email addresses were provided.' }
  }

  const resend = new Resend(apiKey)
  const html = await renderDocumentSignatureEmailHtml({ client, request, recipients, message })
  const text = buildDocumentSignatureEmailText({ client, request, recipients, message })
  console.info('[documents/email] Sending signature request through Resend.', {
    requestId: request?.id,
    to,
    from,
  })
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: message?.subject?.trim() || `Signature requested: ${request.title}`,
    html,
    text,
  })

  if (error) {
    console.error('[documents/email] Resend error sending signature request.', { error, to })
    return { status: 'error', reason: error.message || 'Resend returned an error.' }
  }

  console.info('[documents/email] Signature request sent through Resend.', {
    requestId: request?.id,
    to,
    emailId: data?.id || null,
  })
  return { status: 'sent', id: data?.id || null, to }
}
