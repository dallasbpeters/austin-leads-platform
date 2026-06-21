import { GET as getGoogleAnalyticsDashboardData } from 'sanity-plugin-ga-dashboard/api'

export const runtime = 'nodejs'

const allowedOrigins = new Set([
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://austin-leads-platform.sanity.studio',
  process.env.NEXT_PUBLIC_LOCAL_SANITY_STUDIO_URL || 'http://localhost:3334',
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN || '',
  process.env.NEXT_PUBLIC_LOCAL_SITE_URL || 'http://localhost:3000',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://texassolarandroofingpros.com',
])

function normalizePrivateKey(privateKey: string) {
  return privateKey.replace(/\\n/g, '\n')
}

function resolveServiceAccountFromJson() {
  const raw = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as { client_email?: string; private_key?: string }
    if (!parsed.client_email || !parsed.private_key) return null
    return {
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    }
  } catch {
    return null
  }
}

function applyGoogleAnalyticsEnvAliases() {
  process.env.GA_PROPERTY_ID ||= process.env.GOOGLE_ANALYTICS_PROPERTY_ID

  const serviceAccount = resolveServiceAccountFromJson()
  process.env.GA_SERVICE_ACCOUNT_EMAIL ||=
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL || serviceAccount?.clientEmail
  process.env.GA_PRIVATE_KEY ||= process.env.GOOGLE_ANALYTICS_PRIVATE_KEY || serviceAccount?.privateKey
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

export function OPTIONS(request: Request) {
  return withCors(new Response(null, { status: 204 }), request)
}

export async function GET(request: Request) {
  applyGoogleAnalyticsEnvAliases()
  const response = await getGoogleAnalyticsDashboardData(request)

  return withCors(response, request)
}
