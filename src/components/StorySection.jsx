'use client'

import { useEffect, useRef } from 'react'

export default function StorySection() {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) {
      return undefined
    }

    const wrapWords = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent?.match(/\S+|\s+/g) || []
        const fragment = document.createDocumentFragment()

        words.forEach((word) => {
          if (word.trim().length > 0) {
            const span = document.createElement('span')
            span.textContent = word
            span.className = 'solar-k-word'
            span.dataset.kWord = 'true'
            fragment.appendChild(span)
          } else {
            fragment.appendChild(document.createTextNode(word))
          }
        })

        node.replaceWith(fragment)
        return
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapWords)
      }
    }

    if (!container.querySelector('[data-k-word]')) {
      Array.from(container.childNodes).forEach(wrapWords)
      container.dataset.processed = 'true'
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const words = container.querySelectorAll('[data-k-word]')

            words.forEach((word, index) => {
              window.setTimeout(() => {
                word.classList.add('is-active')
              }, index * 40)
            })

            observer.unobserve(container)
          }
        })
      },
      { threshold: 0.2 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="overflow-hidden bg-white" id="how-it-works">
      <div className="mx-auto w-[min(72rem,calc(100%-3rem))]   py-32 text-center">
        <h2 ref={ref} className="type-accent text-color-neutral-800 m-0 text-[clamp(1.5rem,4vw,2.25rem)] tracking-[-0.02em]">
          Most homeowners do not start with a clean, simple solar question. They start with storm damage, an aging roof, an insurance claim, or a project they do not want to get wrong. This site is built to help you understand the roofing side, the solar side, and where those decisions affect each other.{' '}
          <span className="type-display text-color-neutral-400 italic">Start with the issue in front of you. Get clear on the next step.</span>
        </h2>
      </div>
    </section>
  )
}
