'use client'

import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import PortableTextContent from '@/components/portable-text-content'
import { Button } from '@/components/ui/button'

/*
 * The Detach & Reset story as rendered frames (scripts/house-animation), drawn
 * to a canvas from the scroll position: panels come off and stack, a new roof
 * sweeps across, the panels go back on. Frames are plain images, so the
 * licensed 3D model itself never reaches the browser.
 */
const FRAME_COUNT = 96
const framePath = (index) => `/animations/detach-reset/frame-${String(index + 1).padStart(3, '0')}.webp`
// Extra scroll distance (beyond one viewport) used to scrub the animation. The
// taller this is, the slower/smoother the playback as the section is pinned.
const SCRUB_HEIGHT = '300vh'

/** Every 8th frame first, so a rough version plays early, then the rest. */
const loadOrder = () => {
  const coarse = Array.from({ length: Math.ceil(FRAME_COUNT / 8) }, (_, i) => i * 8)
  const rest = Array.from({ length: FRAME_COUNT }, (_, i) => i).filter((i) => i % 8)
  return [...coarse, FRAME_COUNT - 1, ...rest]
}

/** Draws the nearest loaded frame, cropped to cover the canvas like object-fit: cover. */
function drawFrame(canvas, frames, index) {
  if (!canvas) {
    return
  }
  let frame = frames[index]
  for (let step = 1; !frame?.complete && step < FRAME_COUNT; step += 1) {
    frame = frames[index - step]?.complete ? frames[index - step] : frames[index + step]
  }
  if (!frame?.complete || !frame.naturalWidth) {
    return
  }
  const { width, height } = canvas
  const scale = Math.max(width / frame.naturalWidth, height / frame.naturalHeight)
  const w = frame.naturalWidth * scale
  const h = frame.naturalHeight * scale
  canvas.getContext('2d').drawImage(frame, (width - w) / 2, (height - h) / 2, w, h)
}

const InstallProcess = ({
  eyebrow,
  title,
  body,
  ctaHref = '#consultation',
  ctaLabel = 'Get a Free Quote',
}) => {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const frames = useRef([])
  const current = useRef(0)
  const [shouldLoad, setShouldLoad] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const seekToProgress = (progress) => {
    const clamped = Math.min(Math.max(progress, 0), 1)
    current.current = Math.round(clamped * (FRAME_COUNT - 1))
    requestAnimationFrame(() => drawFrame(canvasRef.current, frames.current, current.current))
  }

  // Start loading the frames when the section nears the viewport.
  useEffect(() => {
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '800px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldLoad) {
      return
    }
    // With reduced motion, show only the finished house.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const order = reduced ? [FRAME_COUNT - 1] : loadOrder()
    for (const index of order) {
      const image = new Image()
      image.decoding = 'async'
      image.addEventListener('load', () => {
        const shown = reduced ? FRAME_COUNT - 1 : current.current
        if (Math.abs(index - shown) < 4) {
          drawFrame(canvasRef.current, frames.current, shown)
        }
      })
      image.src = framePath(index)
      frames.current[index] = image
    }
  }, [shouldLoad])

  // Keep the canvas at the screen's pixel size, and redraw when it changes.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * ratio)
      canvas.height = Math.round(canvas.clientHeight * ratio)
      drawFrame(canvas, frames.current, current.current)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Drive the current frame directly from scroll position (scroll-scrubbed playback).
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      seekToProgress(progress)
    }
  })

  return (
    <div ref={containerRef} className="relative bg-[#0b1730]" style={{ height: SCRUB_HEIGHT }}>
      {/* Header, supporting text and action buttons overlaid on top */}

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute left-[50%] z-10 w-full -translate-x-[50%] transform pt-40">
          <div className="mx-auto w-full max-w-4xl px-6 text-center">
            {eyebrow ? (
              <p className="mb-5 text-xs font-semibold tracking-[0.24em] text-white/60 uppercase">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="type-accent m-0 text-[clamp(2.25rem,4vw,4.5rem)] leading-[0.95] font-black text-white">
                {title}
              </h2>
            ) : null}
            {body ? (
              <PortableTextContent
                value={body}
                className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70"
              />
            ) : null}
            {ctaHref && ctaLabel ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button variant="outline" href={ctaHref} className="text-white">
                  {ctaLabel}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        {/* Scroll-scrubbed frames, drawn to cover the viewport */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-5 h-screen w-full"
          role="img"
          aria-label="A house with solar panels: the panels come off and are stacked, a new roof goes on, and the panels go back on."
        />
      </div>
    </div>
  )
}

export default InstallProcess
