'use client'

import { useEffect } from 'react'

import { getLocalCloudTone, getMillisecondsUntilNextHour } from './cloud-tone'

/**
 * Keeps the document's sky phase current for visitors who leave a tab open
 * across an hour boundary. The initial value is stamped before the first paint
 * by `cloudToneBootstrapScript`, so this only ever repaints on a real change.
 *
 * @returns {null} Nothing is rendered.
 */
export default function CloudToneSync() {
  useEffect(() => {
    let updateTimer

    const updateTone = () => {
      const now = new Date()

      document.documentElement.dataset.cloudTone = getLocalCloudTone(now)
      updateTimer = window.setTimeout(updateTone, getMillisecondsUntilNextHour(now))
    }

    updateTone()

    return () => window.clearTimeout(updateTimer)
  }, [])

  return null
}
