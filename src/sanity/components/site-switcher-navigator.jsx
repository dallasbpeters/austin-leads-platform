import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSource } from 'sanity'
import { usePresentationNavigate, usePresentationParams } from 'sanity/presentation'
import { useRouter } from 'sanity/router'

import { apiVersion } from '../env'

function normalizeDomain(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

function normalizeSites(data = []) {
  const seen = new Set()
  const uniqueSites = []

  for (const site of data) {
    const slug = site?.slug?.trim()
    const primaryDomain = site?.primaryDomain?.trim()
    const keys = [
      slug?.toLowerCase(),
      normalizeDomain(primaryDomain),
      ...(Array.isArray(site?.aliases) ? site.aliases.map(normalizeDomain) : []),
      site?._id,
    ].filter(Boolean)

    if (keys.length === 0 || keys.some((key) => seen.has(key))) {
      continue
    }

    for (const key of keys) {
      seen.add(key)
    }

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
  const client = useMemo(
    () => getClient({ apiVersion, perspective: 'published', useCdn: false }),
    [getClient],
  )
  const navigate = usePresentationNavigate()
  const router = useRouter()
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
    let cancelled = false
    setLoading(true)
    client
      .fetch(
        `*[_type == "site" && !(_id in path("drafts.**"))] | order(name asc) {
          _id,
          "slug": slug.current,
          name,
          primaryDomain,
          aliases,
          category,
          tier
        }`,
      )
      .then((data) => {
        if (cancelled) {
          return
        }
        setSites(normalizeSites(data))
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
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

  /*
   * Presentation cannot create documents on its own — its document pane only opens
   * things already referenced by the page being previewed. A create intent is the
   * supported way in, and the `caseStudy-by-site` template (see sanity.config.js)
   * pre-fills the site so a new project cannot end up filed under the wrong tenant.
   */
  const handleNewCaseStudy = useCallback(
    (siteId) => {
      if (!siteId) {
        return
      }
      router.navigateIntent('create', {
        type: 'caseStudy',
        template: 'caseStudy-by-site',
        siteId,
      })
    },
    [router],
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
            <div key={site._id} style={{ marginBottom: 6 }}>
              <button
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
              <button
                onClick={() => handleNewCaseStudy(site._id)}
                title={`Create a case study already assigned to ${site.name}`}
                style={{
                  background: 'transparent',
                  border: '1px dashed var(--card-border-color, rgba(255,255,255,0.2))',
                  borderRadius: 6,
                  color: 'var(--card-muted-fg-color)',
                  cursor: 'pointer',
                  display: 'block',
                  fontSize: 11,
                  marginTop: 4,
                  padding: '5px 10px',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                + New case study
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}
