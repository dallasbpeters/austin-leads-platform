'use client'

import { NavArrowLeft, NavArrowRight } from 'iconoir-react'
import Image from 'next/image'
import { useCallback, useEffect, useId, useState } from 'react'

/**
 * Project photo slideshow: arrows either side, dots beneath.
 *
 * Manually driven on purpose — no auto-advance. These are documentary shots an
 * editor ordered deliberately, and a carousel that moves on its own takes that
 * choice away from the reader.
 *
 * `editAttributes` arrives as a plain object rather than a function, because the
 * article is a server component and functions cannot cross that boundary.
 */
export default function CaseStudyGallery({ images = [], editAttributes = {} }) {
  const photos = Array.isArray(images) ? images.filter((photo) => photo?.src) : []
  const count = photos.length
  const [index, setIndex] = useState(0)
  const headingId = useId()

  const go = useCallback(
    (next) => {
      if (count === 0) {
        return
      }
      // Wrap in both directions so the arrows never dead-end.
      setIndex(((next % count) + count) % count)
    },
    [count],
  )

  const goPrev = useCallback(() => go(index - 1), [go, index])
  const goNext = useCallback(() => go(index + 1), [go, index])

  useEffect(() => {
    if (count < 2) {
      return
    }
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        goPrev()
      } else if (event.key === 'ArrowRight') {
        goNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [count, goNext, goPrev])

  if (count === 0) {
    return null
  }

  const active = photos[index]
  const hasControls = count > 1

  return (
    <section
      aria-labelledby={headingId}
      aria-roledescription="carousel"
      className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6"
      {...editAttributes}
    >
      <h2 className="sr-only" id={headingId}>
        Project photos
      </h2>

      <div className="group relative">
        <div className="bg-secondary-100 relative aspect-video w-full overflow-hidden rounded-2xl">
          {photos.map((photo, position) => (
            // All frames stay mounted and cross-fade. Swapping a single <Image>
            // src re-decodes on every click and flashes on slower connections.
            <Image
              alt={photo.alt}
              aria-hidden={position === index ? undefined : true}
              className={`object-cover transition-opacity duration-500 ${
                position === index ? 'opacity-100' : 'opacity-0'
              }`}
              fill
              key={photo.key}
              priority={position === 0}
              sizes="(min-width: 1024px) 64rem, 100vw"
              src={photo.src}
            />
          ))}
          {hasControls ? (
            <div className="absolute bottom-5 left-[50%] z-50 mt-4 flex -translate-x-1/2 items-center justify-center gap-2">
              {photos.map((photo, position) => (
                <button
                  aria-current={position === index ? 'true' : undefined}
                  aria-label={`Go to photo ${position + 1}`}
                  className={`relative h-2 rounded-full transition-[width,background-color] duration-200 before:absolute before:-inset-x-1 before:-inset-y-4.5 before:content-[''] ${
                    position === index ? 'w-6 bg-blue-500' : 'bg-border hover:bg-muted-foreground w-2'
                  }`}
                  key={photo.key}
                  onClick={() => go(position)}
                  type="button"
                />
              ))}
            </div>
          ) : null}
        </div>

        {hasControls ? (
          <>
            <button
              aria-label="Previous photo"
              className="border-border/60 bg-primary/80 text-primary-foreground hover:bg-primary absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-sm transition-colors"
              onClick={goPrev}
              type="button"
            >
              <NavArrowLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              aria-label="Next photo"
              className="border-border/60 bg-primary/80 text-primary-foreground hover:bg-primary absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-sm transition-colors"
              onClick={goNext}
              type="button"
            >
              <NavArrowRight aria-hidden="true" className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {/* Caption is tied to the active frame, so it changes with the photo. */}
      <div className="mt-3 flex min-h-6 items-start justify-between gap-4">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {active.caption || ''}
        </p>
        {hasControls ? (
          <p className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {index + 1} / {count}
          </p>
        ) : null}
      </div>
    </section>
  )
}
