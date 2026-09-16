'use client'

import { useEffect } from 'react'

import { CLOUD_TONE_COOKIE, getLocalCloudTone, getMillisecondsUntilNextHour } from './cloud-tone'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

/**
 * Keeps the document's sky phase current, and remembers it in a cookie so the
 * server can stamp `data-cloud-tone` straight into the HTML on the next visit
 * — no inline script, and no flash of the day palette.
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
      document.cookie = `${CLOUD_TONE_COOKIE}=${tone}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`
      updateTimer = window.setTimeout(updateTone, getMillisecondsUntilNextHour(now))
    }

    updateTone()

    return () => window.clearTimeout(updateTimer)
  }, [])

  return null
}
