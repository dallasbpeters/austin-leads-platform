'use client'

import { useEffect, useState } from 'react'

import { getLocalCloudTone, getMillisecondsUntilNextHour } from './cloud-tone'

/**
 * Resolves an automatic cloud treatment from the visitor's local clock and
 * refreshes it at each hour boundary. A supplied tone always takes priority.
 *
 * @param {'auto' | 'day' | 'dusk' | 'night'} tone - Requested color treatment.
 * @returns {'day' | 'dusk' | 'night'} The treatment to render.
 */
export const useCloudTone = (tone) => {
  const [localTone, setLocalTone] = useState('day')

  useEffect(() => {
    if (tone !== 'auto') {
      return undefined
    }

    let updateTimer

    const updateTone = () => {
      const now = new Date()

      setLocalTone(getLocalCloudTone(now))
      updateTimer = window.setTimeout(updateTone, getMillisecondsUntilNextHour(now))
    }

    updateTone()

    return () => window.clearTimeout(updateTimer)
  }, [tone])

  return tone === 'auto' ? localTone : tone
}
