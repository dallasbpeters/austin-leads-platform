import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSource } from 'sanity'
import { usePresentationNavigate, usePresentationParams } from 'sanity/presentation'

import { apiVersion } from '../env'

/**
 * Custom Presentation navigator that lists all sites and lets you jump directly
 * to any site's homepage preview with a single click.
 *
 * Registered via `unstable_navigator` in sanity.config.js.
 */
export function SiteSwitcherNavigator() {
  const { getClient } = useSource()
  const client = getClient({ apiVersion })
  const navigate = usePresentationNavigate()
  const params = usePresentationParams()
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)

  // Derive the currently active site slug from /_site/{slug}/... preview path
  const activeSiteSlug = useMemo(() => {
    const preview = params?.preview ?? ''
    const match = preview.match(/^\/_site\/([^/?#]+)/)
    return match ? match[1] : null
  }, [params?.preview])

  useEffect(() => {
    setLoading(true)
    client
      .fetch(
        `*[_type == "site"] | order(name asc) {
          "slug": slug.current,
          name,
          primaryDomain,
          category,
          tier
        }`,
      )
      .then((data) => {
        setSites(data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [client])

  const handleSiteClick = useCallback(
    (slug) => {
      navigate(`/_site/${encodeURIComponent(slug)}/`)
    },
    [navigate],
  )

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '12px' }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--card-muted-fg-color)',
          padding: '4px 8px 8px',
        }}
      >
        Sites
      </div>

      {loading ? (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            color: 'var(--card-muted-fg-color)',
            fontSize: 13,
          }}
        >
          Loading…
        </div>
      ) : sites.length === 0 ? (
        <div style={{ padding: '12px 8px', color: 'var(--card-muted-fg-color)', fontSize: 13 }}>
          No sites found.
        </div>
      ) : (
        sites.map((site) => {
          const isActive = activeSiteSlug === site.slug
          return (
            <button
              key={site.slug}
              onClick={() => handleSiteClick(site.slug)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 10px',
                marginBottom: 2,
                textAlign: 'left',
                background: isActive ? 'var(--card-focus-ring-color, rgba(37,99,235,0.12))' : 'transparent',
                border: isActive
                  ? '1px solid var(--card-focus-ring-color, rgba(37,99,235,0.3))'
                  : '1px solid transparent',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{site.name}</div>
              {site.primaryDomain && (
                <div style={{ fontSize: 11, color: 'var(--card-muted-fg-color)', marginTop: 2 }}>
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
