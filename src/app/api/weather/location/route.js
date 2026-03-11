import { NextResponse } from 'next/server'

const OPEN_METEO_GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const NWS_ALERTS_URL = 'https://api.weather.gov/alerts/active'
const SWDI_BASE_URL = 'https://www.ncdc.noaa.gov/swdiws/csv'
const WEATHER_USER_AGENT = 'Texas Solar and Roofing Pros (info@texassolarandroofingpros.com)'

function formatLocationName(location) {
  const parts = [location.name, location.admin1, location.country].filter(Boolean)
  return parts.join(', ')
}

function buildMapEmbedUrl(latitude, longitude) {
  const latDelta = 0.18
  const lonDelta = 0.24
  const left = (longitude - lonDelta).toFixed(4)
  const right = (longitude + lonDelta).toFixed(4)
  const top = (latitude + latDelta).toFixed(4)
  const bottom = (latitude - latDelta).toFixed(4)

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`
}

function buildBoundingBox(latitude, longitude) {
  const latDelta = 0.22
  const lonDelta = 0.28

  return {
    minLon: Number((longitude - lonDelta).toFixed(4)),
    minLat: Number((latitude - latDelta).toFixed(4)),
    maxLon: Number((longitude + lonDelta).toFixed(4)),
    maxLat: Number((latitude + latDelta).toFixed(4)),
  }
}

function formatSwdiDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

function parseCsv(csvText) {
  const rows = csvText.trim().split(/\r?\n/).filter(Boolean)

  if (rows.length < 2) {
    return []
  }

  const headers = rows[0].split(',').map((header) => header.trim().toLowerCase())

  return rows.slice(1).map((row) => {
    const values = row.split(',').map((value) => value.trim())
    return headers.reduce((record, header, index) => {
      record[header] = values[index]
      return record
    }, {})
  })
}

function normalizeSwdiPoint(row, fallbackType) {
  const latitude = Number(row.lat || row.latitude)
  const longitude = Number(row.lon || row.longitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return {
    id: row.id || `${fallbackType}-${row.ztime || row.date || latitude}-${longitude}`,
    type: fallbackType,
    latitude,
    longitude,
    date: row.ztime || row.date || null,
    magnitude: row.maxsize || row.magnitude || null,
    probability: row.prob || null,
    severeProbability: row.sevprob || null,
    city: row.city || null,
    source: row.source || null,
    event: row.event || null,
    raw: row,
  }
}

function weatherCodeLabel(code) {
  const labels = {
    0: 'Clear',
    1: 'Mostly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Heavy showers',
    82: 'Violent rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail risk',
    99: 'Severe thunderstorm with hail risk',
  }

  return labels[code] || 'Weather update'
}

function deriveRisk({ alerts, current, daily }) {
  const alertText = alerts.map((alert) => `${alert.event} ${alert.headline} ${alert.severity}`).join(' ')
  const severeAlert = /hail|severe thunderstorm|tornado|destructive wind/i.test(alertText)
  const hailAlert = /hail/i.test(alertText)
  const currentCode = current?.weatherCode
  const dailyCode = daily?.[0]?.weatherCode
  const dailyGust = daily?.[0]?.windGustMax ?? 0
  const precipProb = daily?.[0]?.precipitationProbabilityMax ?? 0
  const convectiveCode = [95, 96, 99].includes(currentCode) || [95, 96, 99].includes(dailyCode)

  if (hailAlert || severeAlert) {
    return {
      level: hailAlert ? 'high' : 'elevated',
      headline: hailAlert ? 'Hail-related alert in the area' : 'Severe storm alert active nearby',
      detail:
        'Recent alerts suggest this location is worth a roof inspection if you have visible impact, leaks, or granule loss.',
    }
  }

  if (convectiveCode || dailyGust >= 45 || precipProb >= 70) {
    return {
      level: 'elevated',
      headline: 'Storm conditions look worth checking',
      detail:
        'Forecast wind, precipitation, or thunderstorm conditions are elevated enough to justify documenting the roof and watching for visible impact.',
    }
  }

  return {
    level: 'low',
    headline: 'No strong hail signal right now',
    detail:
      'Current conditions do not point to an obvious hail issue, but recent storm history and roof age can still justify an inspection.',
  }
}

async function fetchJson(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`)
  }

  return response.json()
}

async function fetchText(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'text/csv',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`)
  }

  return response.text()
}

async function geocodeQuery(query) {
  const url = new URL(OPEN_METEO_GEOCODE_URL)
  url.searchParams.set('name', query)
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')
  url.searchParams.set('countryCode', 'US')

  const data = await fetchJson(url.toString())
  const result = data?.results?.[0]

  if (!result) {
    throw new Error('No matching location found.')
  }

  return {
    name: formatLocationName(result),
    latitude: result.latitude,
    longitude: result.longitude,
  }
}

async function fetchForecast(latitude, longitude) {
  const url = new URL(OPEN_METEO_FORECAST_URL)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '3')
  url.searchParams.set(
    'current',
    ['temperature_2m', 'weather_code', 'wind_speed_10m', 'wind_gusts_10m', 'is_day'].join(','),
  )
  url.searchParams.set(
    'daily',
    [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'wind_gusts_10m_max',
    ].join(','),
  )

  return fetchJson(url.toString())
}

async function fetchAlerts(latitude, longitude) {
  const url = new URL(NWS_ALERTS_URL)
  url.searchParams.set('point', `${latitude},${longitude}`)

  const data = await fetchJson(url.toString(), {
    headers: {
      'User-Agent': WEATHER_USER_AGENT,
      Accept: 'application/geo+json',
    },
  })

  return (data?.features || []).slice(0, 4).map((feature) => ({
    id: feature.id,
    event: feature.properties?.event,
    severity: feature.properties?.severity,
    headline: feature.properties?.headline,
    area: feature.properties?.areaDesc,
    effective: feature.properties?.effective,
    expires: feature.properties?.expires,
  }))
}

async function fetchSwdiDataset(dataset, bbox, startDate, endDate) {
  const dateRange = `${formatSwdiDate(startDate)}:${formatSwdiDate(endDate)}`
  const bboxValue = [bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat].join(',')
  const url = `${SWDI_BASE_URL}/${dataset}/${dateRange}/2500?bbox=${bboxValue}`

  const csvText = await fetchText(url, {
    headers: {
      'User-Agent': WEATHER_USER_AGENT,
    },
  })

  return parseCsv(csvText)
}

function normalizeForecast(forecast) {
  const rawCurrent = forecast?.current
  const current = rawCurrent
    ? {
        temperature: rawCurrent.temperature_2m,
        weatherCode: rawCurrent.weather_code,
        weatherLabel: weatherCodeLabel(rawCurrent.weather_code),
        windSpeed: rawCurrent.wind_speed_10m,
        windGust: rawCurrent.wind_gusts_10m,
        isDay: Boolean(rawCurrent.is_day),
      }
    : null

  const daily = (forecast?.daily?.time || []).map((date, index) => ({
    date,
    weatherCode: forecast.daily.weather_code?.[index],
    weatherLabel: weatherCodeLabel(forecast.daily.weather_code?.[index]),
    temperatureMax: forecast.daily.temperature_2m_max?.[index],
    temperatureMin: forecast.daily.temperature_2m_min?.[index],
    precipitationProbabilityMax: forecast.daily.precipitation_probability_max?.[index],
    precipitationSum: forecast.daily.precipitation_sum?.[index],
    windGustMax: forecast.daily.wind_gusts_10m_max?.[index],
  }))

  return { current, daily }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()
  const latParam = searchParams.get('lat')
  const lonParam = searchParams.get('lon')
  const nameParam = searchParams.get('name')?.trim()

  if (!query && (!latParam || !lonParam)) {
    return NextResponse.json({ error: 'Provide a city, ZIP code, or coordinates.' }, { status: 400 })
  }

  try {
    const location =
      latParam && lonParam
        ? {
            name: nameParam || 'Current location',
            latitude: Number(latParam),
            longitude: Number(lonParam),
          }
        : await geocodeQuery(query)

    const bbox = buildBoundingBox(location.latitude, location.longitude)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30)

    const [forecastData, alerts, hailRowsResult, reportRowsResult] = await Promise.allSettled([
      fetchForecast(location.latitude, location.longitude),
      fetchAlerts(location.latitude, location.longitude),
      fetchSwdiDataset('nx3hail', bbox, startDate, endDate),
      fetchSwdiDataset('plsr', bbox, startDate, endDate),
    ])

    if (forecastData.status !== 'fulfilled' || alerts.status !== 'fulfilled') {
      throw new Error('Unable to load live weather data right now.')
    }

    const forecast = normalizeForecast(forecastData.value)
    const hailRows = hailRowsResult.status === 'fulfilled' ? hailRowsResult.value : []
    const reportRows = reportRowsResult.status === 'fulfilled' ? reportRowsResult.value : []
    const hailPoints = hailRows
      .map((row) => normalizeSwdiPoint(row, 'hail-signature'))
      .filter(Boolean)
      .slice(0, 250)
    const reportPoints = reportRows
      .map((row) => normalizeSwdiPoint(row, 'storm-report'))
      .filter(Boolean)
      .filter((row) => !row.event || /hail/i.test(row.event))
      .slice(0, 250)
    const risk = deriveRisk({
      alerts: alerts.value,
      current: forecast.current,
      daily: forecast.daily,
    })

    return NextResponse.json({
      location,
      mapEmbedUrl: buildMapEmbedUrl(location.latitude, location.longitude),
      current: forecast.current,
      daily: forecast.daily,
      alerts: alerts.value,
      risk,
      hailLayer: {
        bbox,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        hailSignatures: hailPoints,
        stormReports: reportPoints,
      },
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load weather data right now.' },
      { status: 502 },
    )
  }
}
