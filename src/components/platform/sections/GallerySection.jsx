'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog } from 'radix-ui'
import { NavArrowLeft, NavArrowRight, Xmark } from 'iconoir-react'

import PortableTextContent from '@/components/PortableTextContent'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import { buildSanityImageUrl } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeString } from '@/lib/sanity/stega'

// Cycled heights produce the masonry rhythm. The order is intentionally
// non-monotonic so neighbouring tiles never sit at matching heights and the
// columns end up offset from each other.
const MASONRY_HEIGHTS = [
  'h-64',
  'h-48',
  'h-72',
  'h-56',
  'h-52',
  'h-60',
  'h-80',
  'h-44',
  'h-56',
  'h-72',
  'h-48',
  'h-64',
]

const getImageCaption = (item) => {
  const neighborhood = cleanRuntimeString(item?.neighborhood || '')
  const packageName = cleanRuntimeString(item?.package || '')
  const year = typeof item?.year === 'number' ? String(item.year) : cleanRuntimeString(item?.year || '')
  return { neighborhood, year, packageName }
}

const resolveImageAlt = (item, index, fallback) =>
  cleanRuntimeString(item?.altText || item?.alt || fallback) || `gallery photo ${index + 1}`

export function GallerySection({ section, sectionId }) {
  const images = Array.isArray(section?.images) ? section.images : []
  const title = cleanRuntimeString(section?.title || '')

  const [lightboxIndex, setLightboxIndex] = useState(null)
  const isOpen = lightboxIndex !== null
  const imageCount = images.length

  const handleOpenChange = useCallback((open) => {
    if (!open) setLightboxIndex(null)
  }, [])

  const handlePrev = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current - 1 + imageCount) % imageCount))
  }, [imageCount])

  const handleNext = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % imageCount))
  }, [imageCount])

  // Arrow-key navigation while the lightbox is open. Esc is handled natively
  // by Dialog (which calls onOpenChange(false)).
  useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handlePrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handlePrev, handleNext])

  // Preload neighbouring frames so prev/next feel instant.
  useEffect(() => {
    if (!isOpen || imageCount < 2) return
    const neighbours = [(lightboxIndex + 1) % imageCount, (lightboxIndex - 1 + imageCount) % imageCount]
    neighbours.forEach((index) => {
      const src = buildSanityImageUrl(images[index], { width: 2400 })
      if (src) {
        const img = new window.Image()
        img.src = src
      }
    })
  }, [isOpen, lightboxIndex, images, imageCount])

  if (imageCount === 0) return null

  const activeImage = isOpen ? images[lightboxIndex] : null
  const activeSrc = activeImage ? buildSanityImageUrl(activeImage, { width: 2400 }) : null
  const activeAlt = activeImage ? resolveImageAlt(activeImage, lightboxIndex, title) : ''
  const activeCaption = activeImage ? getImageCaption(activeImage) : null
  const hasActiveCaption = Boolean(
    activeCaption && (activeCaption.neighborhood || activeCaption.year || activeCaption.packageName),
  )

  return (
    <section
      className="border-border/60 bg-background border-b"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/GallerySection.jsx',
        content: `gallery section with ${imageCount} images`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/GallerySection.jsx"
        content={`gallery section with ${imageCount} images`}
      />
      <div className="mx-auto max-w-7xl px-3 py-20 md:px-6 lg:px-10">
        <div className="mb-8 grid max-w-3xl gap-2">
          {section.eyebrow ? (
            <p className="text-muted-foreground mb-2 text-[0.65rem] tracking-[0.22em] uppercase">
              {section.eyebrow}
            </p>
          ) : null}
          <h2 className="text-foreground text-3xl md:text-4xl">{section.title}</h2>
          {section.subtitle ? (
            <PortableTextContent
              as="div"
              value={section.subtitle}
              className="text-foreground mb-4 text-xl leading-8"
            />
          ) : null}
        </div>
        {/*
         * CSS columns gives us native masonry packing: each tile flows into the
         * currently-shortest column, so the bottom of the grid never has the
         * gap that round-robin column distribution leaves behind.
         */}
        <div className="columns-1 gap-3 sm:columns-2 md:columns-2 md:gap-4 lg:columns-3 xl:columns-4">
          {images.map((item, index) => {
            const src = buildSanityImageUrl(item, { width: 1200 })
            if (!src) return null

            const alt = resolveImageAlt(item, index, title)
            const heightClass = MASONRY_HEIGHTS[index % MASONRY_HEIGHTS.length]
            const { neighborhood, year, packageName } = getImageCaption(item)
            const hasCaption = Boolean(neighborhood || year || packageName)

            const handleClick = () => setLightboxIndex(index)

            return (
              <button
                type="button"
                key={buildRuntimeKey('gallery-image', item?._key, item?.asset?._ref, index)}
                onClick={handleClick}
                aria-label={`Open ${alt}`}
                className={`${heightClass} group focus-visible:outline-primary relative mb-3 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 md:mb-4`}
              >
                <Image
                  src={src}
                  alt={alt}
                  height={1000}
                  width={1000}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                />
                {hasCaption ? (
                  <>
                    {/* Persistent legibility gradient behind the always-visible caption. */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/75 via-black/30 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-left text-white">
                      {neighborhood ? (
                        <p className="text-sm leading-tight font-medium md:text-base">{neighborhood}</p>
                      ) : null}
                      {year || packageName ? (
                        <p className="mt-0.5 text-[0.7rem] tracking-[0.18em] text-white/85 uppercase">
                          {[year, packageName].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed inset-0 z-80 bg-black/95 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed inset-0 z-90 flex flex-col items-center justify-center p-4 outline-none select-none"
          >
            <Dialog.Title className="sr-only">{title || 'Gallery image viewer'}</Dialog.Title>

            {/* Top bar: counter on the left, close on the right. */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 md:p-6">
              <span className="text-sm tracking-wide text-white/70 tabular-nums">
                {(lightboxIndex ?? 0) + 1} / {imageCount}
              </span>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close gallery"
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                >
                  <Xmark className="size-5" strokeWidth={2.2} />
                </button>
              </Dialog.Close>
            </div>

            {activeSrc ? (
              <img
                key={activeSrc}
                src={activeSrc}
                alt={activeAlt}
                className="data-[state=open]:animate-in data-[state=open]:fade-in-0 max-h-[82vh] max-w-[92vw] object-contain shadow-2xl"
                draggable={false}
              />
            ) : null}

            {hasActiveCaption ? (
              <div className="z-10 mt-6 max-w-[92vw] text-center text-white">
                {activeCaption.neighborhood ? (
                  <p className="text-base font-medium md:text-lg">{activeCaption.neighborhood}</p>
                ) : null}
                {activeCaption.year || activeCaption.packageName ? (
                  <p className="mt-1 text-[0.7rem] tracking-[0.22em] text-white/70 uppercase">
                    {[activeCaption.year, activeCaption.packageName].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
              </div>
            ) : null}

            {imageCount > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={handlePrev}
                  className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none md:left-6 md:size-14"
                >
                  <NavArrowLeft className="size-6 md:size-7" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={handleNext}
                  className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none md:right-6 md:size-14"
                >
                  <NavArrowRight className="size-6 md:size-7" strokeWidth={2} />
                </button>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  )
}
