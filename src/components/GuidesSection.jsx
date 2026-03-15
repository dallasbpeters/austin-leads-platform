import Link from 'next/link'

import GuideCardGrid from './GuideCardGrid'
import { getDevSectionAttributes } from './dev/DevTrace'
import { getFeaturedSolarGuideCards } from '@/lib/platform/guides'

const guides = getFeaturedSolarGuideCards(3)

export default function GuidesSection({ section = null, sectionId = 'go-deeper', editAttributes = {} }) {
  const title = section?.title || 'Go Deeper'
  const body = section?.body || ''
  const ctaLabel = section?.ctaLabel || 'Browse all guides'

  return (
    <section
      className="py-24 bg-warm"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/GuidesSection.jsx',
        content: 'local JSX section + guide cards from guides library',
      })}
      style={{
        backgroundImage:
          'linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="max-w-7xl w-full mx-auto px-4">
        <div className="mb-8">
          <h2 className="m-0 text-[clamp(1.875rem,4vw,2.25rem)] text-secondary type-accent">{title}</h2>
          {body ? <p className="max-w-3xl mt-3 leading-7 text-base text-slate-600">{body}</p> : null}
        </div>
        <GuideCardGrid
          cards={guides}
          palette={['bg-primary text-white', 'bg-secondary text-white', 'bg-tertiary text-white']}
        />
        <div className="flex justify-end mt-8">
          <Link
            className="font-semibold text-secondary text-sm tracking-[0.18em] btn type-accent uppercase"
            href="/guides"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
