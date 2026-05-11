'use client'

import React, { CSSProperties, useEffect, useMemo, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import geoJson from './texasCounties.json'

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceArea = {
  countyKey: string
  displayName: string
}

export type ServiceAreaMapProps = {
  eyebrow?: string
  title?: string
  description?: string
  areas?: ServiceArea[]
  /** Resolved hex string from Sanity. Falls back to a safe orange constant. */
  accentColor?: string | null
  backgroundColor?: string | null
}

type CountyMeta = {
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
  if (c.key) KEY_TO_FIPS.set(c.key, c.fips)
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
const TX_CENTER: [number, number] = [-99.5, 31.0]
const TX_ZOOM = 5.2

// Tight Texas bounds used for fitBounds when no counties are configured
const TX_BOUNDS = new mapboxgl.LngLatBounds([-106.65, 25.84], [-93.51, 36.5])

// Shift the logical map center to 60% from the left so the overlay panel on
// the left doesn't obscure the active counties.
// left padding > right padding pushes the focal point rightward.
const CENTER_OFFSET_PADDING = { top: 40, bottom: 40, left: 420, right: 80 }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function boundsFromFeatures(features: GeoJSON.Feature[]): mapboxgl.LngLatBounds | null {
  if (!features.length) return null
  const bounds = new mapboxgl.LngLatBounds()
  features.forEach((f) => {
    extractCoords(f.geometry as GeoJSON.Geometry).forEach(([lng, lat]) =>
      bounds.extend([lng, lat]),
    )
  })
  return bounds
}

function extractCoords(geometry: GeoJSON.Geometry): [number, number][] {
  if (geometry.type === 'Polygon') return geometry.coordinates[0] as [number, number][]
  if (geometry.type === 'MultiPolygon')
    return geometry.coordinates.flatMap((p) => p[0]) as [number, number][]
  return []
}

function buildFilter(fipsList: string[]): mapboxgl.FilterSpecification {
  if (fipsList.length === 0) return ['==', ['literal', false], true] as unknown as mapboxgl.FilterSpecification
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
  const txFeaturesRef = useRef<GeoJSON.Feature[]>([])

  // Keep a ref so the map.on('load') closure always sees the latest FIPS list
  // even if areas arrive after mount but before the style finishes loading.
  const configuredFipsRef = useRef<string[]>([])

  const configuredFips = useMemo(() => {
    const list: string[] = []
    areas.forEach((a) => {
      const fips = a?.countyKey ? KEY_TO_FIPS.get(a.countyKey) : undefined
      if (fips) list.push(fips)
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
      if (fips) m.set(fips, a)
    })
    return m
  }, [areas])

  // ── Map initialisation (mount only) ─────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

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

    // Studio styles often enable terrain with source id `mapbox-dem` but omit the
    // raster-dem definition — Mapbox then warns and terrain cutoff fails. Add the
    // canonical DEM before the first paint, or drop terrain for a flat choropleth map.
    map.once('style.load', () => {
      try {
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v2',
            tileSize: 512,
            maxzoom: 14,
          })
        }
      } catch {
        map.setTerrain(null)
      }
    })

    map.on('load', async () => {
      try {
        const res = await fetch(COUNTIES_URL)
        if (!res.ok) throw new Error(`/api/counties/texas returned ${res.status}`)
        const txGeoJSON = (await res.json()) as GeoJSON.FeatureCollection
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
          if (bounds) map.fitBounds(bounds, { padding: CENTER_OFFSET_PADDING, maxZoom: 9, duration: 0 })
        } else {
          map.fitBounds(TX_BOUNDS, { padding: CENTER_OFFSET_PADDING, duration: 0 })
        }

        // Tooltip
        map.on('mouseenter', 'counties-fill', (e) => {
          map.getCanvas().style.cursor = 'pointer'
          if (!e.features?.length) return
          const f = e.features[0].properties?.fips as string
          const area = fipsToArea.get(f)
          const meta = FIPS_TO_META.get(f)
          const name = area?.displayName ?? meta?.city ?? meta?.name ?? 'County'
          popup
            .setLngLat(e.lngLat)
            .setHTML(`<strong style="font-size:0.8125rem">${name}</strong>`)
            .addTo(map)
        })
        map.on('mousemove', 'counties-fill', (e) => popup.setLngLat(e.lngLat))
        map.on('mouseleave', 'counties-fill', () => {
          map.getCanvas().style.cursor = ''
          popup.remove()
        })
      } catch (err) {
        console.error('[MapBox] Failed to load counties GeoJSON:', err)
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
    if (!map?.getLayer('counties-fill')) return

    map.setFilter('counties-fill', buildFilter(configuredFips))
    map.setFilter('counties-line-active', buildFilter(configuredFips))

    if (configuredFips.length > 0) {
      const active = txFeaturesRef.current.filter((f) => configuredFips.includes(String(f.id)))
      const bounds = boundsFromFeatures(active)
      if (bounds) map.fitBounds(bounds, { padding: CENTER_OFFSET_PADDING, maxZoom: 9, duration: 600 })
    } else {
      map.fitBounds(TX_BOUNDS, { padding: CENTER_OFFSET_PADDING, duration: 600 })
    }
  }, [configuredFips])

  // ── Render ───────────────────────────────────────────────────────────────────
  const sectionStyle: CSSProperties = { position: 'relative' }

  return (
    <section id="service-area" className="relative overflow-hidden scroll-m-16" style={sectionStyle}>
      <div className="relative">
        <header className="absolute top-5 left-5 z-10 max-w-xl rounded-lg border border-border bg-white/70 p-6 backdrop-blur-sm">
          {eyebrow && (
            <p className="type-accent mb-3 text-[0.6875rem] font-extrabold tracking-[0.16em] uppercase opacity-75">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="type-display mb-4 text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-bold">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm leading-relaxed">{description}</p>
          )}
        </header>

        <div
          ref={containerRef}
          className="h-[520px] w-full"
          role="img"
          aria-label={
            areas.length > 0
              ? `Map of ${areas.length} service ${areas.length === 1 ? 'county' : 'counties'} in Texas`
              : 'Service area map of Texas'
          }
        />
      </div>
    </section>
  )
}

export default MapBox
