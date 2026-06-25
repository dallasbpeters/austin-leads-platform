'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { portableTextToPlainText } from '@/lib/sanity/portableText'

import { getDevSectionAttributes } from './dev/dev-trace'

export default function StorySection({ section = null, sectionId = 'how-it-works' }) {
  const ref = useRef(null)
  const [activeWordCount, setActiveWordCount] = useState(0)
  const title = section?.title || ''
  const body =
    portableTextToPlainText(section?.body) ||
    'Most homeowners do not start with a clean, simple solar question. They start with storm damage, an aging roof, an insurance claim, or a project they do not want to get wrong. This site is built to help you understand the roofing side, the solar side, and where those decisions affect each other.'
  const emphasis =
    portableTextToPlainText(section?.subtitle) ||
    section?.subheading ||
    'Start with the issue in front of you. Get clear on the next step.'
  const bodyWords = useMemo(() => body.match(/\S+|\s+/g) || [], [body])
  const emphasisWords = useMemo(() => emphasis.match(/\S+|\s+/g) || [], [emphasis])
  const bodyParts = useMemo(() => {
    let wordIndex = 0

    return bodyWords.map((part, index) => {
      if (part.trim().length === 0) {
        return {
          key: `body-space-${index}`,
          text: part,
          wordIndex: null,
        }
      }

      const nextPart = {
        key: `body-${index}-${part}`,
        text: part,
        wordIndex,
      }
      wordIndex += 1
      return nextPart
    })
  }, [bodyWords])

  useEffect(() => {
    const container = ref.current
    if (!container) {
      return undefined
    }
    const timers = []
    const totalWordCount = bodyParts.filter((part) => part.wordIndex !== null).length

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveWordCount(0)

            for (let index = 0; index < totalWordCount; index += 1) {
              const timerId = window.setTimeout(() => {
                setActiveWordCount((current) => Math.max(current, index + 1))
              }, index * 40)
              timers.push(timerId)
            }

            observer.unobserve(container)
          }
        })
      },
      { threshold: 0.2 },
    )

    observer.observe(container)
    return () => {
      observer.disconnect()
      timers.forEach((timerId) => window.clearTimeout(timerId))
    }
  }, [bodyParts])

  return (
    <section
      className="bg-background overflow-hidden"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/story-section.jsx',
        content: section ? 'story copy from Sanity-backed homepage section' : 'local fallback story copy',
        note: 'karaoke text reveal section',
      })}
    >
      <div className="mx-auto w-[min(72rem,calc(100%-3rem))] py-32 text-center">
        {section.eyebrow ? (
          <p className="text-muted-foreground mb-2 text-[0.65rem] tracking-[0.22em] uppercase">
            {section.eyebrow}
          </p>
        ) : null}
        <p
          ref={ref}
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
        </p>
      </div>
    </section>
  )
}
