'use client'

import {
  motion,
  useAnimationFrame,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const defaultBandColors = [
  'var(--color-secondary-950)',
  'var(--color-secondary)',
  'var(--color-secondary-700)',
  'var(--color-primary-700)',
  'var(--color-primary)',
  'var(--color-primary-alt)',
  'var(--color-primary-300)',
  'var(--color-secondary-300)',
]

const defaultScrollSpring = {
  stiffness: 100,
  damping: 26,
  mass: 1.05,
  restDelta: 0.001,
}

const instantScrollSpring = {
  stiffness: 5200,
  damping: 100,
  mass: 0.04,
  restDelta: 0.00001,
}

const defaultPointerSpring = {
  stiffness: 30,
  damping: 14,
  mass: 0.78,
}

export default function Band({
  colors = defaultBandColors,
  tint = 'var(--color-secondary-950)',
  minHeight = 2,
  maxHeight = 24,
  rotate = false,
  scrollStart = 0,
  scrollEnd = 0.8,
  reverse = false,
  autoAnimate = false,
  speed = 1,
  amplitude = 10,
  /** Smooth scroll-linked motion with inertia (AngelList-style lag on stop/start). */
  scrollMomentum = true,
  scrollSpring = null,
  pointerSpring = null,
  /** Easing for gradient stop shifts (mouse / auto); longer = more “weight”. */
  gradientShiftDurationSec = 1.38,
  className = '',
  style,
}) {
  const ref = useRef(null)
  const rectRef = useRef(null)
  const [isMounted, setIsMounted] = useState(false)
  const [time, setTime] = useState(0)
  const [mouseOffset, setMouseOffset] = useState(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useAnimationFrame((ms) => {
    if (autoAnimate) {
      setTime(ms / 1000)
    }
  })

  const { scrollYProgress } = useScroll({
    target: isMounted ? ref : undefined,
    offset: ['start end', 'end start'],
  })

  const scrollSpringConfig = scrollMomentum
    ? { ...defaultScrollSpring, ...(scrollSpring && typeof scrollSpring === 'object' ? scrollSpring : {}) }
    : instantScrollSpring
  const smoothScrollProgress = useSpring(scrollYProgress, scrollSpringConfig)

  const bands = [
    { opacity: 0.88 },
    { opacity: 0.72 },
    { opacity: 0.56 },
    { opacity: 0.38 },
    { opacity: 0.18 },
    { opacity: 0.06 },
  ]

  const height = useTransform(
    smoothScrollProgress,
    [scrollStart, scrollEnd],
    reverse ? [minHeight, maxHeight] : [maxHeight, minHeight],
  )

  const offsetSpring = useSpring(0, {
    ...defaultPointerSpring,
    ...(pointerSpring && typeof pointerSpring === 'object' ? pointerSpring : {}),
  })
  useMotionValueEvent(offsetSpring, 'change', setMouseOffset)

  function onMouseMove(event) {
    if (!rectRef.current) {
      rectRef.current = event.currentTarget.getBoundingClientRect()
    }

    const x = ((event.clientX - rectRef.current.left) / rectRef.current.width) * 100
    offsetSpring.set((x - 50) * 0.5)
  }

  function onMouseLeave() {
    offsetSpring.set(0)
  }

  const palette = colors.length ? colors : defaultBandColors
  const numStops = palette.length

  if (numStops < 2) {
    const gradientBg = numStops === 1 ? palette[0] : 'transparent'

    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          transform: rotate ? 'rotate(180deg)' : undefined,
          ...style,
        }}
      >
        {bands.map((band, index) => (
          <motion.div
            key={index}
            style={{
              position: 'relative',
              width: '100%',
              background: gradientBg,
              height,
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                display: 'block',
                background: tint,
                opacity: band.opacity,
              }}
            />
          </motion.div>
        ))}
      </div>
    )
  }

  const step = 100 / (numStops - 1)
  const autoOffset = autoAnimate ? Math.sin(time * speed) * amplitude : 0

  const stopPositions = palette.map((_, index) =>
    Math.max(0, Math.min(100, index * step + mouseOffset + autoOffset)),
  )

  const customProperties = stopPositions.reduce((accumulator, position, index) => {
    accumulator[`--stop${index}`] = `${position}%`
    return accumulator
  }, {})

  const gradEase = 'cubic-bezier(0.33, 1, 0.68, 1)'
  const gradDuration = Math.max(0.15, Number(gradientShiftDurationSec) || 1.15)
  const transitionValue = stopPositions
    .map((_, index) => `--stop${index} ${gradDuration}s ${gradEase}`)
    .join(', ')

  const gradientBg = `linear-gradient(90deg, ${palette.map((color, index) => `${color} var(--stop${index})`).join(', ')})`

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        transform: rotate ? 'rotate(180deg)' : undefined,
        ...style,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {bands.map((band, index) => (
        <motion.div
          key={index}
          style={{
            position: 'relative',
            width: '100%',
            background: gradientBg,
            height,
            ...customProperties,
            transition: transitionValue,
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'block',
              background: tint,
              opacity: band.opacity,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
