import { FastArrowRight } from 'iconoir-react'
import Link from 'next/link'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { cleanRuntimeHref } from '@/lib/sanity/stega'

export function HailMapSection({ section, sectionId }) {
  const ctaLabel = section?.ctaLabel || 'Open interactive hail map'
  const ctaHref = section?.ctaHref?.startsWith('/') ? cleanRuntimeHref(section.ctaHref) : '/hail-map'

  return (
    <section
      className="hail-map-cta"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/hail-map-section.jsx',
        content: `hail lookup section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/hail-map-section.jsx"
        content={`hail lookup section from ${section?._type || 'page section'}`}
      />
      <div className="hail-map-cta__inner">
        <Link href={ctaHref} className="hail-map-cta__panel">
          <div className="hail-map-cta__layout">
            <div className="hail-map-cta__copy">
              <h2 className="hail-map-cta__title text-fluid-400">
                {section?.title || 'Check hail risk and recent storm signals near your property'}
              </h2>
              {section?.body ? (
                <PortableTextContent as="div" value={section.body} className="hail-map-cta__body" />
              ) : (
                <p className="hail-map-cta__body">
                  Open the dedicated hail map page to search your address and compare storm evidence with your
                  roof inspection.
                </p>
              )}
            </div>
            <div className="hail-map-cta__pill text-size-90">
              {ctaLabel}
              <FastArrowRight className="hail-map-cta__pill-icon" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
