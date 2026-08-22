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
      className="bg-gradient border-border/60 border-b"
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
      <div className="mx-auto max-w-7xl px-3 py-10 md:px-6 lg:px-10">
        <Link
          href={ctaHref}
          className="block rounded-2xl border border-white/12 bg-[linear-gradient(90deg,oklch(from_var(--color-secondary)_14%_calc(c_*_0.57)_h),oklch(from_var(--color-secondary)_11%_calc(c_*_0.49)_h))] p-10 text-white transition-transform hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.22)] md:p-12"
        >
          <div className="grid content-end items-center justify-end gap-6 md:grid-cols-1">
            <div className="space-y-3">
              <h2 className="text-center text-2xl font-semibold tracking-normal md:text-3xl">
                {section?.title || 'Check hail risk and recent storm signals near your property'}
              </h2>
              {section?.body ? (
                <PortableTextContent
                  as="div"
                  value={section.body}
                  className="mx-auto max-w-3xl text-center leading-7 text-white/78"
                />
              ) : (
                <p className="mx-auto max-w-3xl text-center leading-7 text-white/78">
                  Open the dedicated hail map page to search your address and compare storm evidence with your
                  roof inspection.
                </p>
              )}
            </div>
            <div className="inline-flex w-fit items-center gap-3 place-self-center rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white">
              {ctaLabel}
              <FastArrowRight className="size-4" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
