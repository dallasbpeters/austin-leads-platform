/**
 * Solar panel size presets and GeoJSON helpers for the quote layout map.
 * Dimensions are approximate module footprints in meters (portrait = short side × long side).
 */

export const PANEL_SIZES = {
  '60-portrait': { label: '60-cell · portrait', widthM: 1, heightM: 1.68 },
  '60-landscape': { label: '60-cell · landscape', widthM: 1.68, heightM: 1 },
  '72-portrait': { label: '72-cell · portrait', widthM: 1.05, heightM: 2.1 },
  '72-landscape': { label: '72-cell · landscape', widthM: 2.1, heightM: 1.05 },
  commercial: { label: 'Commercial', widthM: 1.3, heightM: 2.4 },
}

export const PANEL_SIZE_KEYS = Object.keys(PANEL_SIZES)

export const ROTATION_PRESETS = [0, 15, 30, 45, 90, 135, 180, 270]

/** Top-down module photo used as the Mapbox symbol icon (portrait 500×800). */
export const PANEL_ICON_URL = '/images/quote-assets/solar-panel.png'
export const PANEL_ICON_ID = 'quote-solar-panel'
export const PANEL_ICON_HEIGHT_PX = 800

const METERS_PER_DEG_LAT = 111_320

const toRad = (deg) => (deg * Math.PI) / 180

/** Offset a lng/lat point by east/north meters. */
export function offsetLngLat(lng, lat, eastM, northM) {
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos(toRad(lat))
  return [lng + eastM / metersPerDegLng, lat + northM / METERS_PER_DEG_LAT]
}

/**
 * Build a closed ring of [lng, lat] corners for a panel centered at lng/lat.
 * Rotation is clockwise degrees from north (map-friendly).
 */
export function panelCornerRing(lng, lat, widthM, heightM, rotationDeg = 0) {
  const halfW = widthM / 2
  const halfH = heightM / 2
  const local = [
    [-halfW, -halfH],
    [halfW, -halfH],
    [halfW, halfH],
    [-halfW, halfH],
  ]
  const rad = toRad(rotationDeg)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const ring = local.map(([x, y]) => {
    const east = x * cos - y * sin
    const north = x * sin + y * cos
    return offsetLngLat(lng, lat, east, north)
  })
  ring.push(ring[0])
  return ring
}

/** Web Mercator meters-per-pixel at lat/zoom (Mapbox GL). */
export function metersPerPixel(lat, zoom) {
  return (156_543.033_92 * Math.cos(toRad(lat))) / 2 ** zoom
}

export const PANEL_SCALE_MIN = 0.4
export const PANEL_SCALE_MAX = 5
export const PANEL_SCALE_DEFAULT = 1.6

export function clampPanelScale(scale) {
  const num = Number(scale)
  if (!Number.isFinite(num)) {
    return PANEL_SCALE_DEFAULT
  }
  return Math.min(PANEL_SCALE_MAX, Math.max(PANEL_SCALE_MIN, num))
}

export function panelSizeMeta(sizeKey, scale = 1) {
  const size = PANEL_SIZES[sizeKey] || PANEL_SIZES['72-portrait']
  const factor = clampPanelScale(scale)
  const widthM = size.widthM * factor
  const heightM = size.heightM * factor
  const landscape = widthM > heightM
  return { widthM, heightM, landscape, scale: factor }
}

/** Icon long-axis meters + Mapbox icon-rotate (photo is portrait). */
export function panelIconLayout(panel, zoom) {
  const { widthM, heightM, landscape, scale } = panelSizeMeta(panel.sizeKey, panel.scale)
  const longAxisM = landscape ? widthM : heightM
  const mpp = Math.max(metersPerPixel(panel.lat, zoom), 0.000_001)
  const iconSize = longAxisM / (PANEL_ICON_HEIGHT_PX * mpp)
  const iconRotate = (Number(panel.rotation) || 0) + (landscape ? 90 : 0)
  return { iconSize, iconRotate, widthM, heightM, landscape, scale }
}

export function panelToFeature(panel, zoom = 19) {
  const { widthM, heightM, scale } = panelSizeMeta(panel.sizeKey, panel.scale)
  const coordinates = [panelCornerRing(panel.lng, panel.lat, widthM, heightM, panel.rotation || 0)]
  const { iconSize, iconRotate } = panelIconLayout(panel, zoom)
  return {
    type: 'Feature',
    id: panel.id,
    properties: {
      id: panel.id,
      sizeKey: panel.sizeKey,
      scale,
      rotation: panel.rotation || 0,
      selected: Boolean(panel.selected),
      iconSize,
      iconRotate,
    },
    geometry: { type: 'Polygon', coordinates },
  }
}

export function panelToIconFeature(panel, zoom = 19) {
  const { iconSize, iconRotate, scale } = panelIconLayout(panel, zoom)
  return {
    type: 'Feature',
    id: panel.id,
    properties: {
      id: panel.id,
      sizeKey: panel.sizeKey,
      scale,
      rotation: panel.rotation || 0,
      selected: Boolean(panel.selected),
      iconSize,
      iconRotate,
    },
    geometry: {
      type: 'Point',
      coordinates: [panel.lng, panel.lat],
    },
  }
}

export function panelsToFeatureCollection(panels = [], zoom = 19) {
  return {
    type: 'FeatureCollection',
    features: panels.map((panel) => panelToFeature(panel, zoom)),
  }
}

export function panelsToIconCollection(panels = [], zoom = 19) {
  return {
    type: 'FeatureCollection',
    features: panels.map((panel) => panelToIconFeature(panel, zoom)),
  }
}

export function createPanelId() {
  return `panel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Default rooftop zoom — Mapbox satellite tiles are sharpest around 20–22. */
export const MAP_ROOF_ZOOM = 20.5
export const MAP_MAX_ZOOM = 22

export function emptyLayoutState(center = [-97.7431, 30.2672], zoom = MAP_ROOF_ZOOM) {
  return {
    center,
    zoom,
    bearing: 0,
    panels: [],
  }
}
