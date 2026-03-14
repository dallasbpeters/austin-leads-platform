import {
  getLeadRoutingSettingsRow,
  hasLeadDatabase,
  upsertLeadRoutingSettingsRow,
} from './db.mjs'

const DEFAULT_RECIPIENT = 'kathy@texassolarandroofing.com'
const DEFAULT_FROM_NAME = 'Texas Solar and Roofing Pros'
const DEFAULT_SUBJECT_PREFIX = 'New lead'

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase()
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
  const envDefaults = getEnvDefaults()
  const record = hasLeadDatabase() ? await getLeadRoutingSettingsRow().catch(() => null) : null

  const settings = {
    title: 'Lead Routing Settings',
    emailNotificationsEnabled: record?.emailNotificationsEnabled ?? true,
    notificationToEmail: normalizeEmail(record?.notificationToEmail) || envDefaults.notificationToEmail,
    fromName: normalizeString(record?.fromName) || envDefaults.fromName,
    fromEmail: normalizeEmail(record?.fromEmail) || envDefaults.fromEmail,
    subjectPrefix: normalizeString(record?.subjectPrefix) || envDefaults.subjectPrefix,
    resendTemplateId: normalizeString(record?.resendTemplateId) || envDefaults.resendTemplateId,
  }

  return {
    ...settings,
    apiKeyConfigured: isResendConfigured(),
    providerReady: Boolean(isResendConfigured() && settings.fromEmail),
    canSave: hasLeadDatabase(),
    documentSource: record ? 'database' : 'env',
  }
}

export async function saveLeadRoutingSettings(input) {
  if (!hasLeadDatabase()) {
    throw new Error('Lead settings database is not configured.')
  }

  const record = {
    emailNotificationsEnabled: input.emailNotificationsEnabled !== false,
    notificationToEmail: normalizeEmail(input.notificationToEmail),
    fromName: normalizeString(input.fromName) || DEFAULT_FROM_NAME,
    fromEmail: normalizeEmail(input.fromEmail),
    subjectPrefix: normalizeString(input.subjectPrefix) || DEFAULT_SUBJECT_PREFIX,
    resendTemplateId: normalizeString(input.resendTemplateId),
  }

  if (!record.notificationToEmail) {
    throw new Error('Notification recipient is required.')
  }

  if (!record.fromEmail) {
    throw new Error('Sender email is required.')
  }

  await upsertLeadRoutingSettingsRow(record)

  return getLeadRoutingSettings()
}
