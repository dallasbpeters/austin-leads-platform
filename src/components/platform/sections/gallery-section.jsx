'use client'

import { MultiplePages, NavArrowLeft, NavArrowRight, Xmark } from 'iconoir-react'
import Image from 'next/image'
import { Dialog } from 'radix-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { countGalleryPhotos, getGalleryProjects, getProjectMetaLine } from '@/lib/platform/gallery-projects'
import { buildSanityImageUrl } from '@/lib/platform/imageSource'
import { cleanRuntimeString } from '@/lib/sanity/stega'

// Cycled heights produce the masonry rhythm. The order is intentionally
// non-monotonic so neighbouring tiles never sit at matching heights and the
// columns end up offset from each other.
const MASONRY_HEIGHTS_REM = [16, 12, 18, 14, 13, 15, 20, 11, 14, 18, 12, 16]

const LIGHTBOX_IMAGE_WIDTH = 2400
// Fallback intrinsic size when an asset has no stored dimensions; only the ratio matters.
const FALLBACK_IMAGE_WIDTH = 1600
const FALLBACK_IMAGE_HEIGHT = 1200
// A horizontal drag shorter than this is a tap, not a swipe.
const SWIPE_THRESHOLD_PX = 48

const wrapIndex = (index, count) => ((index % count) + count) % count

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

function ProjectTile({ project, index, onClick }) {
  const src = buildSanityImageUrl(project.cover.image, { width: 1200 })
  if (!src) {
    return null
  }

  const height = `${MASONRY_HEIGHTS_REM[index % MASONRY_HEIGHTS_REM.length]}rem`
  const meta = getProjectMetaLine(project)
  const photoCount = project.photos.length
  const hasCaption = Boolean(project.title || meta)
  const countLabel = `${photoCount} photo${photoCount === 1 ? '' : 's'}`

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={photoCount > 1 ? `Open ${project.name}, ${countLabel}` : `Open ${project.name}`}
      aria-haspopup="dialog"
      className="gallery__tile"
      style={{ height }}
      data-gallery-project={project.key}
    >
      <Image
        src={src}
        alt={project.cover.alt}
        height={1000}
        width={1000}
        loading="lazy"
        decoding="async"
        className="gallery__image"
      />
      {photoCount > 1 ? (
        <span className="gallery__count text-size-80" aria-hidden="true">
          <MultiplePages className="gallery__count-icon" strokeWidth={2} />
          {photoCount}
        </span>
      ) : null}
      {hasCaption ? (
        <>
          <div className="gallery__fade" />
          <div className="gallery__caption">
            {project.title ? <p className="gallery__caption-title text-size-100">{project.title}</p> : null}
            {meta ? <p className="gallery__caption-meta text-size-80">{meta}</p> : null}
          </div>
        </>
      ) : null}
    </button>
  )
}

function LightboxPhoto({ photo, src }) {
  const width = photo.width || FALLBACK_IMAGE_WIDTH
  const height = photo.height || FALLBACK_IMAGE_HEIGHT
  return (
    <Image
      key={src}
      src={src}
      alt={photo.alt}
      width={width}
      height={height}
      // The CSS sizes the photo from the viewport and this ratio, not from the file.
      style={{ '--gallery-photo-ratio': width / height }}
      sizes="(min-width: 768px) 84vw, 92vw"
      quality={90}
      priority
      className="gallery-lightbox__image"
      draggable={false}
    />
  )
}

function GalleryLightbox({ project, photoIndex, onOpenChange, onPrev, onNext, onCloseAutoFocus }) {
  const isOpen = project !== null
  const photo = isOpen ? project.photos[photoIndex] : null
  const count = isOpen ? project.photos.length : 0
  const src = photo ? buildSanityImageUrl(photo.image, { width: LIGHTBOX_IMAGE_WIDTH }) : ''
  const meta = isOpen ? getProjectMetaLine(project) : ''
  const hasControls = count > 1
  const swipeStartX = useRef(null)

  const handlePointerDown = useCallback((event) => {
    swipeStartX.current = event.pointerType === 'mouse' ? null : event.clientX
  }, [])

  const handlePointerUp = useCallback(
    (event) => {
      const startX = swipeStartX.current
      swipeStartX.current = null
      if (startX === null || !hasControls) {
        return
      }
      const delta = event.clientX - startX
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
        return
      }
      if (delta < 0) {
        onNext()
      } else {
        onPrev()
      }
    },
    [hasControls, onNext, onPrev],
  )

  const handlePointerCancel = useCallback(() => {
    swipeStartX.current = null
  }, [])

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="gallery-lightbox__overlay" />
        <Dialog.Content
          aria-describedby={undefined}
          className="gallery-lightbox__content"
          onCloseAutoFocus={onCloseAutoFocus}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          data-gallery-lightbox=""
        >
          <Dialog.Title className="sr-only">{project?.name || 'Gallery photo viewer'}</Dialog.Title>
          <div className="gallery-lightbox__bar">
            <div className="gallery-lightbox__bar-text">
              {project?.name ? (
                <span className="gallery-lightbox__title text-size-90">{project.name}</span>
              ) : null}
              <span className="gallery-lightbox__count text-size-90">
                <span aria-hidden="true">{`${photoIndex + 1} / ${count}`}</span>
                <span className="sr-only" aria-live="polite">{`Photo ${photoIndex + 1} of ${count}`}</span>
              </span>
            </div>
            <Dialog.Close asChild>
              <button type="button" aria-label="Close gallery" className="gallery-lightbox__button">
                <Xmark className="gallery-lightbox__button-icon" strokeWidth={2.2} />
              </button>
            </Dialog.Close>
          </div>
          {photo && src ? (
            <figure className="gallery-lightbox__figure">
              <LightboxPhoto photo={photo} src={src} />
              {photo.caption || meta ? (
                <figcaption className="gallery-lightbox__caption">
                  {photo.caption ? (
                    <p className="gallery-lightbox__caption-title text-fluid-200">{photo.caption}</p>
                  ) : null}
                  {meta ? <p className="gallery-lightbox__caption-meta text-size-80">{meta}</p> : null}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
          {hasControls ? (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={onPrev}
                className="gallery-lightbox__button gallery-lightbox__nav gallery-lightbox__nav--prev"
              >
                <NavArrowLeft className="gallery-lightbox__nav-icon" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={onNext}
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
  const projects = useMemo(() => getGalleryProjects(section), [section])
  const title = cleanRuntimeString(section?.title || '')

  // `active` is the open project + photo; `null` means the lightbox is closed.
  const [active, setActive] = useState(null)
  // The tile that opened the lightbox. Radix would hand focus to a Dialog.Trigger,
  // but the tiles open the dialog programmatically, so we restore focus ourselves.
  const openerRef = useRef(null)
  const activeProject = active === null ? null : (projects[active.projectIndex] ?? null)
  const photoIndex = active?.photoIndex ?? 0
  const activeCount = activeProject?.photos.length ?? 0

  const handleOpenChange = useCallback((open) => {
    if (!open) {
      setActive(null)
    }
  }, [])

  const openProject = useCallback((event, projectIndex) => {
    openerRef.current = event.currentTarget
    setActive({ projectIndex, photoIndex: 0 })
  }, [])

  const handleCloseAutoFocus = useCallback((event) => {
    event.preventDefault()
    openerRef.current?.focus({ preventScroll: true })
    openerRef.current = null
  }, [])

  const step = useCallback(
    (direction) => {
      setActive((current) => {
        if (current === null) {
          return current
        }
        const count = projects[current.projectIndex]?.photos.length ?? 0
        if (count < 2) {
          return current
        }
        return { ...current, photoIndex: wrapIndex(current.photoIndex + direction, count) }
      })
    },
    [projects],
  )

  const handlePrev = useCallback(() => step(-1), [step])
  const handleNext = useCallback(() => step(1), [step])

  useEffect(() => {
    if (activeProject === null) {
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
  }, [activeProject, handlePrev, handleNext])

  // Warm the neighbouring photos so arrowing through a project feels instant.
  useEffect(() => {
    if (activeProject === null || activeCount < 2) {
      return
    }
    const neighbours = [wrapIndex(photoIndex + 1, activeCount), wrapIndex(photoIndex - 1, activeCount)]
    for (const index of neighbours) {
      const src = buildSanityImageUrl(activeProject.photos[index].image, { width: LIGHTBOX_IMAGE_WIDTH })
      if (src) {
        const img = new window.Image()
        img.src = src
      }
    }
  }, [activeProject, activeCount, photoIndex])

  if (projects.length === 0) {
    return null
  }

  const photoCount = countGalleryPhotos(projects)
  const trace = `gallery section with ${projects.length} projects, ${photoCount} photos`

  return (
    <section
      className="gallery section-shell"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/gallery-section.jsx',
        content: trace,
      })}
    >
      <DevTrace markup="src/components/platform/sections/gallery-section.jsx" content={trace} />
      <div className="section-shell__inner">
        <GalleryHeader section={{ ...section, title }} />
        <div className="gallery__grid">
          {projects.map((project, index) => (
            <ProjectTile
              key={project.key}
              project={project}
              index={index}
              onClick={(event) => openProject(event, index)}
            />
          ))}
        </div>
      </div>
      <GalleryLightbox
        project={activeProject}
        photoIndex={photoIndex}
        onOpenChange={handleOpenChange}
        onPrev={handlePrev}
        onNext={handleNext}
        onCloseAutoFocus={handleCloseAutoFocus}
      />
    </section>
  )
}
