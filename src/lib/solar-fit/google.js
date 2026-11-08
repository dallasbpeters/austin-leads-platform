/*
 * Server-only helpers for the roof step of the "See if solar is right for you"
 * form. Every call uses the server key (GOOGLE_PLACES_API_KEY or
 * GOOGLE_BUSINESS_API_KEY), which never reaches the browser:
 *
 *   address search  -> Places API (New) autocomplete
 *   address -> point -> Places API (New) place details
 *   roof            -> Solar API buildingInsights:findClosest
 *   roof photo      -> Maps Static API satellite image
 *
 * The browser talks only to our /api/solar-fit/* routes.
 */

import { encode } from 'fast-png'
import { fromArrayBuffer } from 'geotiff'
import proj4 from 'proj4'

const PLACES = 'https://places.googleapis.com/v1'
const SOLAR = 'https://solar.googleapis.com/v1/buildingInsights:findClosest'
const DATA_LAYERS = 'https://solar.googleapis.com/v1/dataLayers:get'
const STATIC_MAP = 'https://maps.googleapis.com/maps/api/staticmap'
const DAY = 60 * 60 * 24

// Rough box around Texas; the photo route refuses anything outside it so it
// cannot be used as a free satellite-image service.
const TEXAS = { south: 25.8, north: 36.6, west: -106.7, east: -93.5 }
const AUSTIN = { latitude: 30.2672, longitude: -97.7431 }

// Solar API reports DC energy; about 85% reaches the house as AC after the inverter and wiring.
export const DC_TO_AC = 0.85

function key() {
  return (process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_BUSINESS_API_KEY || '').trim()
}

export const hasGoogleKey = () => Boolean(key())

export function isInTexas(lat, lng) {
  return lat >= TEXAS.south && lat <= TEXAS.north && lng >= TEXAS.west && lng <= TEXAS.east
}

/** Address suggestions, biased to Austin and limited to the US. */
export async function suggestAddresses(input, sessionToken) {
  const response = await fetch(`${PLACES}/places:autocomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key() },
    body: JSON.stringify({
      input,
      sessionToken: sessionToken || undefined,
      includedRegionCodes: ['us'],
      includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
      locationBias: { circle: { center: AUSTIN, radius: 50_000 } },
    }),
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`Address search failed (${response.status})`)
  }
  const payload = await response.json()
  return (payload.suggestions || [])
    .map((suggestion) => suggestion.placePrediction)
    .filter(Boolean)
    .slice(0, 5)
    .map((prediction) => ({ placeId: prediction.placeId, text: prediction.text?.text || '' }))
}

/** The point and full address for a picked suggestion. Closes the autocomplete session. */
export async function placeLocation(placeId, sessionToken) {
  const url = new URL(`${PLACES}/places/${encodeURIComponent(placeId)}`)
  if (sessionToken) {
    url.searchParams.set('sessionToken', sessionToken)
  }
  const response = await fetch(url, {
    headers: { 'X-Goog-Api-Key': key(), 'X-Goog-FieldMask': 'location,formattedAddress' },
    next: { revalidate: DAY },
  })
  if (!response.ok) {
    throw new Error(`Address lookup failed (${response.status})`)
  }
  const place = await response.json()
  return {
    lat: place.location?.latitude,
    lng: place.location?.longitude,
    address: place.formattedAddress || '',
  }
}

/**
 * The roof under a point, trimmed to what the form draws and computes with.
 * Returns null when Google has no roof data there (some rural homes).
 */
export async function roofAt(lat, lng) {
  const url = new URL(SOLAR)
  url.searchParams.set('location.latitude', String(lat))
  url.searchParams.set('location.longitude', String(lng))
  url.searchParams.set('requiredQuality', 'MEDIUM')
  url.searchParams.set('key', key())

  const response = await fetch(url, { next: { revalidate: DAY } })
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(`Roof lookup failed (${response.status})`)
  }

  const building = await response.json()
  const potential = building.solarPotential || {}
  const segments = (potential.roofSegmentStats || []).map((segment) => ({
    azimuth: segment.azimuthDegrees ?? 180,
    pitch: segment.pitchDegrees ?? 0,
  }))

  return {
    center: { lat: building.center?.latitude, lng: building.center?.longitude },
    box: {
      south: building.boundingBox?.sw?.latitude,
      west: building.boundingBox?.sw?.longitude,
      north: building.boundingBox?.ne?.latitude,
      east: building.boundingBox?.ne?.longitude,
    },
    quality: building.imageryQuality || '',
    imageryDate: building.imageryDate,
    panelWatts: potential.panelCapacityWatts || 400,
    panelHeight: potential.panelHeightMeters || 1.879,
    panelWidth: potential.panelWidthMeters || 1.045,
    maxPanels: potential.maxArrayPanelsCount || 0,
    sunHoursPerYear: potential.maxSunshineHoursPerYear || 0,
    // Google lists panels best first, so the first N are the best N-panel layout.
    panels: (potential.solarPanels || []).map((panel) => ({
      lat: panel.center?.latitude,
      lng: panel.center?.longitude,
      landscape: panel.orientation === 'LANDSCAPE',
      azimuth: segments[panel.segmentIndex]?.azimuth ?? 180,
      yearlyKwhDc: panel.yearlyEnergyDcKwh || 0,
    })),
  }
}

/** Zoom that fits the roof's bounding box in the 640px photo with some margin. */
export function zoomForBox(box, lat) {
  const metersTall = (box.north - box.south) * 110_574
  const metersWide = (box.east - box.west) * 111_320 * Math.cos((lat * Math.PI) / 180)
  const span = Math.max(metersTall, metersWide, 12)
  const metersPerPixel = span / 420
  const zoom = Math.floor(Math.log2((156_543.033_92 * Math.cos((lat * Math.PI) / 180)) / metersPerPixel))
  return Math.max(18, Math.min(21, zoom))
}

export function staticMapUrl(lat, lng, zoom) {
  const url = new URL(STATIC_MAP)
  url.searchParams.set('center', `${lat},${lng}`)
  url.searchParams.set('zoom', String(zoom))
  url.searchParams.set('size', '640x640')
  url.searchParams.set('scale', '2')
  url.searchParams.set('maptype', 'satellite')
  url.searchParams.set('key', key())
  return url.toString()
}

const STALE_IMAGERY_YEARS = 2

/** True when the Solar API's aerial photo ({ year, month, day }) is missing or over two years old. */
export function isImageryStale(date, now = new Date()) {
  if (!date?.year) {
    return true
  }
  const taken = new Date(Date.UTC(date.year, (date.month || 1) - 1, date.day || 1))
  const cutoff = new Date(now)
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - STALE_IMAGERY_YEARS)
  return taken < cutoff
}

/*
 * The roof photo, with every panel placed on it in metres from the photo's
 * top-left corner. The Solar API's own aerial image is used when it can be,
 * because Google's panel positions are measured on that image; Maps satellite
 * tiles can be years apart and several metres out. But an aerial over two years
 * old can predate the house (a new build shows as a bare lot), so then the newer
 * Maps photo wins, even if the panels may sit a little off. The image comes as a
 * GeoTIFF in UTM metres, so it is decoded here and sent on as a PNG.
 */
export async function roofPhoto(roof) {
  if (isImageryStale(roof.imageryDate)) {
    return mapPhoto(roof)
  }
  try {
    return await solarPhoto(roof)
  } catch (error) {
    console.warn('[solar-fit] Solar imagery unavailable, using the map photo', error)
    return mapPhoto(roof)
  }
}

async function solarPhoto(roof) {
  const halfWide =
    ((roof.box.east - roof.box.west) * 111_320 * Math.cos((roof.center.lat * Math.PI) / 180)) / 2
  const halfTall = ((roof.box.north - roof.box.south) * 110_574) / 2
  const radius = Math.min(50, Math.max(10, Math.hypot(halfWide, halfTall) + 4))

  const url = new URL(DATA_LAYERS)
  url.searchParams.set('location.latitude', String(roof.center.lat))
  url.searchParams.set('location.longitude', String(roof.center.lng))
  url.searchParams.set('radiusMeters', radius.toFixed(1))
  url.searchParams.set('view', 'IMAGERY_LAYERS')
  url.searchParams.set('requiredQuality', 'MEDIUM')
  url.searchParams.set('pixelSizeMeters', '0.1')
  url.searchParams.set('key', key())

  // The layer links expire within the hour, so this lookup is never cached.
  const layers = await fetch(url, { cache: 'no-store' })
  if (!layers.ok) {
    throw new Error(`Solar imagery lookup failed (${layers.status})`)
  }
  const { rgbUrl } = await layers.json()
  const tiff = await fetch(`${rgbUrl}&key=${key()}`, { cache: 'no-store' })
  if (!tiff.ok) {
    throw new Error(`Solar imagery download failed (${tiff.status})`)
  }

  const image = await (await fromArrayBuffer(await tiff.arrayBuffer())).getImage()
  const [minX, minY, maxX, maxY] = image.getBoundingBox()
  const width = image.getWidth()
  const height = image.getHeight()
  const rgb = await image.readRasters({ interleave: true, samples: [0, 1, 2] })
  const png = encode({ width, height, data: new Uint8Array(rgb), channels: 3, depth: 8 })

  // EPSG 326xx is UTM north zone xx (Texas is 13-15), 327xx the southern zones.
  const epsg = image.getGeoKeys().ProjectedCSTypeGeoKey
  const utm = `+proj=utm +zone=${epsg % 100}${Math.floor(epsg / 100) === 327 ? ' +south' : ''} +datum=WGS84 +units=m +no_defs`
  const place = (lat, lng) => {
    const [x, y] = proj4('WGS84', utm, [lng, lat])
    return { x: x - minX, y: maxY - y }
  }

  return {
    src: `data:image/png;base64,${Buffer.from(png).toString('base64')}`,
    source: 'solar',
    metersWide: maxX - minX,
    metersTall: maxY - minY,
    panels: roof.panels.map((panel) => place(panel.lat, panel.lng)),
  }
}

/** Fallback: the Maps satellite photo, placed with Web Mercator around the roof centre. */
function mapPhoto(roof) {
  const zoom = zoomForBox(roof.box, roof.center.lat)
  const radians = (roof.center.lat * Math.PI) / 180
  const metersWide = (640 * 156_543.033_92 * Math.cos(radians)) / 2 ** zoom
  return {
    src: `/api/solar-fit/roof-image?lat=${roof.center.lat}&lng=${roof.center.lng}&zoom=${zoom}`,
    source: 'maps',
    metersWide,
    metersTall: metersWide,
    panels: roof.panels.map((panel) => ({
      x: metersWide / 2 + (panel.lng - roof.center.lng) * 111_320 * Math.cos(radians),
      y: metersWide / 2 - (panel.lat - roof.center.lat) * 110_574,
    })),
  }
}
