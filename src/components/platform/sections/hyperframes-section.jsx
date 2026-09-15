'use client'

import { useState } from 'react'

import { getImageUrl } from '@/lib/platform/imageSource'

const RATIOS = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '9:16': '9 / 16',
}

/**
 * Embeds a published HyperFrames composition.
 *
 * The composition is the live thing, not a render: re-publishing updates the
 * same URL, so a page carrying this section never shows a stale cut and nobody
 * has to re-upload an MP4 to ship a copy fix.
 *
 * The iframe is NOT mounted until the visitor asks for it. A composition pulls
 * GSAP, fonts, photography and video; loading that on every page view to show a
 * poster would cost more than the section is worth. Until then this is a poster
 * and a button, which is also what a visitor with JS disabled keeps.
 */
export function HyperframesSection({ section }) {
  const [playing, setPlaying] = useState(false)

  const { eyebrow, title, body, embedUrl, posterImage, caption, aspectRatio, fallbackUrl } = section
  const ratio = RATIOS[aspectRatio] || RATIOS['16:9']
  const poster = getImageUrl(posterImage, null, { width: 1600 })

  if (!embedUrl) {
    return null
  }

  return (
    <section className="hf-section">
      {(eyebrow || title) && (
        <header className="hf-section__head">
          {eyebrow && <p className="hf-section__eyebrow">{eyebrow}</p>}
          {title && <h2 className="hf-section__title">{title}</h2>}
          {body && <p className="hf-section__body">{body}</p>}
        </header>
      )}

      <div className="hf-section__frame" style={{ aspectRatio: ratio }}>
        {playing ? (
          <iframe
            className="hf-section__iframe"
            src={embedUrl}
            title={title || 'Video'}
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            className="hf-section__poster"
            onClick={() => setPlaying(true)}
            style={poster ? { backgroundImage: `url(${poster})` } : undefined}
          >
            <span className="hf-section__play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" focusable="false">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className="hf-section__play-label">Play{title ? ` — ${title}` : ''}</span>
          </button>
        )}
      </div>

      {caption && <p className="hf-section__caption">{caption}</p>}

      {/* Anyone who cannot run the embed still gets the film. */}
      {fallbackUrl && (
        <p className="hf-section__fallback">
          <a href={fallbackUrl}>Open the video in a new tab</a>
        </p>
      )}
    </section>
  )
}

export default HyperframesSection
