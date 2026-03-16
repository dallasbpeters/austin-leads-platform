'use client'

import { useEffect, useRef, useState } from 'react'

const defaultLeadingWords = ['Protect', 'your', 'home', 'and', 'lower', 'monthly', 'costs', 'with']

const SolarSwitch = ({
  leadingWords = defaultLeadingWords,
  accentWord = 'solar',
  trailingText = 'without sacrificing roof integrity.',
}) => {
  const sectionRef = useRef(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || typeof IntersectionObserver === 'undefined') {
      return
    }

    const activationRatio = 0.72
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.intersectionRatio >= activationRatio)
      },
      {
        threshold: [0, activationRatio, 1],
        rootMargin: '0px 0px -14% 0px',
      },
    )

    observer.observe(sectionRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef} className="grid max-w-7xl w-full mx-auto px-4 py-14 lg:px-8 sm:px-3 md:px-6 grid-cols-1 place-items-center">
      <div className="relative max-w-5xl font-bold leading-[1.45em] text-[clamp(2rem,4.9vw,2.75rem)] text-center text-foreground tracking-[-0.02em]">
        {leadingWords.map((word) => (
          <span
            key={word}
            className="inline-block relative mr-2 duration-500 transition-opacity"
            style={{ opacity: isActive ? 1 : 0.45 }}
          >
            {word}
          </span>
        ))}

        <span className="relative items-center h-20 pr-4 rounded-full align-baseline inline-flex overflow-visible solar-wrapper"
        style={{
            backgroundColor: isActive ? 'var(--color-primary)' : '#CCCCCC',
            paddingRight: isActive ? '100px' : '0px',
            width: '13rem',
          }}
        >
          <span
            className="inline-block relative ml-4 pr-10 sm:pl-10 font-semibold leading-[1.45em] text-white tracking-[-0.02em] duration-500 transition-all pointer-events-none solar-text z-20"
            style={{ transform: isActive ? 'translateX(-32px)' : 'translateX(30px)' }}
          >
            {accentWord}
          </span>
          <span
            className="absolute h-8 w-8 md:h-11 md:w-11 sm:h-10 sm:w-10 rounded-full duration-500 transition-all -translate-y-1/2 left-1/2 orange-circle pointer-events-none top-1/2 z-30"
            style={{
              background: 'linear-gradient(rgb(255, 222, 107) 0%, rgb(255, 117, 17) 117.52%)',
              transform: isActive ? 'translateX(2.2rem)' : 'translateX(-5.22rem)',
              boxShadow: isActive ? '0 0 10px 0 rgb(255, 222, 107)' : '0 0 10px 0 rgba(255, 222, 107, 0.5)',
            }}
          />
        </span>

        <span
          className="ml-3 font-bold leading-[1.15] tracking-[-0.02em] duration-500 transition-opacity"
          style={{ opacity: isActive ? 0.5 : 0.15 }}
        >
          {trailingText}
        </span>
      </div>
    </section>
  )
}

export default SolarSwitch
