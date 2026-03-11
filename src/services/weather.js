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

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to load weather data.')
  }

  return payload
}
