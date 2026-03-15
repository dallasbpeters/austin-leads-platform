import { NextResponse } from 'next/server'

const PAGESPEED_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY || ''
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function normalizeUrl(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  if (/^https?:\/\//i.test(raw)) return raw

  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(raw)) {
    return `http://${raw}`
  }

  return `https://${raw}`
}

function isLocalOrPrivateHostname(url) {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname === 'localhost' || hostname === '0.0.0.0') return true
    if (hostname === '127.0.0.1') return true
    if (hostname.endsWith('.local')) return true
    if (hostname.startsWith('10.')) return true
    if (hostname.startsWith('192.168.')) return true
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true

    return false
  } catch {
    return false
  }
}

function toPercent(score) {
  if (typeof score !== 'number') return null
  return Math.round(score * 100)
}

function pickAudit(result, key) {
  const audit = result?.audits?.[key]
  if (!audit) return null

  return {
    id: key,
    title: audit.title || key,
    score: toPercent(audit.score),
    displayValue: audit.displayValue || null,
    description: audit.description || null,
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const strategy = body?.strategy === 'desktop' ? 'desktop' : 'mobile'
    const url = normalizeUrl(body?.url)

    if (!url) {
      return NextResponse.json({ error: 'A valid URL is required.' }, { status: 400, headers: CORS_HEADERS })
    }

    if (isLocalOrPrivateHostname(url)) {
      return NextResponse.json(
        {
          error: 'Google PageSpeed cannot audit localhost/private URLs.',
          details:
            'Use a public URL (production/preview) or expose localhost through a public tunnel, then run the audit again.',
        },
        { status: 400, headers: CORS_HEADERS },
      )
    }

    const apiUrl = new URL(PAGESPEED_ENDPOINT)
    apiUrl.searchParams.set('url', url)
    apiUrl.searchParams.set('strategy', strategy)
    apiUrl.searchParams.append('category', 'performance')
    apiUrl.searchParams.append('category', 'seo')
    apiUrl.searchParams.append('category', 'best-practices')
    apiUrl.searchParams.append('category', 'accessibility')

    if (PAGESPEED_API_KEY) {
      apiUrl.searchParams.set('key', PAGESPEED_API_KEY)
    }

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        {
          error: `PageSpeed request failed (${response.status}).`,
          details: text?.slice(0, 400) || null,
        },
        { status: 502, headers: CORS_HEADERS },
      )
    }

    const data = await response.json()
    const lighthouseResult = data?.lighthouseResult || {}
    const categories = lighthouseResult?.categories || {}

    return NextResponse.json(
      {
        input: {
          url,
          strategy,
        },
        fetchedAt: new Date().toISOString(),
        categories: {
          performance: toPercent(categories.performance?.score),
          accessibility: toPercent(categories.accessibility?.score),
          bestPractices: toPercent(categories['best-practices']?.score),
          seo: toPercent(categories.seo?.score),
        },
        coreWebVitals: {
          lcp: pickAudit(lighthouseResult, 'largest-contentful-paint'),
          cls: pickAudit(lighthouseResult, 'cumulative-layout-shift'),
          tbt: pickAudit(lighthouseResult, 'total-blocking-time'),
          speedIndex: pickAudit(lighthouseResult, 'speed-index'),
        },
        loadingExperience: data?.loadingExperience || null,
        originLoadingExperience: data?.originLoadingExperience || null,
        screenshot: lighthouseResult?.fullPageScreenshot?.screenshot?.data || null,
      },
      { headers: CORS_HEADERS },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to run PageSpeed audit.',
      },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}
