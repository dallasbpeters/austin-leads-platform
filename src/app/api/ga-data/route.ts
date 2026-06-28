import { BetaAnalyticsDataClient } from '@google-analytics/data'

import { getGoogleAnalyticsConfig } from '@/lib/analytics/google'

export const runtime = 'nodejs'

const allowedOrigins = new Set([
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://austin-leads-platform.sanity.studio',
  process.env.NEXT_PUBLIC_LOCAL_SANITY_STUDIO_URL || 'http://localhost:3334',
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN || '',
  process.env.NEXT_PUBLIC_LOCAL_SITE_URL || 'http://localhost:3000',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://texassolarandroofingpros.com',
])

function resolveAnalyticsConfig() {
  const config = getGoogleAnalyticsConfig()
  const clientEmail = String(config.credentials?.client_email || '').trim()
  const privateKey = String(config.credentials?.private_key || '')

  return {
    clientEmail,
    privateKey,
    propertyId: config.propertyId,
  }
}

function getCorsOrigin(request: Request) {
  const origin = request.headers.get('origin') || ''
  if (origin && allowedOrigins.has(origin)) return origin
  return process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://austin-leads-platform.sanity.studio'
}

function withCors(response: Response, request: Request) {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', getCorsOrigin(request))
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Vary', 'Origin')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function createAnalyticsClient(config: ReturnType<typeof resolveAnalyticsConfig>) {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
  })
}

async function runReport(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  request: Record<string, unknown>,
) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    ...request,
  })
  return response
}

async function runRealtimeReport(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  request: Record<string, unknown>,
) {
  const [response] = await client.runRealtimeReport({
    property: `properties/${propertyId}`,
    ...request,
  })
  return response
}

export function OPTIONS(request: Request) {
  return withCors(new Response(null, { status: 204 }), request)
}

export async function GET(request: Request) {
  const config = resolveAnalyticsConfig()

  if (!config.propertyId) {
    return withCors(Response.json({ error: 'GA_PROPERTY_ID not configured' }, { status: 500 }), request)
  }

  if (!config.clientEmail || !config.privateKey) {
    return withCors(
      Response.json(
        { error: 'Missing GA service-account credentials for analytics dashboard.' },
        { status: 500 },
      ),
      request,
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('range') || '30'
    const startDate = `${dateRange}daysAgo`
    const client = createAnalyticsClient(config)

    const settled = await Promise.allSettled([
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'engagedSessions' },
          { name: 'engagementRate' },
          { name: 'screenPageViewsPerSession' },
          { name: 'eventsPerSession' },
        ],
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        dimensions: [{ name: 'hour' }],
        metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'hour' }, desc: false }],
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }, { name: 'averageSessionDuration' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 15,
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'landingPage' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'bounceRate' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'browser' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'operatingSystem' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
        limit: 10,
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'city' }, { name: 'country' }],
        metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
        limit: 10,
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagementRate' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'newVsReturning' }],
        metrics: [{ name: 'totalUsers' }],
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 15,
      }),
      runReport(client, config.propertyId, {
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'pageReferrer' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      runRealtimeReport(client, config.propertyId, {
        metrics: [{ name: 'activeUsers' }],
      }),
    ])

    const failures = settled
      .map((result, index) =>
        result.status === 'rejected'
          ? {
              index,
              reason: result.reason instanceof Error ? result.reason.message : String(result.reason),
            }
          : null,
      )
      .filter(Boolean)

    if (failures.length === settled.length) {
      return withCors(
        Response.json(
          {
            error: `Google Analytics reporting failed for every dashboard query. ${failures
              .map((failure) => `[${failure?.index}] ${failure?.reason}`)
              .join(' ')}`,
          },
          { status: 500 },
        ),
        request,
      )
    }

    const ok = (index: number) => {
      const result = settled[index]
      return result && result.status === 'fulfilled' ? result.value : {}
    }

    return withCors(
      Response.json(
        {
          activeUsers: ok(15),
          overview: ok(0),
          timeSeries: ok(1),
          hourlyToday: ok(2),
          topPages: ok(3),
          landingPages: ok(4),
          devices: ok(5),
          browsers: ok(6),
          operatingSystems: ok(7),
          countries: ok(8),
          cities: ok(9),
          trafficSources: ok(10),
          channels: ok(11),
          newVsReturning: ok(12),
          topEvents: ok(13),
          referrers: ok(14),
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
          },
        },
      ),
      request,
    )
  } catch (error) {
    return withCors(
      Response.json(
        {
          error: error instanceof Error ? error.message : 'Failed to load Google Analytics dashboard data.',
        },
        { status: 500 },
      ),
      request,
    )
  }
}
