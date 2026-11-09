'use client'

import Image from '@/components/site-image'
import { NavArrowRight } from 'iconoir-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

import { getDevSectionAttributes } from '@/components/dev/dev-trace'
import { cn } from '@/lib/utils'

const isExternal = (href) => /^https?:\/\//u.test(href || '')

/** True when the visitor asked for less motion; videos then stay as their still photo. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}

/**
 * Big headline over a framed photo panel. Tabs (Sanity `panelTabs`) swap the
 * photo or video, eyebrow, text and button. Every photo stays mounted so they
 * cross-fade; only the active tab's video is mounted, so only one downloads.
 */
export function TabbedPanelSection({ section, sectionId }) {
  const tabs = (section?.panelTabs || []).filter((tab) => tab?.label)
  const [active, setActive] = useState(0)
  const tabRefs = useRef([])
  const baseId = useId()
  const reducedMotion = usePrefersReducedMotion()

  if (!tabs.length) {
    return null
  }

  const current = tabs[Math.min(active, tabs.length - 1)]

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (!step) {
      return
    }
    event.preventDefault()
    const next = (active + step + tabs.length) % tabs.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section
      className="tabbed-panel"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/tabbed-panel-section.jsx',
        content: 'tabbed photo panel from Sanity panelTabs',
      })}
    >
      <div className="tabbed-panel__inner">
        {section.title ? <h2 className="tabbed-panel__title">{section.title}</h2> : null}

        <div className="tabbed-panel__frame grid-frame">
          <div className="tabbed-panel__panel">
            {/* Behind the text on wide screens; its own uncropped row on phones (tabbed-panel.css). */}
            <div className="tabbed-panel__media">
              {tabs.map((tab, index) =>
                tab.imageUrl ? (
                  <Image
                    key={tab._key || index}
                    src={`${tab.imageUrl}?w=2000&auto=format`}
                    alt={index === active ? tab.imageAlt || '' : ''}
                    fill
                    sizes="(width >= 80rem) 78rem, 100vw"
                    className={cn('tabbed-panel__image', index === active && 'tabbed-panel__image--active')}
                  />
                ) : null,
              )}

              {current.videoUrl && !reducedMotion ? (
                <video
                  key={current.videoUrl}
                  className="tabbed-panel__video"
                  src={current.videoUrl}
                  poster={current.imageUrl ? `${current.imageUrl}?w=2000&auto=format` : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                />
              ) : null}
            </div>

            {tabs.length > 1 ? (
              <div className="tabbed-panel__tabs" role="tablist" aria-label={section.title || 'Panel tabs'}>
                {tabs.map((tab, index) => (
                  <button
                    key={tab._key || index}
                    ref={(node) => {
                      tabRefs.current[index] = node
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${index}`}
                    aria-selected={index === active}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={index === active ? 0 : -1}
                    className={cn('tabbed-panel__tab', index === active && 'tabbed-panel__tab--active')}
                    onClick={() => setActive(index)}
                    onKeyDown={onKeyDown}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div
              key={current._key || active}
              id={`${baseId}-panel`}
              role={tabs.length > 1 ? 'tabpanel' : undefined}
              aria-labelledby={tabs.length > 1 ? `${baseId}-tab-${active}` : undefined}
              className="tabbed-panel__content"
            >
              {current.eyebrow ? <p className="tabbed-panel__eyebrow">{current.eyebrow}</p> : null}
              {current.body ? <p className="tabbed-panel__body">{current.body}</p> : null}
              {current.href ? (
                <Link
                  href={current.href}
                  className="tabbed-panel__button"
                  {...(isExternal(current.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {current.linkLabel || 'Explore'}
                  <NavArrowRight className="tabbed-panel__button-icon" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TabbedPanelSection
