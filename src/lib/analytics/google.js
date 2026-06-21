import 'server-only'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { unstable_noStore as noStore } from 'next/cache'

const DEFAULT_WINDOW_DAYS = 30

function normalizePublicTagId(value) {
  if (!value) return ''

  return String(value)
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
}

function normalizePropertyId(propertyId) {
  if (!propertyId) return ''

  return String(propertyId)
    .replace(/^properties\//, '')
    .trim()
}

function normalizePrivateKey(privateKey) {
  if (!privateKey) return ''

  return privateKey.replace(/\\n/g, '\n')
}

function parseServiceAccountJson(raw) {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)

    if (!parsed.client_email || !parsed.private_key) {
      return null
    }

    return {
      client_email: parsed.client_email,
      private_key: normalizePrivateKey(parsed.private_key),
    }
  } catch {
    return null
  }
}

function getInlineServiceAccount() {
  if (!process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL || !process.env.GOOGLE_ANALYTICS_PRIVATE_KEY) {
    return null
  }

  return {
    client_email: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
    private_key: normalizePrivateKey(process.env.GOOGLE_ANALYTICS_PRIVATE_KEY),
  }
}

export function getGoogleAnalyticsConfig() {
  const measurementId = normalizePublicTagId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
  const gtmId = normalizePublicTagId(process.env.NEXT_PUBLIC_GTM_ID)
  const propertyId = normalizePropertyId(process.env.GOOGLE_ANALYTICS_PROPERTY_ID)
  const credentials =
    parseServiceAccountJson(process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON) || getInlineServiceAccount()

  return {
    measurementId,
    gtmId,
    propertyId,
    credentials,
  }
}

export function hasGoogleAnalyticsMeasurementId() {
  return Boolean(getGoogleAnalyticsConfig().measurementId)
}

export function hasGoogleTagManagerId() {
  return Boolean(getGoogleAnalyticsConfig().gtmId)
}

export function hasGoogleAnalyticsReportingConfig() {
  const config = getGoogleAnalyticsConfig()

  return Boolean(config.propertyId && config.credentials)
}

function createAnalyticsClient(credentials) {
  return new BetaAnalyticsDataClient({ credentials })
}

function parseMetricValue(metricValues, index) {
  const rawValue = metricValues?.[index]?.value

  return rawValue ? Number(rawValue) : 0
}

export async function getGoogleAnalyticsSnapshot({ days = DEFAULT_WINDOW_DAYS } = {}) {
  noStore()

  const config = getGoogleAnalyticsConfig()

  if (!config.propertyId || !config.credentials) {
    return null
  }

  try {
    const client = createAnalyticsClient(config.credentials)
    const [response] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'conversions' },
        { name: 'engagementRate' },
      ],
    })

    const metricValues = response.rows?.[0]?.metricValues ?? []

    return {
      status: 'available',
      windowDays: days,
      propertyId: config.propertyId,
      measurementId: config.measurementId || null,
      totalUsers: parseMetricValue(metricValues, 0),
      sessions: parseMetricValue(metricValues, 1),
      pageViews: parseMetricValue(metricValues, 2),
      conversions: parseMetricValue(metricValues, 3),
      engagementRate: parseMetricValue(metricValues, 4) * 100,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'error',
      windowDays: days,
      propertyId: config.propertyId,
      measurementId: config.measurementId || null,
      error: error instanceof Error ? error.message : 'Failed to load Google Analytics data.',
    }
  }
}
