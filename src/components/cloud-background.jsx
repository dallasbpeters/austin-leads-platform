'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const cloudPositionsByDensity = {
  subtle: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'],
  regular: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  thick: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
}

/*
 * Photo cloud sprites (public/clouds). Each loads from its ready-made web copies,
 * <name>-640.webp and <name>-1280.webp (scripts/optimize-cloud-sprites.mjs), not
 * through the image optimizer, which made the first view of each cloud wait
 * seconds. Width and height keep the aspect ratio. Each cloud spot gets the next
 * sprite in turn, and every third one is mirrored, so repeats are hard to spot.
 */
const CLOUD_SPRITES = [
  { name: 'cloud-sprite', width: 1934, height: 1140 },
  { name: 'cloud-sprite-1', width: 2923, height: 1202 },
  { name: 'cloud-sprite-2', width: 2247, height: 823 },
  { name: 'cloud-sprite-3', width: 2097, height: 1115 },
  { name: 'cloud-sprite-4', width: 3033, height: 1696 },
  { name: 'cloud-sprite-5', width: 1608, height: 1065 },
  { name: 'cloud-sprite-7', width: 3411, height: 1746 },
  { name: 'cloud-sprite-8', width: 1533, height: 796 },
  { name: 'cloud-sprite-9', width: 3578, height: 2874 },
  { name: 'cloud-sprite-10', width: 3113, height: 1850 },
]

const spriteSrcSet = (name) => `/clouds/${name}-640.webp 640w, /clouds/${name}-1280.webp 1280w`
// A cloud is drawn at clamp(11rem, 23vw, 24rem) and scaled 1.6x (cloud-background.css): at most ~615px.
const SPRITE_SIZES = 'min(37vw, 615px)'

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
 * The layer uses the photo sprites in public/clouds and is safe to insert into any
 * `relative overflow-hidden` section whose content is raised above it. The
 * tone comes from the nearest `data-cloud-tone` ancestor, which the root
 * layout stamps from the visitor's local clock before the first paint.
 *
 * @param {{ className?: string, density?: 'subtle' | 'regular' | 'thick', tone?: 'auto' | 'day' | 'dusk' | 'night' }} props - Visual treatment for the cloud layer.
 * @returns {JSX.Element} A decorative cloud background.
 */
export default function CloudBackground({ className, density = 'subtle', tone = 'auto', eager = false }) {
  const cloudLayerRef = useRef(null)

  /*
   * Each cloud fades in once its image has arrived, so clouds don't pop in.
   * Images that finished before this ran (from the cache) are shown at once.
   */
  useEffect(() => {
    const layer = cloudLayerRef.current
    if (!layer) {
      return
    }
    const show = (image) => {
      const cloud = image.closest('.cloud-background__cloud')
      if (cloud) {
        cloud.dataset.loaded = ''
      }
    }
    const images = [...layer.querySelectorAll('.cloud-background__sprite')]
    for (const image of images) {
      if (image.complete && image.naturalWidth) {
        show(image)
      } else {
        image.addEventListener('load', () => show(image), { once: true })
      }
    }
  }, [])
  const cloudPositions = cloudPositionsByDensity[density] || cloudPositionsByDensity.subtle

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
      {cloudPositions.map((position, index) => {
        const sprite = CLOUD_SPRITES[index % CLOUD_SPRITES.length]
        return (
          <span key={position} className={`cloud-background__cloud cloud-background__cloud--${position}`}>
            <span className="cloud-background__scroll">
              <span className="cloud-background__breathe">
                <span className="cloud-background__motion">
                  {/* oxlint-disable-next-line next/no-img-element -- ready-made WebP sizes (srcSet); the optimizer is what made clouds slow */}
                  <img
                    alt=""
                    src={`/clouds/${sprite.name}-640.webp`}
                    srcSet={spriteSrcSet(sprite.name)}
                    sizes={SPRITE_SIZES}
                    width={sprite.width}
                    height={sprite.height}
                    // Hero clouds are on screen at once; others wait until scrolled near.
                    loading={eager ? 'eager' : 'lazy'}
                    fetchPriority={eager && index < 4 ? 'high' : 'auto'}
                    decoding="async"
                    className={cn(
                      'cloud-background__sprite',
                      index % 3 === 1 && 'cloud-background__sprite--flipped',
                    )}
                  />
                </span>
              </span>
            </span>
          </span>
        )
      })}
    </div>
  )
}
