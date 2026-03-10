import Link from 'next/link'

import GuideCardGrid from './GuideCardGrid'
import { getFeaturedSolarGuideCards } from '@/lib/platform/guides'

const guides = getFeaturedSolarGuideCards(6)

export default function GuidesSection() {
  return (
    <section
      className="bg-solar-warm   py-24"
      id="go-deeper"
      style={{
        backgroundImage: 'linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="mx-auto w-[min(80rem,calc(100%-3rem))]">
        <div className="mb-8">
          <h2 className="type-accent text-solar-secondary m-0 text-[clamp(1.875rem,4vw,2.25rem)]">Go Deeper</h2>
        </div>
        <GuideCardGrid
          cards={guides}
          palette={['bg-solar-primary text-white', 'bg-solar-amber-400 text-white', 'bg-solar-blue-400 text-white']}
        />
        <div className="mt-8 flex justify-end">
          <Link className="type-accent text-solar-secondary text-sm font-semibold uppercase tracking-[0.18em]" href="/guides">
            Browse all guides
          </Link>
        </div>
      </div>
    </section>
  )
}
