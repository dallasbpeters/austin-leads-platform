import { getGoogleAnalyticsConfig, hasGoogleAnalyticsReportingConfig } from '@/lib/analytics/google'

import { initialAnalyticsGoals, initialDomainRecords, initialPublishJobs } from './fixtures'

let publishJobs = initialPublishJobs.map((job) => ({ ...job }))
let domainRecords = initialDomainRecords.map((domain) => ({ ...domain }))
let analyticsGoals = initialAnalyticsGoals.map((goal) => ({ ...goal }))

const now = () => new Date().toISOString()

export function listPublishJobs() {
  return [...publishJobs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function createPublishJob(input) {
  const job = {
    id: `job-${crypto.randomUUID()}`,
    siteSlug: input.siteSlug,
    contentType: input.contentType,
    title: input.title || input.prompt,
    prompt: input.prompt,
    sources: input.sources ?? [],
    provider: input.provider ?? 'placeholder-openai',
    model: input.model ?? 'gpt-4.1',
    status: 'queued',
    reviewStatus: 'not_started',
    output: '',
    createdAt: now(),
    updatedAt: now(),
  }

  publishJobs = [job, ...publishJobs]

  return job
}

export function updatePublishJob(jobId, patch) {
  let updated

  publishJobs = publishJobs.map((job) => {
    if (job.id !== jobId) {
      return job
    }

    updated = {
      ...job,
      ...patch,
      updatedAt: now(),
    }

    return updated
  })

  return updated ?? null
}

export function getPublishJob(jobId) {
  return publishJobs.find((job) => job.id === jobId) ?? null
}

export function listDomainRecords() {
  return [...domainRecords].sort((a, b) => a.domain.localeCompare(b.domain))
}

export function upsertDomainRecord(domainRecord) {
  const existing = domainRecords.find((record) => record.domain === domainRecord.domain)

  if (existing) {
    const nextRecord = {
      ...existing,
      ...domainRecord,
      lastCheckedAt: now(),
    }

    domainRecords = domainRecords.map((record) =>
      record.domain === domainRecord.domain ? nextRecord : record,
    )

    return nextRecord
  }

  const created = {
    id: `domain-${crypto.randomUUID()}`,
    verified: false,
    dnsInstructions: [],
    lastCheckedAt: now(),
    ...domainRecord,
  }

  domainRecords = [created, ...domainRecords]

  return created
}

export function getDomainRecord(domain) {
  return domainRecords.find((record) => record.domain === domain) ?? null
}

export function updateDomainRecord(domain, patch) {
  let updated = null

  domainRecords = domainRecords.map((record) => {
    if (record.domain !== domain) {
      return record
    }

    updated = {
      ...record,
      ...patch,
      lastCheckedAt: now(),
    }

    return updated
  })

  return updated
}

export function deleteDomainRecord(domain) {
  const existing = getDomainRecord(domain)

  if (!existing) {
    return null
  }

  domainRecords = domainRecords.filter((record) => record.domain !== domain)
  return existing
}

export function listAnalyticsGoals() {
  return [...analyticsGoals].sort((a, b) => a.name.localeCompare(b.name))
}

export function createAnalyticsGoal(input) {
  const goal = {
    id: `goal-${crypto.randomUUID()}`,
    name: input.name,
    scope: input.scope ?? 'site',
    siteSlug: input.siteSlug ?? 'all',
    eventName: input.eventName,
    targetValue: Number(input.targetValue) || 0,
    interval: input.interval ?? 'monthly',
    status: input.status ?? 'active',
    owner: input.owner ?? 'Platform Ops',
    notes: input.notes ?? '',
  }

  analyticsGoals = [goal, ...analyticsGoals]

  return goal
}

export function updateAnalyticsGoal(goalId, patch) {
  let updated

  analyticsGoals = analyticsGoals.map((goal) => {
    if (goal.id !== goalId) {
      return goal
    }

    updated = {
      ...goal,
      ...patch,
      targetValue: patch.targetValue === undefined ? goal.targetValue : Number(patch.targetValue) || 0,
    }

    return updated
  })

  return updated ?? null
}

export function getAnalyticsGoal(goalId) {
  return analyticsGoals.find((goal) => goal.id === goalId) ?? null
}

export function getAnalyticsOverview() {
  const providers = getAnalyticsProviders()

  return {
    connectedProviders: providers.filter((provider) => provider.connected).length,
    configuredGoals: analyticsGoals.filter((goal) => goal.status === 'active').length,
    liveReportingSources: providers.filter((provider) => provider.readAccess === 'available').length,
    providersNeedingAction: providers.filter((provider) => !provider.connected).length,
  }
}

export function getAnalyticsProviders() {
  const googleAnalytics = getGoogleAnalyticsConfig()
  const ga4ReportingReady = hasGoogleAnalyticsReportingConfig()

  return [
    {
      id: 'vercel-analytics',
      name: 'Vercel Web Analytics',
      connected: process.env.VERCEL === '1',
      status: process.env.VERCEL === '1' ? 'connected' : 'ready',
      description:
        'Installed in the root layout with @vercel/analytics. It records page analytics when the app runs on Vercel.',
      source: 'Runtime package',
      readAccess: 'unavailable',
      nextStep:
        'Use the Vercel dashboard for reporting. There is no general-purpose project analytics feed wired into this admin yet.',
    },
    {
      id: 'vercel-speed-insights',
      name: 'Vercel Speed Insights',
      connected: process.env.VERCEL === '1',
      status: process.env.VERCEL === '1' ? 'connected' : 'ready',
      description:
        'Installed in the root layout with @vercel/speed-insights for Core Web Vitals monitoring on deployment.',
      source: 'Runtime package',
      readAccess: 'unavailable',
      nextStep:
        'Use the Vercel dashboard for reporting. There is no direct admin ingestion path configured here.',
    },
    {
      id: 'ga4',
      name: 'Google Analytics 4',
      connected: Boolean(googleAnalytics.measurementId),
      status: googleAnalytics.measurementId ? 'configured' : 'not configured',
      description:
        'Optional secondary analytics provider for campaign attribution and custom event reporting.',
      source: googleAnalytics.measurementId
        ? `${googleAnalytics.measurementId}${googleAnalytics.propertyId ? ` · property ${googleAnalytics.propertyId}` : ''}`
        : 'Add NEXT_PUBLIC_GA_MEASUREMENT_ID',
      readAccess: ga4ReportingReady
        ? 'available'
        : googleAnalytics.measurementId
          ? 'credentials required'
          : 'not wired',
      nextStep: googleAnalytics.measurementId
        ? ga4ReportingReady
          ? 'GA4 reporting is available in the admin through the Google Analytics Data API.'
          : 'Add GOOGLE_ANALYTICS_PROPERTY_ID plus a service account credential to surface GA4 reporting in the admin.'
        : 'Configure NEXT_PUBLIC_GA_MEASUREMENT_ID to enable client-side GA4 instrumentation.',
    },
    {
      id: 'search-console',
      name: 'Google Search Console',
      connected: Boolean(process.env.GOOGLE_SITE_VERIFICATION),
      status: process.env.GOOGLE_SITE_VERIFICATION ? 'configured' : 'not configured',
      description: 'Recommended for indexing, query, and sitemap visibility across the domain portfolio.',
      source: process.env.GOOGLE_SITE_VERIFICATION || 'Add GOOGLE_SITE_VERIFICATION',
      readAccess: 'not wired',
      nextStep: process.env.GOOGLE_SITE_VERIFICATION
        ? 'Add a Search Console data integration if you want query and indexing data inside this admin.'
        : 'Set GOOGLE_SITE_VERIFICATION so the domains can be verified with Google.',
    },
  ]
}
