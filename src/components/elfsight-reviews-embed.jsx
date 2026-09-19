'use client'

import { useEffect, useRef } from 'react'

const PLATFORM_SRC = 'https://elfsightcdn.com/platform.js'
// Start fetching a little before the widget scrolls into view.
const LOAD_AHEAD_MARGIN = '600px'

/**
 * The Elfsight reviews widget pulls ~535 KB of script and runs it on the main
 * thread. Loading it with the page cost phones seconds of blocking time, so the
 * platform script is only added once the widget is about to be seen.
 */
export default function ElfsightReviewsEmbed({ appId }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return
        }
        observer.disconnect()
        if (document.querySelector(`script[src="${PLATFORM_SRC}"]`)) {
          return
        }
        const script = document.createElement('script')
        script.src = PLATFORM_SRC
        script.async = true
        document.body.append(script)
      },
      { rootMargin: LOAD_AHEAD_MARGIN },
    )
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="min-h-40">
      <div
        className={`elfsight-app-${appId}`}
        data-elfsight-app-lazy
        data-third-party-embed="elfsight-reviews"
      />
    </div>
  )
}
