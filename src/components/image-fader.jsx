// oxlint-disable no-nested-ternary
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const variants = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0.5, filter: 'blur(10px)' },
}

const FaderImage = ({ src, alt, initialPriority, index, className, objectPosition, backgroundColor }) => (
  <Image
    src={src}
    alt={alt ?? ''}
    fill
    sizes="100vw"
    quality={68}
    priority={initialPriority && index === 0}
    fetchPriority={initialPriority && index === 0 ? 'high' : 'auto'}
    className={cn('object-cover', className)}
    draggable={false}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition,
      pointerEvents: 'none',
      backgroundColor,
    }}
  />
)

const AnimatedImageSlide = ({ fadeSec, imageClassName, objectPosition, borderRadius, children }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ type: 'tween', duration: fadeSec }}
    className={cn(imageClassName)}
    draggable={false}
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition,
      borderRadius,
      pointerEvents: 'none',
      willChange: 'opacity',
    }}
  >
    {children}
  </motion.div>
)

const StaticImageSlide = ({ imageClassName, objectPosition, borderRadius, children }) => (
  <div
    className={cn(imageClassName)}
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition,
      borderRadius,
      pointerEvents: 'none',
    }}
  >
    {children}
  </div>
)

const FaderOverlay = ({
  showOverlay,
  overlayBlur,
  overlayColor,
  useGradient,
  overlayStyle,
  borderRadius,
}) => {
  if (!showOverlay) {
    return null
  }

  const hasBlur = overlayBlur > 0
  const hasColor = overlayColor !== 'rgba(0,0,0,0)'
  if (!hasBlur && !hasColor && !overlayStyle?.backgroundImage) {
    return null
  }

  const hasOwnBgImage = Boolean(overlayStyle?.backgroundImage)

  return (
    <div
      aria-hidden="true"
      style={{
        ...overlayStyle,
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        backgroundImage: hasOwnBgImage
          ? overlayStyle.backgroundImage
          : useGradient
            ? `linear-gradient(to bottom, transparent 0%, ${overlayColor} 80%)`
            : undefined,
        backgroundColor: hasOwnBgImage
          ? overlayStyle?.backgroundColor
          : useGradient
            ? undefined
            : overlayColor,
        backdropFilter: hasBlur ? `blur(${overlayBlur}px)` : undefined,
        borderRadius,
        zIndex: 2,
      }}
    />
  )
}
const DEFAULT_IMAGES = [
  {
    src: 'https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg',
    alt: 'Gradient 1',
  },
  {
    src: 'https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg',
    alt: 'Gradient 2',
  },
  {
    src: 'https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg',
    alt: 'Gradient 3',
  },
]

export default function ImageFader({
  images = DEFAULT_IMAGES,
  interval = 3500,
  fadeDuration = 600,
  borderRadius = '24px',
  overlayColor = 'rgba(0,0,0,0.35)',
  backgroundColor,
  overlayBlur = 0,
  showOverlay = true,
  useGradient = true,
  objectPosition = 'center',
  className,
  imageClassName,
  overlayStyle,
  style,
  initialPriority = false,
}) {
  const [index, setIndex] = useState(0)
  const [isInteractive, setIsInteractive] = useState(false)
  const timer = useRef()

  const fadeSec = Math.max(0, Number(fadeDuration)) / 1000
  const count = images.length

  useEffect(() => {
    setIsInteractive(true)
  }, [])

  useEffect(() => {
    if (!isInteractive || count < 2) {
      return
    }

    if (timer.current) {
      clearTimeout(timer.current)
    }
    timer.current = window.setTimeout(() => setIndex((i) => (i + 1) % count), interval)
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [count, index, interval, isInteractive])

  if (!count) {
    return null
  }

  const cur = images[index]

  return (
    <div
      aria-label="Fading slideshow"
      className={cn(className)}
      style={{
        ...style,
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        minWidth: 100,
        minHeight: 100,
        borderRadius,
        backgroundColor,
      }}
    >
      <AnimatePresence initial={false} mode="wait">
        {isInteractive ? (
          <AnimatedImageSlide
            key={index}
            fadeSec={fadeSec}
            imageClassName={imageClassName}
            objectPosition={objectPosition}
            borderRadius={borderRadius}
          >
            <FaderImage
              src={cur.src}
              alt={cur.alt}
              initialPriority={initialPriority}
              index={index}
              className={imageClassName}
              objectPosition={objectPosition}
              backgroundColor={backgroundColor}
            />
          </AnimatedImageSlide>
        ) : (
          <StaticImageSlide
            imageClassName={imageClassName}
            objectPosition={objectPosition}
            borderRadius={borderRadius}
          >
            <FaderImage
              src={cur.src}
              alt={cur.alt}
              initialPriority={initialPriority}
              index={0}
              className={imageClassName}
              objectPosition={objectPosition}
              backgroundColor={backgroundColor}
            />
          </StaticImageSlide>
        )}
      </AnimatePresence>
      <FaderOverlay
        showOverlay={showOverlay}
        overlayBlur={overlayBlur}
        overlayColor={overlayColor}
        useGradient={useGradient}
        overlayStyle={overlayStyle}
        borderRadius={borderRadius}
      />
    </div>
  )
}
