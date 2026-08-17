'use client'

import { useEffect, useRef } from 'react'

import Image from 'next/image'

import { cn } from '@/lib/utils'

import { useCloudTone } from './use-cloud-tone'

const cloudPositionsByDensity = {
  subtle: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'],
  regular: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  thick: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
}

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)

/**
 * Calculates the scale for a cloud layer as its parent section passes through
 * the viewport, producing the same grow-and-recede scroll response as the demo.
 *
 * @param {DOMRect} sectionBounds - Visible geometry for the cloud section.
 * @param {number} viewportHeight - Current viewport height in pixels.
 * @returns {number} A scroll-responsive cloud scale.
 */
const getScrollScale = (sectionBounds, viewportHeight) => {
  const travelDistance = viewportHeight + sectionBounds.height
  const progress = clamp((viewportHeight - sectionBounds.top) / travelDistance, 0, 1)

  return 0.86 + Math.sin(progress * Math.PI) * 0.3
}

/**
 * Renders an ambient, non-interactive cloud layer behind a section's content.
 * The layer uses a single local sprite and is safe to insert into any
 * `relative overflow-hidden` section whose content is raised above it. The
 * default tone follows the visitor's local clock and updates hourly.
 *
 * @param {{ className?: string, density?: 'subtle' | 'regular' | 'thick', tone?: 'auto' | 'day' | 'dusk' | 'night' }} props - Visual treatment for the cloud layer.
 * @returns {JSX.Element} A decorative cloud background.
 */
export default function CloudBackground({ className, density = 'subtle', tone = 'auto' }) {
  const cloudLayerRef = useRef(null)
  const resolvedTone = useCloudTone(tone)
  const cloudPositions = cloudPositionsByDensity[density] || cloudPositionsByDensity.subtle

  useEffect(() => {
    const cloudLayer = cloudLayerRef.current
    const section = cloudLayer?.parentElement

    if (!cloudLayer || !section) {
      return undefined
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame = 0

    const updateScrollScale = () => {
      if (reducedMotionQuery.matches) {
        cloudLayer.style.setProperty('--cloud-scroll-scale', '1')
        return
      }

      const scrollScale = getScrollScale(section.getBoundingClientRect(), window.innerHeight)

      cloudLayer.style.setProperty('--cloud-scroll-scale', scrollScale.toFixed(3))
    }

    const scheduleScrollScaleUpdate = () => {
      if (animationFrame) {
        return
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0
        updateScrollScale()
      })
    }

    updateScrollScale()
    window.addEventListener('scroll', scheduleScrollScaleUpdate, { passive: true })
    window.addEventListener('resize', scheduleScrollScaleUpdate)
    reducedMotionQuery.addEventListener('change', scheduleScrollScaleUpdate)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', scheduleScrollScaleUpdate)
      window.removeEventListener('resize', scheduleScrollScaleUpdate)
      reducedMotionQuery.removeEventListener('change', scheduleScrollScaleUpdate)
    }
  }, [])

  return (
    <div
      ref={cloudLayerRef}
      aria-hidden="true"
      className={cn(
        'cloud-background',
        `cloud-background--${density}`,
        `cloud-background--${resolvedTone}`,
        className,
      )}
    >
      {cloudPositions.map((position) => (
        <span key={position} className={`cloud-background__cloud cloud-background__cloud--${position}`}>
          <span className="cloud-background__scroll">
            <span className="cloud-background__breathe">
              <span className="cloud-background__motion">
                <Image alt="" src="/clouds/cloud-sprite.png" width={256} height={256} sizes="30vw" />
              </span>
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}
