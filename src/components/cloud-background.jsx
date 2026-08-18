'use client'

import { useEffect, useRef } from 'react'

import Image from 'next/image'

import { cn } from '@/lib/utils'

import { getCloudPuffs } from './cloud-puffs'

const cloudPositionsByDensity = {
  subtle: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'],
  regular: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  thick: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
}

/* Puffs per cloud. The source technique uses 5-15 for a single hero cloud;
 * these sections carry 8-12 clouds at once, so the count is trimmed to keep
 * the composited layer total in range. */
const puffCountByDensity = { subtle: 6, regular: 5, thick: 4 }

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)

/**
 * Measures how far a cloud section has travelled through the viewport, from 0
 * the moment its top edge reaches the bottom of the screen to 1 once its
 * bottom edge clears the top. This value rises monotonically with scroll, so
 * the clouds always move in the same direction the visitor is scrolling.
 *
 * @param {DOMRect} sectionBounds - Visible geometry for the cloud section.
 * @param {number} viewportHeight - Current viewport height in pixels.
 * @returns {number} Scroll travel through the viewport, from 0 to 1.
 */
const getScrollProgress = (sectionBounds, viewportHeight) => {
  const travelDistance = viewportHeight + sectionBounds.height

  return clamp((viewportHeight - sectionBounds.top) / travelDistance, 0, 1)
}

/**
 * Converts scroll travel into a cloud scale that swells as the section reaches
 * the middle of the viewport and settles as it leaves.
 *
 * @param {number} scrollProgress - Scroll travel through the viewport, from 0 to 1.
 * @returns {number} A scroll-responsive cloud scale.
 */
const getScrollScale = (scrollProgress) => 0.46 + Math.sin(scrollProgress * Math.PI) * 0.6

/**
 * Renders an ambient, non-interactive cloud layer behind a section's content.
 * The layer uses a single local sprite and is safe to insert into any
 * `relative overflow-hidden` section whose content is raised above it. The
 * tone comes from the nearest `data-cloud-tone` ancestor, which the root
 * layout stamps from the visitor's local clock before the first paint.
 *
 * @param {{ className?: string, density?: 'subtle' | 'regular' | 'thick', tone?: 'auto' | 'day' | 'dusk' | 'night' }} props - Visual treatment for the cloud layer.
 * @returns {JSX.Element} A decorative cloud background.
 */
export default function CloudBackground({ className, density = 'subtle', tone = 'auto' }) {
  const cloudLayerRef = useRef(null)
  const cloudPositions = cloudPositionsByDensity[density] || cloudPositionsByDensity.subtle
  const puffCount = puffCountByDensity[density] || puffCountByDensity.subtle

  useEffect(() => {
    const cloudLayer = cloudLayerRef.current
    const section = cloudLayer.parentElement

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame = 0

    const updateScrollScale = () => {
      if (reducedMotionQuery.matches) {
        cloudLayer.style.setProperty('--cloud-scroll-progress', '0.5')
        cloudLayer.style.setProperty('--cloud-scroll-scale', '1')
        return
      }

      const scrollProgress = getScrollProgress(section.getBoundingClientRect(), window.innerHeight)

      cloudLayer.style.setProperty('--cloud-scroll-progress', scrollProgress.toFixed(4))
      cloudLayer.style.setProperty('--cloud-scroll-scale', getScrollScale(scrollProgress).toFixed(3))
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
      className={cn('cloud-background', `cloud-background--${density}`, className)}
      data-cloud-tone={tone !== 'auto' ? tone : undefined}
    >
      {cloudPositions.map((position) => (
        <span key={position} className={`cloud-background__cloud cloud-background__cloud--${position}`}>
          <span className="cloud-background__scroll">
            <span className="cloud-background__breathe">
              <span className="cloud-background__motion">
                <span className="cloud-background__puffs">
                  {getCloudPuffs(position, puffCount).map((puff) => (
                    <span key={puff.key} className="cloud-background__puff" style={puff.style}>
                      <Image alt="" src="/clouds/cloud-sprite.png" width={256} height={256} sizes="30vw" />
                    </span>
                  ))}
                </span>
              </span>
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}
