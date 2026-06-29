'use client'

import { useMotionValueEvent, useScroll } from 'framer-motion'
import Lottie from 'lottie-react'
import { useEffect, useRef, useState } from 'react'

import PortableTextContent from '@/components/portable-text-content'
import { Button } from '@/components/ui/button'

const ANIMATION_PATH = '/lottie/ion-house.json'
// Extra scroll distance (beyond one viewport) used to scrub the animation. The
// taller this is, the slower/smoother the playback as the section is pinned.
const SCRUB_HEIGHT = '300vh'

const InstallProcess = ({
  eyebrow,
  title,
  body,
  ctaHref = '#consultation',
  ctaLabel = 'Get a Free Quote',
}) => {
  const containerRef = useRef(null)
  const lottieRef = useRef(null)
  // First/last *visible* frame. The ION-House export runs to frame 62 but its only
  // layer goes out at 55, so the tail is blank — scrubbing past it would make the
  // animation vanish. We stop at the last frame that actually has content.
  const frameRange = useRef({ first: 0, last: 0 })
  const [shouldLoad, setShouldLoad] = useState(false)
  const [animationData, setAnimationData] = useState(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const seekToProgress = (progress) => {
    const anim = lottieRef.current
    const { first, last } = frameRange.current
    if (!anim || last <= first) {
      return
    }
    const clamped = Math.min(Math.max(progress, 0), 1)
    anim.goToAndStop(Math.round(first + clamped * (last - first)), true)
  }

  // Lazy-load the heavy (~10MB) animation only when the section nears the viewport.
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
    if (!shouldLoad || animationData) {
      return
    }

    let cancelled = false
    const loadAnimation = async () => {
      try {
        const response = await fetch(ANIMATION_PATH)
        const data = await response.json()
        if (!cancelled) {
          const first = data.ip ?? 0
          const layerOut = Math.max(0, ...(data.layers ?? []).map((layer) => layer.op ?? 0))
          const last = Math.min(data.op ?? first, layerOut || (data.op ?? first)) - 1
          frameRange.current = { first, last: Math.max(first, last) }
          setAnimationData(data)
        }
      } catch {
        // Leave the placeholder in place if the animation fails to load.
      }
    }

    void loadAnimation()

    return () => {
      cancelled = true
    }
  }, [shouldLoad, animationData])

  // Drive the current frame directly from scroll position (scroll-scrubbed playback).
  useMotionValueEvent(scrollYProgress, 'change', seekToProgress)

  return (
    <div ref={containerRef} className="relative bg-black" style={{ height: SCRUB_HEIGHT }}>
      {/* Header, supporting text and action buttons overlaid on top */}
      <div className="z-10 bg-[#000000] pt-40">
        <div className="mx-auto w-full max-w-4xl px-6 text-center">
          {eyebrow ? (
            <p className="mb-5 text-xs font-semibold tracking-[0.24em] text-white/60 uppercase">{eyebrow}</p>
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
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#000000]">
        {/* Scroll-scrubbed animation — contained so it always fits within the viewport */}
        <div className="absolute inset-bs-0 -inset-be-50">
          {animationData ? (
            <Lottie
              lottieRef={lottieRef}
              animationData={animationData}
              loop={false}
              autoplay={false}
              rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
              style={{ width: '100%', height: '100%' }}
              onDOMLoaded={() => seekToProgress(scrollYProgress.get())}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default InstallProcess
