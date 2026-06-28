import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSource } from 'sanity'
import { usePresentationNavigate, usePresentationParams } from 'sanity/presentation'

import { apiVersion } from '../env'

function normalizeSites(data = []) {
  const seen = new Set()
  const uniqueSites = []

  for (const site of data) {
    const slug = site?.slug?.trim().toLowerCase()
    const primaryDomain = site?.primaryDomain?.trim().toLowerCase()
    const key = slug || primaryDomain || site?._id
    if (!key || seen.has(key)) {
      continue
    }
    seen.add(key)
    uniqueSites.push({
      ...site,
      primaryDomain,
      slug,
    })
  }

  return uniqueSites
}

/**
 * Custom Presentation navigator that lists all sites and lets you jump directly
 * to any site's homepage preview with a single click.
 *
 * Registered via `unstable_navigator` in sanity.config.js.
 */
export function SiteSwitcherNavigator() {
  const { getClient } = useSource()
  const client = getClient({ apiVersion, perspective: 'published', useCdn: false })
  const navigate = usePresentationNavigate()
  const params = usePresentationParams()
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)

  // Derive the active site from all preview URL shapes this app supports.
  const activeSiteSlug = useMemo(() => {
    const preview = params?.preview ?? ''
    const pathMatch = preview.match(/^\/(?:_site|preview)\/([^/?#]+)/)
    if (pathMatch) {
      return decodeURIComponent(pathMatch[1])
    }

    try {
      const url = new URL(preview, 'https://preview.local')
      return url.searchParams.get('__site')
    } catch {
      return null
    }
  }, [params?.preview])

  useEffect(() => {
    setLoading(true)
    client
      .fetch(
        `*[_type == "site" && !(_id in path("drafts.**"))] | order(name asc) {
          _id,
          "slug": slug.current,
          name,
          primaryDomain,
          category,
          tier
        }`,
      )
      .then((data) => {
        setSites(normalizeSites(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [client])

  const handleSiteClick = useCallback(
    (slug) => {
      if (!slug) {
        return
      }
      navigate(`/_site/${encodeURIComponent(slug)}/`)
    },
    [navigate],
  )

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '12px' }}>
      <div
        style={{
          color: 'var(--card-muted-fg-color)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          padding: '4px 8px 8px',
          textTransform: 'uppercase',
        }}
      >
        Sites
      </div>

      {loading ? (
        <div
          style={{
            color: 'var(--card-muted-fg-color)',
            fontSize: 13,
            padding: '16px',
            textAlign: 'center',
          }}
        >
          Loading…
        </div>
      ) : sites.length === 0 ? (
        <div style={{ color: 'var(--card-muted-fg-color)', fontSize: 13, padding: '12px 8px' }}>
          No sites found.
        </div>
      ) : (
        sites.map((site) => {
          const isActive = activeSiteSlug === site.slug
          return (
            <button
              key={site._id}
              onClick={() => handleSiteClick(site.slug)}
              style={{
                background: isActive ? 'var(--card-focus-ring-color, rgba(37,99,235,0.12))' : 'transparent',
                border: isActive
                  ? '1px solid var(--card-focus-ring-color, rgba(37,99,235,0.3))'
                  : '1px solid transparent',
                borderRadius: 6,
                color: 'inherit',
                cursor: 'pointer',
                display: 'block',
                marginBottom: 2,
                padding: '8px 10px',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{site.name}</div>
              {site.primaryDomain && (
                <div style={{ color: 'var(--card-muted-fg-color)', fontSize: 11, marginTop: 2 }}>
                  {site.primaryDomain}
                </div>
              )}
            </button>
          )
        })
      )}
    </div>
  )
}
