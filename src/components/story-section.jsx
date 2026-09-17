'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { cleanRuntimeString } from '@/lib/sanity/stega'

import { getDevSectionAttributes } from './dev/dev-trace'

export default function StorySection({ section = null, sectionId = 'how-it-works' }) {
  const textRef = useRef(null)
  const intervalRef = useRef(null)
  const [activeWordCount, setActiveWordCount] = useState(0)
  const title = section?.title || ''
  // This section reveals the copy one word at a time, so the string gets cut into
  // per-word spans. Sanity's invisible click-to-edit markers are not whitespace, so
  // the word split scatters them across spans and some spans end up holding nothing
  // but markers. The Studio overlay then fails to decode those fragments. Strip the
  // markers before splitting; the section trades click-to-edit for the word reveal.
  const body =
    cleanRuntimeString(portableTextToPlainText(section?.body)) ||
    'Tree branches, water heaters, and shock electric bills. That is where most people start. We help you sort out the rest.'
  const emphasis =
    cleanRuntimeString(portableTextToPlainText(section?.subtitle)) ||
    cleanRuntimeString(section?.subheading) ||
    'One step at a time.'

  const bodyWords = useMemo(() => body.match(/\S+|\s+/g) || [], [body])
  const emphasisWords = useMemo(() => emphasis.match(/\S+|\s+/g) || [], [emphasis])
  const bodyParts = useMemo(() => {
    let wordIndex = 0
    return bodyWords.map((part, index) => {
      if (part.trim().length === 0) {
        return { key: `body-space-${index}`, text: part, wordIndex: null }
      }
      const nextPart = { key: `body-${index}-${part}`, text: part, wordIndex }
      wordIndex += 1
      return nextPart
    })
  }, [bodyWords])
  const totalWordCount = useMemo(
    () => bodyParts.filter((part) => part.wordIndex !== null).length,
    [bodyParts],
  )

  const startAnimation = useCallback(() => {
    setActiveWordCount(0)

    intervalRef.current = setInterval(() => {
      setActiveWordCount((current) => {
        const next = current + 1
        return next >= totalWordCount ? totalWordCount : next
      })
    }, 40)
  }, [totalWordCount])

  useEffect(() => {
    const el = textRef.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startAnimation()
            observer.unobserve(el)
            break
          }
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [startAnimation])

  return (
    <section
      className="bg-background"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/story-section.jsx',
        content: section ? 'story copy from Sanity-backed homepage section' : 'local fallback story copy',
        note: 'karaoke text reveal section',
      })}
    >
      <div className="mx-auto w-[min(72rem,calc(100%-3rem))] py-32 text-center">
        {section?.eyebrow ? (
          <p className="text-muted-foreground mb-2 text-[0.65rem] tracking-[0.22em] uppercase">
            {section.eyebrow}
          </p>
        ) : null}
        <div
          ref={textRef}
          className="font-500 type-accent m-0 text-[clamp(1.5rem,4vw,2.25rem)] tracking-[-0.02em] text-neutral-800"
        >
          {title ? <strong className="block">{title}</strong> : null}
          {bodyParts.map((part) =>
            part.wordIndex !== null ? (
              <span
                key={part.key}
                className={`solar-k-word ${activeWordCount > part.wordIndex ? 'is-active' : ''}`}
              >
                {part.text}
              </span>
            ) : (
              <span key={part.key}>{part.text}</span>
            ),
          )}{' '}
          <span className="type-display font-500 text-neutral-400 italic">
            {emphasisWords.map((part, index) => (
              <span key={`emphasis-${index}-${part}`}>{part}</span>
            ))}
          </span>
        </div>
      </div>
    </section>
  )
}
