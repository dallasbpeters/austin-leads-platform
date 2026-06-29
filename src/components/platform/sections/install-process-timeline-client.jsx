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
    <div ref={timelineRef} className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-6 w-px bg-black/16 md:left-1/2 md:-translate-x-1/2" />
      <div
        className="pointer-events-none absolute left-6 w-px bg-black md:left-1/2 md:-translate-x-1/2"
        style={{ top: 0, height: `${timelineProgress * 100}%` }}
      />
      <div
        className="pointer-events-none absolute left-6 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_0_8px_var(--background)] md:left-1/2"
        style={{ top: `${timelineProgress * 100}%` }}
      />

      <div className="space-y-20">
        {items.map((item, index) => {
          const imageSide = resolveStepImageSide(index, item.imageSide)
          const stepNumber = String(index + 1).padStart(2, '0')
          const image = resolveStepImage(item)

          return (
            <div
              key={buildRuntimeKey('install-step', item.title, index)}
              className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-6 gap-y-6 md:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] md:gap-x-10 lg:gap-x-16"
            >
              <div className="relative col-start-1 row-span-2 md:col-start-2 md:row-span-1">
                <div className="bg-background absolute top-6 left-6 h-5 w-5 -translate-x-1/2 rounded-full border border-black/20 md:left-1/2" />
              </div>

              <div
                className={`relative aspect-4/3 overflow-hidden rounded-2xl ${
                  imageSide === 'right' ? 'md:col-start-3 md:row-start-1' : 'md:col-start-1 md:row-start-1'
                }`}
              >
                {image.src ? (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="bg-muted flex h-full w-full items-center justify-center">
                    <span className="text-muted-foreground text-sm">Image</span>
                  </div>
                )}
              </div>

              <div
                className={`flex flex-col gap-4 pt-1 md:justify-center ${
                  imageSide === 'right' ? 'md:col-start-1 md:row-start-1' : 'md:col-start-3 md:row-start-1'
                }`}
              >
                <span className="text-primary text-2xl leading-none font-bold md:text-2xl">
                  Step {stepNumber}
                </span>
                <h3 className="text-foreground text-2xl font-semibold md:text-3xl">{item.title}</h3>
                <PortableTextContent
                  as="div"
                  value={item.body}
                  className="text-muted-foreground text-[1rem] leading-relaxed md:text-lg"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
