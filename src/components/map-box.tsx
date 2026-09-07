'use client'

import type { Feature, FeatureCollection, Geometry } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useMemo, useRef } from 'react'

import geoJson from './texasCounties.json'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceArea {
  countyKey: string
  displayName: string
}

export interface ServiceAreaMapProps {
  eyebrow?: string
  title?: string
  description?: string
  areas?: ServiceArea[]
  /** Resolved hex string from Sanity. Falls back to a safe orange constant. */
  accentColor?: string | null
  backgroundColor?: string | null
}

interface CountyMeta {
  fips: string
  key: string | null
  name: string
  city: string | null
}

// ─── Lookup tables built from texasCounties.json ──────────────────────────────

const KEY_TO_FIPS = new Map<string, string>()
const FIPS_TO_META = new Map<string, CountyMeta>()

;(geoJson.counties as CountyMeta[]).forEach((c) => {
  FIPS_TO_META.set(c.fips, c)
  if (c.key) {
    KEY_TO_FIPS.set(c.key, c.fips)
  }
})

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTIES_URL = '/api/counties/texas'
const MAP_STYLE = 'mapbox://styles/dallasbpeters/cmp0acmnj001201rw4xsrco80'

// Mapbox only accepts sRGB colors in paint properties — no lab/oklch/CSS vars.
const FALLBACK_ACCENT = '#2d6a4f'

const DEFAULT_EYEBROW = 'Service Area'
const DEFAULT_TITLE = 'Where We Work'
const DEFAULT_DESCRIPTION =
  'Serving homeowners across Central Texas — from the Austin metro and San Antonio to the Hill Country.'

// Texas center and a zoom that fits the whole state comfortably
const TX_CENTER: [number, number] = [-99.5, 31]
const TX_ZOOM = 5.2

// Tight Texas bounds used for fitBounds when no counties are configured
const TX_BOUNDS = new mapboxgl.LngLatBounds([-106.65, 25.84], [-93.51, 36.5])

const CENTER_OFFSET_PADDING = { top: 48, bottom: 48, left: 48, right: 48 }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function boundsFromFeatures(features: Feature[]): mapboxgl.LngLatBounds | null {
  if (!features.length) {
    return null
  }
  const bounds = new mapboxgl.LngLatBounds()
  features.forEach((f) => {
    extractCoords(f.geometry as Geometry).forEach(([lng, lat]) => bounds.extend([lng, lat]))
  })
  return bounds
}

function extractCoords(geometry: Geometry): [number, number][] {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates[0] as [number, number][]
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((p) => p[0]) as [number, number][]
  }
  return []
}

function buildFilter(fipsList: string[]): mapboxgl.FilterSpecification {
  if (fipsList.length === 0) {
    return ['==', ['literal', false], true] as unknown as mapboxgl.FilterSpecification
  }
  return ['in', ['get', 'fips'], ['literal', fipsList]] as unknown as mapboxgl.FilterSpecification
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MapBox = ({
  eyebrow = DEFAULT_EYEBROW,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  areas = [],
  accentColor = null,
}: ServiceAreaMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const txFeaturesRef = useRef<Feature[]>([])

  // Keep a ref so the map.on('load') closure always sees the latest FIPS list
  // even if areas arrive after mount but before the style finishes loading.
  const configuredFipsRef = useRef<string[]>([])

  const configuredFips = useMemo(() => {
    const list: string[] = []
    areas.forEach((a) => {
      const fips = a?.countyKey ? KEY_TO_FIPS.get(a.countyKey) : undefined
      if (fips) {
        list.push(fips)
      }
    })
    return list
  }, [areas])

  // Keep the ref in sync
  useEffect(() => {
    configuredFipsRef.current = configuredFips
  }, [configuredFips])

  const fipsToArea = useMemo(() => {
    const m = new Map<string, ServiceArea>()
    areas.forEach((a) => {
      const fips = a?.countyKey ? KEY_TO_FIPS.get(a.countyKey) : undefined
      if (fips) {
        m.set(fips, a)
      }
    })
    return m
  }, [areas])

  // ── Map initialisation (mount only) ─────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) {
      console.warn('[MapBox] NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set.')
      return
    }

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container,
      style: MAP_STYLE,
      center: TX_CENTER,
      zoom: TX_ZOOM,
      attributionControl: false,
      scrollZoom: false,
    })

    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })

    // This is a flat choropleth, so terrain is pure overhead — turn it off.
    //
    // Note: the console message `Couldn't find terrain source "mapbox-dem"` is a
    // non-fatal mapbox-gl *warning* and is NOT caused by a missing source. The style
    // does define `mapbox-dem`, but it also imports mapbox://styles/mapbox/standard,
    // and GL v3 resolves terrain sources per import scope — a root-level `terrain`
    // block gets looked up in the basemap scope, misses, and warns. Rendering is
    // unaffected. To silence it for good, delete the terrain block from the style in
    // Mapbox Studio; then this handler can go away too.
    map.once('style.load', () => {
      try {
        map.setTerrain(null)
      } catch {}
    })

    map.on('load', async () => {
      try {
        const res = await fetch(COUNTIES_URL)
        if (!res.ok) {
          throw new Error(`/api/counties/texas returned ${res.status}`)
        }
        const txGeoJSON = (await res.json()) as FeatureCollection
        const txFeatures = txGeoJSON.features

        // Use the ref so we always have the latest county list here, even if
        // areas arrived after mount but before the style finished loading.
        const fips = configuredFipsRef.current
        const accent = accentColor || FALLBACK_ACCENT

        map.addSource('tx-counties', { type: 'geojson', data: txGeoJSON })

        // All county outlines — geographic context
        map.addLayer({
          id: 'counties-line',
          type: 'line',
          source: 'tx-counties',
          paint: { 'line-color': 'rgba(0,0,0,0.15)', 'line-width': 0.6 },
        })

        // Configured county fills
        map.addLayer({
          id: 'counties-fill',
          type: 'fill',
          source: 'tx-counties',
          filter: buildFilter(fips),
          paint: { 'fill-color': accent, 'fill-opacity': 0.55 },
        })

        // Configured county borders
        map.addLayer({
          id: 'counties-line-active',
          type: 'line',
          source: 'tx-counties',
          filter: buildFilter(fips),
          paint: { 'line-color': accent, 'line-width': 2, 'line-opacity': 1 },
        })

        txFeaturesRef.current = txFeatures

        // Fit to configured counties; fall back to full Texas view
        if (fips.length > 0) {
          const active = txFeatures.filter((f) => fips.includes(String(f.id)))
          const bounds = boundsFromFeatures(active)
          if (bounds) {
            map.fitBounds(bounds, { padding: CENTER_OFFSET_PADDING, maxZoom: 9, duration: 0 })
          }
        } else {
          map.fitBounds(TX_BOUNDS, { padding: CENTER_OFFSET_PADDING, duration: 0 })
        }

        // Tooltip
        map.on('mouseenter', 'counties-fill', (e) => {
          map.getCanvas().style.cursor = 'pointer'
          if (!e.features?.length) {
            return
          }
          const f = (e.features[0] as unknown as Feature).properties?.fips as string
          const area = fipsToArea.get(f)
          const meta = FIPS_TO_META.get(f)
          const name = area?.displayName ?? meta?.city ?? meta?.name ?? 'County'
          popup.setLngLat(e.lngLat).setHTML(`<strong style="font-size:0.8125rem">${name}</strong>`).addTo(map)
        })
        map.on('mousemove', 'counties-fill', (e) => popup.setLngLat(e.lngLat))
        map.on('mouseleave', 'counties-fill', () => {
          map.getCanvas().style.cursor = ''
          popup.remove()
        })
      } catch (error) {
        console.error('[MapBox] Failed to load counties GeoJSON:', error)
      }
    })

    return () => {
      txFeaturesRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ── Live updates when areas change (Sanity preview) ──────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map?.getLayer('counties-fill')) {
      return
    }

    map.setFilter('counties-fill', buildFilter(configuredFips))
    map.setFilter('counties-line-active', buildFilter(configuredFips))

    if (configuredFips.length > 0) {
      const active = txFeaturesRef.current.filter((f) => configuredFips.includes(String(f.id)))
      const bounds = boundsFromFeatures(active)
      if (bounds) {
        map.fitBounds(bounds, { padding: CENTER_OFFSET_PADDING, maxZoom: 9, duration: 600 })
      }
    } else {
      map.fitBounds(TX_BOUNDS, { padding: CENTER_OFFSET_PADDING, duration: 600 })
    }
  }, [configuredFips])

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <section id="service-area" className="bg-primary scroll-m-16 overflow-hidden">
      <div
        className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-[.9fr_1.1fr]"
        style={{ minHeight: '480px' }}
      >
        {/* Left: content panel */}
        <div
          className="flex flex-col justify-center px-10 py-14 lg:py-16"
          style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          {eyebrow && (
            <p
              className="mb-4 text-xs font-bold tracking-[0.22em] uppercase"
              style={{ color: 'rgba(255,255,255,0.62)' }}
            >
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mb-4 font-serif text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-bold text-white">
              {title}
            </h2>
          )}
          {description && (
            <p className="mb-8 text-[0.9375rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {description}
            </p>
          )}
          {areas.length > 0 && (
            <>
              <p
                className="mb-2.5 text-[0.65rem] font-bold tracking-[0.18em] uppercase"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Service counties
              </p>
              <div className="flex flex-wrap gap-1.5">
                {areas.map((area) => (
                  <span
                    key={area.countyKey}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      color: 'rgba(255,255,255,0.80)',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--color-tertiary)' }}
                    />
                    {area.displayName}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: map */}
        <div
          ref={containerRef}
          className="h-80 lg:h-auto"
          role="application"
          aria-label={
            areas.length > 0
              ? `Interactive map of ${areas.length} service ${areas.length === 1 ? 'county' : 'counties'} in Texas`
              : 'Interactive service area map of Texas'
          }
        />
      </div>
    </section>
  )
}

export default MapBox
