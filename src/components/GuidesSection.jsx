import Link from 'next/link'

import GuideCardGrid from './GuideCardGrid'
import { getDevSectionAttributes } from './dev/DevTrace'
import { getFeaturedSolarGuideCards } from '@/lib/platform/guides'

const guides = getFeaturedSolarGuideCards(3)

export default function GuidesSection({ sectionId = 'go-deeper' }) {
  return (
    <section
      className="bg-warm py-24"
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
      <div className="mx-auto w-[min(80rem,calc(100%-3rem))]">
        <div className="mb-8">
          <h2 className="type-accent text-secondary m-0 text-[clamp(1.875rem,4vw,2.25rem)]">Go Deeper</h2>
        </div>
        <GuideCardGrid
          cards={guides}
          palette={['bg-primary text-white', 'bg-secondary text-white', 'bg-tertiary text-white']}
        />
        <div className="mt-8 flex justify-end">
          <Link
            className="btn btn type-accent text-secondary text-sm font-semibold tracking-[0.18em] uppercase"
            href="/guides"
          >
            Browse all guides
          </Link>
        </div>
      </div>
    </section>
  )
}
