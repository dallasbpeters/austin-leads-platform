'use client'

import { cva } from 'class-variance-authority'
import { useEffect, useRef, useState } from 'react'

import { cleanRuntimeString } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

import { getDevSectionAttributes } from './dev/dev-trace'

const quoteVariants = cva('quote-banner__panel', {
  variants: {
    variant: {
      default: 'quote-banner__panel--default',
      primary: 'quote-banner__panel--primary',
      secondary: 'quote-banner__panel--secondary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const DEFAULT_QUOTE_TEXT =
  'We are dedicated to serving our neighbors with uncompromising integrity. We strive to honor the Lord in all we do by delivering high-quality roofing and solar installations with transparent pricing and exceptional care.'
const DEFAULT_EYEBROW = 'TRUSTED BY HOMEOWNERS'
const DEFAULT_ATTRIBUTION = 'Texas Solar and Roofing Pros'

const STICKY_BUFFER = 100 // px to scroll past before resetting
const quoteWordColors = {
  default: {
    active: 'rgb(255, 255, 255)',
    inactive: 'rgb(70, 117, 126)',
  },
  primary: {
    active: 'rgb(255 255 255)',
    inactive: 'rgb(255 255 255 / 0.38)',
  },
  secondary: {
    active: 'rgb(255, 255, 255)',
    inactive: 'rgb(255, 255, 255 / 0.38)',
  },
}

export default function QuoteSection({
  className,
  variant = 'default',
  size = 'default',
  quoteText = DEFAULT_QUOTE_TEXT,
  eyebrow = DEFAULT_EYEBROW,
  attribution = DEFAULT_ATTRIBUTION,
  sectionId = 'quote-homepage',
}) {
  const sectionRef = useRef(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const wasFullyRevealedRef = useRef(false)
  // Split per word for the reveal, so the invisible edit markers have to come off first.
  const words = String(cleanRuntimeString(quoteText) || '').split(/\s+/)
  const totalWords = words.length
  const wordColors = quoteWordColors[variant] || quoteWordColors.default

  useEffect(() => {
    const section = sectionRef.current
    const target = section?.querySelector('.quoteReveal')

    if (!section || !target) {
      return
    }

    const updateWordReveal = () => {
      const rect = target.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      // Check if element is completely out of viewport (with buffer)
      const isPastViewport = rect.bottom < -STICKY_BUFFER
      const isBeforeViewport = rect.top > vh + STICKY_BUFFER

      if (wasFullyRevealedRef.current) {
        // Once fully revealed, stay revealed unless completely out of view
        if (isPastViewport || isBeforeViewport) {
          wasFullyRevealedRef.current = false
          setRevealedCount(0)
        }
        // Otherwise keep all words revealed - do nothing
        return
      }

      // Calculate reveal progress based on how far into viewport
      // Start revealing when top enters viewport, complete when element is ~40% from top
      const revealStart = vh // Element top at bottom of viewport
      const revealEnd = vh * 0.4 // Element top at 40% from top

      // How far through the reveal zone (0 = just entered, 1 = fully revealed)
      const progress = Math.max(0, Math.min(1, (revealStart - rect.top) / (revealStart - revealEnd)))
      const targetWords = Math.floor(progress * totalWords)

      if (targetWords >= totalWords) {
        wasFullyRevealedRef.current = true
        setRevealedCount(totalWords)
      } else {
        setRevealedCount(targetWords)
      }
    }

    window.addEventListener('scroll', updateWordReveal, { passive: true })
    window.addEventListener('resize', updateWordReveal)
    updateWordReveal()

    return () => {
      window.removeEventListener('scroll', updateWordReveal)
      window.removeEventListener('resize', updateWordReveal)
    }
  }, [totalWords])

  return (
    <section
      ref={sectionRef}
      className="quote-banner quoteRevealSection"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/quote-section.jsx',
        content: 'quote text passed by section or local defaults',
      })}
    >
      <div data-variant={variant} className={cn(quoteVariants({ variant, size, className }))}>
        <div className="quote-banner__eyebrow-row">
          <span className="quote-banner__eyebrow text-size-80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="quote-banner__eyebrow-icon"
              aria-hidden="true"
            >
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
            {eyebrow}
          </span>
        </div>

        <div className="quoteReveal quote-banner__reveal">
          <p className="quote-banner__text text-fluid-500">
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="quote-banner__word"
                style={{ color: index < revealedCount ? wordColors.active : wordColors.inactive }}
              >
                {word}
                {index < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>

        <div className="quote-banner__attribution text-size-100">
          <span>{attribution}</span>
        </div>
      </div>
    </section>
  )
}
