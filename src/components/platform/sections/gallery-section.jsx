'use client'

import { NavArrowLeft, NavArrowRight, Xmark } from 'iconoir-react'
import Image from 'next/image'
import { Dialog } from 'radix-ui'
import { useCallback, useEffect, useState } from 'react'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { buildSanityImageUrl } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeString } from '@/lib/sanity/stega'

// Shared fallback so `images` keeps a stable identity when the section has none.
// A fresh `[]` per render would change the neighbour-preload effect's dependencies
// on every render and re-run it forever.
const EMPTY_IMAGES = []

// Cycled heights produce the masonry rhythm. The order is intentionally
// non-monotonic so neighbouring tiles never sit at matching heights and the
// columns end up offset from each other.
const MASONRY_HEIGHTS_REM = [16, 12, 18, 14, 13, 15, 20, 11, 14, 18, 12, 16]

const getImageCaption = (item) => {
  const neighborhood = cleanRuntimeString(item?.neighborhood || '')
  const packageName = cleanRuntimeString(item?.package || '')
  const year = typeof item?.year === 'number' ? String(item.year) : cleanRuntimeString(item?.year || '')
  return { neighborhood, year, packageName }
}

const resolveImageAlt = (item, index, fallback) =>
  cleanRuntimeString(item?.altText || item?.alt || fallback) || `gallery photo ${index + 1}`

function GalleryHeader({ section }) {
  return (
    <div className="section-shell__intro gallery__intro">
      {section.eyebrow ? (
        <p className="section-shell__eyebrow section-shell__eyebrow--muted text-size-80">{section.eyebrow}</p>
      ) : null}
      <h2 className="section-shell__title text-fluid-500">{section.title}</h2>
      {section.subtitle ? (
        <PortableTextContent
          as="div"
          value={section.subtitle}
          className="section-shell__subtitle gallery__subtitle text-size-200"
        />
      ) : null}
    </div>
  )
}

function GalleryTile({ item, index, title, onClick }) {
  const src = buildSanityImageUrl(item, { width: 1200 })
  if (!src) {
    return null
  }

  const alt = resolveImageAlt(item, index, title)
  const height = `${MASONRY_HEIGHTS_REM[index % MASONRY_HEIGHTS_REM.length]}rem`
  const { neighborhood, year, packageName } = getImageCaption(item)
  const hasCaption = Boolean(neighborhood || year || packageName)

  return (
    <button
      type="button"
      key={buildRuntimeKey('gallery-image', item?._key, item?.asset?._ref, index)}
      onClick={onClick}
      aria-label={`Open ${alt}`}
      className="gallery__tile"
      style={{ height }}
    >
      <Image
        src={src}
        alt={alt}
        height={1000}
        width={1000}
        loading="lazy"
        decoding="async"
        className="gallery__image"
      />
      {hasCaption ? (
        <>
          <div className="gallery__fade" />
          <div className="gallery__caption">
            {neighborhood ? <p className="gallery__caption-title text-size-100">{neighborhood}</p> : null}
            {year || packageName ? (
              <p className="gallery__caption-meta text-size-80">
                {[year, packageName].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </button>
  )
}

function GalleryLightbox({
  isOpen,
  onOpenChange,
  lightboxIndex,
  imageCount,
  images,
  title,
  handlePrev,
  handleNext,
}) {
  const activeImage = isOpen ? images[lightboxIndex] : null
  const activeSrc = activeImage ? buildSanityImageUrl(activeImage, { width: 2400 }) : null
  const activeAlt = activeImage ? resolveImageAlt(activeImage, lightboxIndex, title) : ''
  const activeCaption = activeImage ? getImageCaption(activeImage) : null
  const hasActiveCaption = Boolean(
    activeCaption && (activeCaption.neighborhood || activeCaption.year || activeCaption.packageName),
  )

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="gallery-lightbox__overlay" />
        <Dialog.Content aria-describedby={undefined} className="gallery-lightbox__content">
          <Dialog.Title className="sr-only">{title || 'Gallery image viewer'}</Dialog.Title>
          <div className="gallery-lightbox__bar">
            <span className="gallery-lightbox__count text-size-90">
              {(lightboxIndex ?? 0) + 1} / {imageCount}
            </span>
            <Dialog.Close asChild>
              <button type="button" aria-label="Close gallery" className="gallery-lightbox__button">
                <Xmark className="gallery-lightbox__button-icon" strokeWidth={2.2} />
              </button>
            </Dialog.Close>
          </div>
          {activeSrc ? (
            <Image
              key={activeSrc}
              src={activeSrc}
              alt={activeAlt}
              height={400}
              width={400}
              className="gallery-lightbox__image"
              draggable={false}
            />
          ) : null}
          {hasActiveCaption ? (
            <div className="gallery-lightbox__caption">
              {activeCaption.neighborhood ? (
                <p className="gallery-lightbox__caption-title text-fluid-200">{activeCaption.neighborhood}</p>
              ) : null}
              {activeCaption.year || activeCaption.packageName ? (
                <p className="gallery-lightbox__caption-meta text-size-80">
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
                className="gallery-lightbox__button gallery-lightbox__nav gallery-lightbox__nav--prev"
              >
                <NavArrowLeft className="gallery-lightbox__nav-icon" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={handleNext}
                className="gallery-lightbox__button gallery-lightbox__nav gallery-lightbox__nav--next"
              >
                <NavArrowRight className="gallery-lightbox__nav-icon" strokeWidth={2} />
              </button>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function GallerySection({ section, sectionId }) {
  const images = Array.isArray(section?.images) ? section.images : EMPTY_IMAGES
  const title = cleanRuntimeString(section?.title || '')

  const [lightboxIndex, setLightboxIndex] = useState(null)
  const isOpen = lightboxIndex !== null
  const imageCount = images.length

  const handleOpenChange = useCallback((open) => {
    if (!open) {
      setLightboxIndex(null)
    }
  }, [])

  const handlePrev = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current - 1 + imageCount) % imageCount))
  }, [imageCount])

  const handleNext = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % imageCount))
  }, [imageCount])

  useEffect(() => {
    if (!isOpen) {
      return
    }
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

  useEffect(() => {
    if (!isOpen || imageCount < 2) {
      return
    }
    const neighbours = [(lightboxIndex + 1) % imageCount, (lightboxIndex - 1 + imageCount) % imageCount]
    neighbours.forEach((index) => {
      const src = buildSanityImageUrl(images[index], { width: 2400 })
      if (src) {
        const img = new window.Image()
        img.src = src
      }
    })
  }, [isOpen, lightboxIndex, images, imageCount])

  if (imageCount === 0) {
    return null
  }

  return (
    <section
      className="gallery section-shell"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/gallery-section.jsx',
        content: `gallery section with ${imageCount} images`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/gallery-section.jsx"
        content={`gallery section with ${imageCount} images`}
      />
      <div className="section-shell__inner">
        <GalleryHeader section={section} />
        <div className="gallery__grid">
          {images.map((item, index) => (
            <GalleryTile
              key={buildRuntimeKey('gallery-image', item?._key, item?.asset?._ref, index)}
              item={item}
              index={index}
              title={title}
              onClick={() => setLightboxIndex(index)}
            />
          ))}
        </div>
      </div>
      <GalleryLightbox
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        lightboxIndex={lightboxIndex}
        imageCount={imageCount}
        images={images}
        title={title}
        handlePrev={handlePrev}
        handleNext={handleNext}
      />
    </section>
  )
}
