import { groq } from 'next-sanity'

import { getSanityServerClient, sanityWriteClient } from '@/sanity/client'

export const LEAD_ROUTING_SETTINGS_ID = 'leadRoutingSettings'
const DEFAULT_RECIPIENT = 'kathy@texassolarandroofing.com'
const DEFAULT_FROM_NAME = 'Texas Solar and Roofing Pros'
const DEFAULT_SUBJECT_PREFIX = 'New lead'

const leadRoutingSettingsQuery = groq`
  *[_type == "leadRoutingSettings" && _id == $id][0]{
    _id,
    _type,
    title,
    emailNotificationsEnabled,
    notificationToEmail,
    fromName,
    fromEmail,
    subjectPrefix
    resendTemplateId
  }
`

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase()
}

function getReadClient() {
  return sanityWriteClient || getSanityServerClient({ preview: false, stega: false })
}

function getEnvDefaults() {
  return {
    notificationToEmail: normalizeEmail(process.env.RESEND_LEAD_TO_EMAIL) || DEFAULT_RECIPIENT,
    fromName: normalizeString(process.env.RESEND_FROM_NAME) || DEFAULT_FROM_NAME,
    fromEmail: normalizeEmail(process.env.RESEND_FROM_EMAIL),
    subjectPrefix: normalizeString(process.env.RESEND_SUBJECT_PREFIX) || DEFAULT_SUBJECT_PREFIX,
    resendTemplateId: normalizeString(process.env.RESEND_TEMPLATE_ID),
  }
}

export function isResendConfigured() {
  return Boolean(normalizeString(process.env.RESEND_API_KEY))
}

export async function getLeadRoutingSettings() {
  const client = getReadClient()
  const envDefaults = getEnvDefaults()
  const document = client
    ? await client.fetch(leadRoutingSettingsQuery, { id: LEAD_ROUTING_SETTINGS_ID }).catch(() => null)
    : null

  const settings = {
    title: document?.title || 'Lead Routing Settings',
    emailNotificationsEnabled: document?.emailNotificationsEnabled ?? true,
    notificationToEmail: normalizeEmail(document?.notificationToEmail) || envDefaults.notificationToEmail,
    fromName: normalizeString(document?.fromName) || envDefaults.fromName,
    fromEmail: normalizeEmail(document?.fromEmail) || envDefaults.fromEmail,
    subjectPrefix: normalizeString(document?.subjectPrefix) || envDefaults.subjectPrefix,
    resendTemplateId: normalizeString(document?.resendTemplateId) || envDefaults.resendTemplateId,
  }

  return {
    ...settings,
    apiKeyConfigured: isResendConfigured(),
    providerReady: Boolean(isResendConfigured() && settings.fromEmail),
    canSave: Boolean(sanityWriteClient),
    documentSource: document ? 'sanity' : 'env',
  }
}

export async function saveLeadRoutingSettings(input) {
  if (!sanityWriteClient) {
    throw new Error('Sanity write access is not configured.')
  }

  const document = {
    _id: LEAD_ROUTING_SETTINGS_ID,
    _type: 'leadRoutingSettings',
    title: 'Lead Routing Settings',
    emailNotificationsEnabled: input.emailNotificationsEnabled !== false,
    notificationToEmail: normalizeEmail(input.notificationToEmail),
    fromName: normalizeString(input.fromName) || DEFAULT_FROM_NAME,
    fromEmail: normalizeEmail(input.fromEmail),
    subjectPrefix: normalizeString(input.subjectPrefix) || DEFAULT_SUBJECT_PREFIX,
    resendTemplateId: normalizeString(input.resendTemplateId),
  }

  if (!document.notificationToEmail) {
    throw new Error('Notification recipient is required.')
  }

  if (!document.fromEmail) {
    throw new Error('Sender email is required.')
  }

  await sanityWriteClient.createOrReplace(document)

  return getLeadRoutingSettings()
}
