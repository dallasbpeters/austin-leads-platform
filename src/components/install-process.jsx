'use client'

import Lottie from 'lottie-react'
import { useEffect, useRef, useState } from 'react'

import PortableTextContent from '@/components/portable-text-content'

const ANIMATION_PATH = '/lottie/ion-house.json'
const ASPECT_RATIO = '1244 / 700'
const SCRUB_START_VIEWPORT_RATIO = 0.85
const SCRUB_END_VIEWPORT_RATIO = 0.15

const getTargetFrame = (progress, animationData) => {
  if (!animationData) {
    return 0
  }

  const firstFrame = animationData.ip ?? 0
  const lastFrame = (animationData.op ?? firstFrame + 1) - 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1)

  return Math.round(firstFrame + clampedProgress * Math.max(lastFrame - firstFrame, 0))
}

const InstallProcess = ({ eyebrow, title, body, className, ...props }) => {
  const sectionRef = useRef(null)
  const lottieRef = useRef(null)
  const initialProgressRef = useRef(null)
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    if (animationData) {
      return
    }

    let cancelled = false
    const loadAnimation = async () => {
      try {
        const response = await fetch(ANIMATION_PATH)
        const data = await response.json()
        if (!cancelled) {
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
  }, [animationData])

  useEffect(() => {
    if (!animationData || !lottieRef.current || !sectionRef.current) {
      return
    }

    const anim = lottieRef.current
    const sectionElement = sectionRef.current
    let rafId = null

    const getScrollProgress = () => {
      const rect = sectionElement.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const start = viewportHeight * SCRUB_START_VIEWPORT_RATIO
      const end = viewportHeight * SCRUB_END_VIEWPORT_RATIO
      const total = Math.max(rect.height + start - end, 1)
      const traveled = Math.min(Math.max(start - rect.top, 0), total)

      return traveled / total
    }

    const updateFrame = () => {
      rafId = null
      const rawProgress = getScrollProgress()
      const initialProgress = initialProgressRef.current ?? 0
      const normalizedProgress =
        rawProgress <= initialProgress
          ? 0
          : (rawProgress - initialProgress) / Math.max(1 - initialProgress, 0.001)
      const frame = getTargetFrame(normalizedProgress, animationData)
      anim.goToAndStop(frame, true)
    }

    const requestFrameUpdate = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateFrame)
      }
    }

    initialProgressRef.current = getScrollProgress()
    requestFrameUpdate()
    window.addEventListener('scroll', requestFrameUpdate, { passive: true })
    window.addEventListener('resize', requestFrameUpdate)

    return () => {
      window.removeEventListener('scroll', requestFrameUpdate)
      window.removeEventListener('resize', requestFrameUpdate)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [animationData])

  return (
    <div className={className} {...props}>
      <div className="bg-[#000000]">
        <div className="mx-auto w-full max-w-7xl px-4 pt-38 pb-10 sm:px-6 lg:px-8">
          {eyebrow ? (
            <p className="mb-5 text-xs font-semibold tracking-[0.24em] text-white/50 uppercase">{eyebrow}</p>
          ) : null}
          {title ? (
            <h2 className="type-accent m-0 w-full text-center text-[clamp(2.25rem,4vw,4.5rem)] leading-[0.95] font-black text-white">
              {title}
            </h2>
          ) : null}
          {body ? (
            <PortableTextContent value={body} className="mt-4 text-center text-lg leading-8 text-white/60" />
          ) : null}
        </div>
      </div>
      <div ref={sectionRef} className="relative mx-auto w-full overflow-hidden bg-[#000000]">
        <div className="w-full" style={{ aspectRatio: ASPECT_RATIO }}>
          {animationData ? (
            <Lottie
              lottieRef={lottieRef}
              animationData={animationData}
              loop={false}
              autoplay={false}
              rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default InstallProcess
