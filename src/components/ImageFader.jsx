'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function ImageFader({
  images = [
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
  ],
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
    if (!isInteractive) {
      return undefined
    }

    if (count < 2) {
      return undefined
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setIndex((i) => (i + 1) % count), interval)
    return () => timer.current && clearTimeout(timer.current)
  }, [count, index, interval, isInteractive])

  if (!count) return null

  const cur = images[index]

  const variants = {
    initial: {
      opacity: 0,
      filter: 'blur(10px)',
    },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: {
      opacity: 0.5,
      filter: 'blur(10px)',
    },
  }

  const staticImage = (
    <Image
      src={cur.src}
      alt={cur.alt ?? ''}
      fill
      sizes="100vw"
      quality={68}
      priority={initialPriority && index === 0}
      fetchPriority={initialPriority && index === 0 ? 'high' : 'auto'}
      className="object-cover"
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition,
        pointerEvents: 'none',
        backgroundColor: backgroundColor,
      }}
    />
  )

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
      {isInteractive ? (
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={index}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: 'tween',
              duration: fadeSec,
            }}
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
            {staticImage}
          </motion.div>
        </AnimatePresence>
      ) : (
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
          {staticImage}
        </div>
      )}

      {showOverlay && (overlayBlur > 0 || overlayColor !== 'rgba(0,0,0,0)') && (
        <div
          aria-hidden="true"
          style={{
            ...overlayStyle,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            backgroundImage: overlayStyle?.backgroundImage
              ? overlayStyle.backgroundImage
              : useGradient
                ? `linear-gradient(to bottom, transparent 0%, ${overlayColor} 80%)`
                : undefined,
            backgroundColor: overlayStyle?.backgroundImage
              ? overlayStyle?.backgroundColor
              : useGradient
                ? undefined
                : overlayColor,
            backdropFilter: overlayBlur > 0 ? `blur(${overlayBlur}px)` : undefined,
            borderRadius,
            zIndex: 2,
          }}
        />
      )}
    </div>
  )
}
