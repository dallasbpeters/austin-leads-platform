import { headers } from 'next/headers'

import { getPrimaryUrl, resolveSiteByHost } from '@/lib/platform/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const site = await resolveSiteByHost(host)
  const normalizedHost = (host || '').toLowerCase()
  const isIndexableHost =
    normalizedHost === site.primaryDomain ||
    site.aliases?.includes(normalizedHost) ||
    normalizedHost === `www.${site.primaryDomain}`

  const body = isIndexableHost
    ? `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /studio/\nDisallow: /style-guide\nDisallow: /style-guide/\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nDisallow: /\n\nSitemap: ${getPrimaryUrl(site, '/sitemap.xml')}\n`
    : `User-agent: *\nDisallow: /\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
