'use client'

import { useEffect, useRef, useState } from 'react'

const defaultLeadingWords = ['Protect', 'your', 'home', 'and', 'lower', 'monthly', 'costs', 'with']

const SolarSwitch = ({
  leadingWords = defaultLeadingWords,
  accentWord = 'solar',
  trailingText = 'without sacrificing roof integrity.',
}) => {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [textWidth, setTextWidth] = useState(0)

  const circleSize = 32
  const gap = 12
  const horizontalPadding = 16
  const wrapperHeight = 70
  const wrapperWidth = Math.max(textWidth, 1) + circleSize + gap + horizontalPadding * 2
  const textTranslateX = isActive ? 0 : circleSize + gap
  const circleTranslateX = isActive ? textWidth + gap : 0

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') {
      return
    }

    let rafId = 0
    const activationLineRatio = 0.6
    const handleScroll = () => {
      if (rafId) {
        return
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        const top = sectionRef.current?.getBoundingClientRect().top
        if (typeof top !== 'number') {
          return
        }
        const activationLine = window.innerHeight * activationLineRatio
        setIsActive(top <= activationLine)
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  useEffect(() => {
    if (!textRef.current || typeof ResizeObserver === 'undefined') {
      return
    }

    const measure = () => {
      setTextWidth(Math.ceil(textRef.current?.getBoundingClientRect().width || 0))
    }

    measure()

    const resizeObserver = new ResizeObserver(() => {
      measure()
    })

    resizeObserver.observe(textRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [accentWord])

  return (
    <section
      ref={sectionRef}
      className="mx-auto grid w-full max-w-7xl grid-cols-1 place-items-center px-4 py-14 sm:px-3 md:px-6 lg:px-8"
    >
      <div className="text-foreground relative max-w-5xl text-center text-[clamp(2rem,4.9vw,2.75rem)] leading-[1.25em] font-bold tracking-[-0.02em]">
        {leadingWords.map((word) => (
          <span
            key={word}
            className="relative mr-2 inline-block transition-opacity duration-500"
            style={{ opacity: isActive ? 1 : 0.45 }}
          >
            {word}
          </span>
        ))}

        <span
          className="solar-wrapper relative inline-flex overflow-hidden rounded-full align-middle leading-none transition-colors duration-500"
          style={{
            backgroundColor: isActive ? 'var(--color-primary)' : '#CCCCCC',
            width: `${wrapperWidth}px`,
            height: `${wrapperHeight}px`,
            verticalAlign: '-0.48em',
          }}
        >
          <span
            ref={textRef}
            className="leading- solar-text pointer-events-none absolute top-1/2 left-4 z-20 inline-block whitespace-nowrap font-semibold tracking-[-0.02em] text-white transition-transform duration-500"
            style={{
              transform: `translate(${textTranslateX}px, -50%)`,
            }}
          >
            {accentWord}
          </span>
          <span
            className="orange-circle pointer-events-none absolute top-1/2 left-4 z-30 block rounded-full transition-transform duration-500"
            style={{
              background: 'linear-gradient(rgb(255, 222, 107) 0%, rgb(255, 117, 17) 117.52%)',
              transform: `translate(${circleTranslateX}px, -50%)`,
              boxShadow: isActive ? '0 0 10px 0 rgb(255, 222, 107)' : '0 0 10px 0 rgba(255, 222, 107, 0.5)',
              width: `${circleSize}px`,
              height: `${circleSize}px`,
            }}
          />
        </span>
        <span
          className="ml-3 inline-block align-middle font-bold tracking-[-0.02em] transition-opacity duration-500"
          style={{
            opacity: isActive ? 0.5 : 0.15,
            verticalAlign: '-0.08em',
          }}
        >
          {trailingText}
        </span>
      </div>
    </section>
  )
}

export default SolarSwitch
