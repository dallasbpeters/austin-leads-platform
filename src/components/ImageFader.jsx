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
  showDots = true,
  dotColor = '#fff',
  dotActiveColor = '#111',
  objectPosition = 'center',
  className,
  imageClassName,
  overlayStyle,
  style,
}) {
  const [index, setIndex] = useState(0)
  const timer = useRef()

  const fadeSec = Math.max(0, Number(fadeDuration)) / 1000
  const count = images.length

  useEffect(() => {
    if (count < 2) {
      return undefined
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setIndex((i) => (i + 1) % count), interval)
    return () => timer.current && clearTimeout(timer.current)
  }, [count, index, interval])

  const jumpTo = (i) => {
    if (timer.current) clearTimeout(timer.current)
    setIndex(i)
  }

  if (!count) return null

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
        background: backgroundColor,
      }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={index}
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.5}}
          transition={{ duration: fadeSec, ease: 'linear' }}
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
          }}
        >
          <Image
            src={cur.src}
            alt={cur.alt ?? ''}
            fill
            className="object-cover"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition,
              pointerEvents: 'none',
              backgroundColor: backgroundColor,
              willChange: 'opacity, filter',
            }}
          />
        </motion.div>
      </AnimatePresence>

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
            background: overlayStyle?.backgroundImage
              ? undefined
              : useGradient
                ? `linear-gradient(to bottom, transparent 0%, ${overlayColor} 80%)`
                : overlayColor,
            backdropFilter: overlayBlur > 0 ? `blur(${overlayBlur}px)` : undefined,
            borderRadius,
            zIndex: 2,
          }}
        />
      )}

      {showDots && count > 1 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 20,
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            gap: 10,
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => jumpTo(i)}
              style={{
                width: 13,
                height: 13,
                borderRadius: '50%',
                background: i === index ? dotActiveColor : dotColor,
                border: 'none',
                outline: i === index ? '2px solid #111' : 'none',
                boxShadow: i === index ? '0 1px 4px rgba(0,0,0,0.22)' : 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
