'use client'

import { useEffect, useState, useTransition } from 'react'

import { fetchLocationWeather } from '@/services/weather'

const DEFAULT_QUERY = 'Austin, TX'

export function useHailWeatherLookup(initialQuery = DEFAULT_QUERY) {
  const [query, setQuery] = useState(initialQuery)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      try {
        const nextData = await fetchLocationWeather({ q: initialQuery })
        setData(nextData)
        setError('')
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Unable to load weather data.')
      }
    })
  }, [initialQuery])

  function searchByQuery(nextQuery = query) {
    startTransition(async () => {
      try {
        const nextData = await fetchLocationWeather({ q: nextQuery })
        setData(nextData)
        setError('')
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Unable to load weather data.')
      }
    })
  }

  function searchByCurrentLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not available in this browser.')
      return
    }

    startTransition(() => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const nextData = await fetchLocationWeather({
              lat: coords.latitude,
              lon: coords.longitude,
              name: 'Current location',
            })
            setData(nextData)
            setError('')
          } catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : 'Unable to load weather data.')
          }
        },
        () => {
          setError('We could not access your current location.')
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    })
  }

  return {
    query,
    setQuery,
    data,
    error,
    isPending,
    searchByQuery,
    searchByCurrentLocation,
  }
}
