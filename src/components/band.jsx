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

const bands = [
  { opacity: 0.88 },
  { opacity: 0.72 },
  { opacity: 0.56 },
  { opacity: 0.38 },
  { opacity: 0.18 },
  { opacity: 0.06 },
]

const BandWrapper = ({ containerRef, className, rotate, style, children, onMouseMove, onMouseLeave }) => (
  <div
    ref={containerRef}
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
    {children}
  </div>
)

const BandRow = ({ band, index, bandHeight, bg, customProperties, transitionValue }) => (
  <motion.div
    key={index}
    style={{
      position: 'relative',
      width: '100%',
      background: bg,
      height: bandHeight,
      ...customProperties,
      ...(transitionValue ? { transition: transitionValue } : {}),
    }}
  >
    <span
      style={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        background: band.tint,
        opacity: band.opacity,
      }}
    />
  </motion.div>
)

const SingleColorBand = ({ containerRef, palette, className, rotate, style, tint, bandHeight }) => {
  const gradientBg = palette.length === 1 ? palette[0] : 'transparent'
  const bandData = bands.map((band) => ({ ...band, tint }))

  return (
    <BandWrapper containerRef={containerRef} className={className} rotate={rotate} style={style}>
      {bandData.map((band, index) => (
        <BandRow key={index} band={band} index={index} bandHeight={bandHeight} bg={gradientBg} />
      ))}
    </BandWrapper>
  )
}

const MultiColorBand = ({
  containerRef,
  palette,
  className,
  rotate,
  style,
  tint,
  bandHeight,
  mouseOffset,
  autoAnimate,
  time,
  speed,
  amplitude,
  onMouseMove,
  onMouseLeave,
}) => {
  const numStops = palette.length
  const step = 100 / (numStops - 1)
  const autoOffset = autoAnimate ? Math.sin(time * speed) * amplitude : 0
  const stopPositions = palette.map((_, index) =>
    Math.max(0, Math.min(100, index * step + mouseOffset + autoOffset)),
  )
  const customProperties = {}
  for (const [index, position] of stopPositions.entries()) {
    customProperties[`--stop${index}`] = `${position}%`
  }
  const transitionValue = stopPositions.map((_, index) => `--stop${index} 1s ease-out`).join(', ')
  const gradientBg = `linear-gradient(90deg, ${palette.map((color, index) => `${color} var(--stop${index})`).join(', ')})`
  const bandData = bands.map((band) => ({ ...band, tint }))

  return (
    <BandWrapper
      containerRef={containerRef}
      className={className}
      rotate={rotate}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {bandData.map((band, index) => (
        <BandRow
          key={index}
          band={band}
          index={index}
          bandHeight={bandHeight}
          bg={gradientBg}
          customProperties={customProperties}
          transitionValue={transitionValue}
        />
      ))}
    </BandWrapper>
  )
}

const Band = ({
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
  className = '',
  style,
}) => {
  const containerRef = useRef(null)
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
    target: isMounted ? containerRef : undefined,
    offset: ['start end', 'end start'],
  })

  const bandHeight = useTransform(
    scrollYProgress,
    [scrollStart, scrollEnd],
    reverse ? [minHeight, maxHeight] : [maxHeight, minHeight],
    { ease: (t) => t * t * (3 - 2 * t) },
  )

  const offsetSpring = useSpring(0, { stiffness: 30, damping: 15 })
  useMotionValueEvent(offsetSpring, 'change', setMouseOffset)

  const onMouseMove = (event) => {
    if (!rectRef.current) {
      rectRef.current = event.currentTarget.getBoundingClientRect()
    }
    const x = ((event.clientX - rectRef.current.left) / rectRef.current.width) * 100
    offsetSpring.set((x - 50) * 0.5)
  }

  const onMouseLeave = () => {
    offsetSpring.set(0)
  }

  const palette = colors.length ? colors : defaultBandColors

  if (palette.length < 2) {
    return (
      <SingleColorBand
        containerRef={containerRef}
        palette={palette}
        className={className}
        rotate={rotate}
        style={style}
        tint={tint}
        bandHeight={bandHeight}
      />
    )
  }

  return (
    <MultiColorBand
      containerRef={containerRef}
      palette={palette}
      className={className}
      rotate={rotate}
      style={style}
      tint={tint}
      bandHeight={bandHeight}
      mouseOffset={mouseOffset}
      autoAnimate={autoAnimate}
      time={time}
      speed={speed}
      amplitude={amplitude}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    />
  )
}

export default Band
