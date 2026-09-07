'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import PortableTextContent from '@/components/portable-text-content'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { buildRuntimeKey } from '@/lib/sanity/stega'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function resolveStepImageSide(index, override) {
  if (override === 'left') {
    return 'left'
  }
  if (override === 'right') {
    return 'right'
  }
  return index % 2 === 0 ? 'left' : 'right'
}

function resolveStepImage(item) {
  const uploadedImage = item.imageAsset?.asset ? item.imageAsset : item.image?.asset ? item.image : null

  if (uploadedImage) {
    return {
      src: getImageUrl(uploadedImage),
      alt: getImageAlt(uploadedImage, null, item.title),
    }
  }

  return {
    src: getImageUrl(null, item.image),
    alt: getImageAlt(null, item.image, item.title),
  }
}

export default function InstallProcessTimelineClient({ items = [] }) {
  const timelineRef = useRef(null)
  const [timelineProgress, setTimelineProgress] = useState(0)

  useEffect(() => {
    const timelineElement = timelineRef.current
    if (!timelineElement) {
      return
    }

    let rafId = null

    const updateTimeline = () => {
      rafId = null
      const rect = timelineElement.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const start = viewportHeight * 0.2
      const end = rect.height + viewportHeight * 0.2
      const rawProgress = (start - rect.top) / Math.max(end - start, 1)
      setTimelineProgress(clamp(rawProgress, 0, 1))
    }

    const requestUpdate = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateTimeline)
      }
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <div ref={timelineRef} className="install-timeline">
      <div className="install-timeline__rail" />
      <div className="install-timeline__rail-fill" style={{ top: 0, height: `${timelineProgress * 100}%` }} />
      <div className="install-timeline__rail-head" style={{ top: `${timelineProgress * 100}%` }} />

      <div className="install-timeline__steps">
        {items.map((item, index) => {
          const imageSide = resolveStepImageSide(index, item.imageSide)
          const stepNumber = String(index + 1).padStart(2, '0')
          const image = resolveStepImage(item)

          return (
            <div key={buildRuntimeKey('install-step', item.title, index)} className="install-timeline__step">
              <div className="install-timeline__marker">
                <div className="install-timeline__dot" />
              </div>

              <div className={`install-timeline__media install-timeline__media--${imageSide}`}>
                {image.src ? (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="install-timeline__image"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="install-timeline__placeholder">
                    <span className="text-size-90">Image</span>
                  </div>
                )}
              </div>

              <div className={`install-timeline__copy install-timeline__copy--${imageSide}`}>
                <span className="install-timeline__step-number text-size-300">Step {stepNumber}</span>
                <h3 className="install-timeline__title text-size-400">{item.title}</h3>
                <PortableTextContent
                  as="div"
                  value={item.body}
                  className="install-timeline__body text-size-100"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
