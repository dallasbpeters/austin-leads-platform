'use client'

import { useEffect } from 'react'

import { getLocalCloudTone, getMillisecondsUntilNextHour } from './cloud-tone'

/**
 * Keeps the document's sky phase current as the hour turns. The first paint is
 * set by `CLOUD_TONE_INLINE_SCRIPT` in the root document.
 *
 * @returns {null} Nothing is rendered.
 */
export default function CloudToneSync() {
  useEffect(() => {
    let updateTimer

    const updateTone = () => {
      const now = new Date()

      const tone = getLocalCloudTone(now)

      document.documentElement.dataset.cloudTone = tone
      updateTimer = window.setTimeout(updateTone, getMillisecondsUntilNextHour(now))
    }

    updateTone()

    return () => window.clearTimeout(updateTimer)
  }, [])

  return null
}
