'use client'

import { useEffect, useState } from 'react'

import { fetchLocationWeather } from '@/services/weather'

const DEFAULT_QUERY = 'Austin, TX'

const geolocationErrorMessage = (error) => {
  if (!error) {
    return 'We could not access your current location.'
  }

  if (error.code === 1) {
    return 'Location access was blocked. Allow location access in your browser and try again.'
  }

  if (error.code === 2) {
    return 'Your location could not be determined. Try entering your city or ZIP code instead.'
  }

  if (error.code === 3) {
    return 'Location lookup timed out. Try again or enter your city or ZIP code instead.'
  }

  return 'We could not access your current location.'
}

export const useHailWeatherLookup = (initialQuery = DEFAULT_QUERY) => {
  const [query, setQuery] = useState(initialQuery)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUserSearched, setHasUserSearched] = useState(false)

  const loadWeather = async (params) => {
    setIsLoading(true)

    try {
      const nextData = await fetchLocationWeather(params)
      setData(nextData)
      setError('')
      if (typeof params?.name === 'string' && params.name.trim()) {
        setQuery(params.name)
      } else if (typeof params?.q === 'string' && params.q.trim()) {
        setQuery(params.q)
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load weather data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWeather({ q: initialQuery })
  }, [initialQuery])

  const searchByQuery = (nextQuery = query) => {
    setHasUserSearched(true)
    const trimmedQuery = nextQuery?.trim()

    if (!trimmedQuery) {
      setError('Enter a city, ZIP code, or neighborhood to check the weather.')
      return
    }

    loadWeather({ q: trimmedQuery })
  }

  const searchByCurrentLocation = () => {
    setHasUserSearched(true)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not available in this browser.')
      return
    }

    setIsLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        loadWeather({
          lat: coords.latitude,
          lon: coords.longitude,
          name: 'Current location',
        })
      },
      (geoError) => {
        setIsLoading(false)
        setError(geolocationErrorMessage(geoError))
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 300_000 },
    )
  }

  return {
    query,
    setQuery,
    data,
    error,
    isPending: isLoading,
    hasUserSearched,
    searchByQuery,
    searchByCurrentLocation,
  }
}
