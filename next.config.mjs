import withVercelToolbar from '@vercel/toolbar/plugins/next'

const PROJECT_ROOT = import.meta.dirname

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xuhfhjna'
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21'

function withPathWildcard(destination) {
  if (!destination) {
    return destination
  }
  if (destination.includes(':path*')) {
    return destination
  }
  const normalized = destination.endsWith('/') ? destination.slice(0, -1) : destination
  return `${normalized}/:path*`
}

function asExactHostPattern(host) {
  const escaped = String(host).replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return `^${escaped}$`
}

async function getSanityRedirects() {
  const query = `*[_type == "redirectRule"]{
    "source": coalesce(source, domain),
    "destination": coalesce(destination, target),
    permanent,
    statusCode
  }`
  const url = new URL(
    `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}`,
  )
  url.searchParams.set('query', query)

  const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!response.ok) {
    return []
  }

  const payload = await response.json()
  const rules = Array.isArray(payload?.result) ? payload.result : []

  return rules
    .filter((rule) => rule?.source && rule?.destination)
    .map((rule) => {
      const statusCode = Number(rule.statusCode)
      const permanent =
        typeof rule.permanent === 'boolean' ? rule.permanent : statusCode === 301 || statusCode === 308

      return {
        source: '/:path*',
        has: [{ type: 'host', value: asExactHostPattern(rule.source) }],
        destination: withPathWildcard(rule.destination),
        permanent,
      }
    })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: PROJECT_ROOT,
  turbopack: {
    root: PROJECT_ROOT,
  },
  experimental: {
    viewTransition: true,
  },
  transpilePackages: ['sanity', 'next-sanity', '@sanity/ui', '@sanity/icons'],
  images: {
    qualities: [100, 90, 82, 75, 70, 68],
    // Ensure repeat visits reuse optimized images (improves Lighthouse cache TTL scoring).
    // 30 days is a good balance between freshness and performance.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'photos.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'hoirqrkdgbmvpwutwuwj.supabase.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'unicorn.studio',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'assets.unicorn.studio',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.nabcep.org',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'grainygradients.vercel.app',
        port: '',
      },
    ],
  },
  async rewrites() {
    return [
      // Rewrite /_site/:site and /_site/:site/:path* to /?__site=:site so the
      // multi-tenant renderer can resolve the correct site. Sanity Presentation
      // encodes the active site slug in the URL path so its document resolver
      // can read it as a route param before query strings are stripped.
      {
        source: '/_site/:site',
        destination: '/?__site=:site',
      },
      {
        source: '/_site/:site/:path*',
        destination: '/:path*?__site=:site',
      },
      // Proxy PostHog static assets (recorder, surveys, etc.) through the app domain
      // so content blockers can't identify and block the analytics scripts.
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      // Proxy PostHog event ingestion through the app domain.
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  async redirects() {
    try {
      return await getSanityRedirects()
    } catch {
      return []
    }
  },
}

const withToolbar = withVercelToolbar({
  enableInProduction: true,
})

export default withToolbar(nextConfig)
