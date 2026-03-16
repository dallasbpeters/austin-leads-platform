import withVercelToolbar from '@vercel/toolbar/plugins/next'

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xuhfhjna'
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21'

function withPathWildcard(destination) {
  if (!destination) return destination
  if (destination.includes(':path*')) return destination
  const normalized = destination.endsWith('/') ? destination.slice(0, -1) : destination
  return `${normalized}/:path*`
}

function asExactHostPattern(host) {
  const escaped = String(host).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
  transpilePackages: ['sanity', 'next-sanity', '@sanity/ui', '@sanity/icons'],
  images: {
    qualities: [100, 82, 75, 70, 68],
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
  experimental: {
    viewTransition: true,
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
