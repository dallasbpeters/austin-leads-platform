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

const PLACES = 'https://places.googleapis.com/v1'
const SOLAR = 'https://solar.googleapis.com/v1/buildingInsights:findClosest'
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
