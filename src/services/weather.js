export async function fetchLocationWeather(params) {
  const url = new URL('/api/weather/location', window.location.origin)

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url.toString(), {
    cache: 'no-store',
  })
  const raw = await response.text()
  let payload = null

  try {
    payload = raw ? JSON.parse(raw) : null
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Unable to load weather data (${response.status}).`)
  }

  return payload
}
