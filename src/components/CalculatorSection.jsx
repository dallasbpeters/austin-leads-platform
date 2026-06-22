'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

import Card from './Card'
import { getDevSectionAttributes } from './dev/DevTrace'
import PortableTextContent from './PortableTextContent'
import { trackAnalyticsEvent } from '@/lib/analytics/client'

const DEFAULT_BILL = 200
const MIN_BILL = 50
const MAX_BILL = 800

function clampBill(value) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return DEFAULT_BILL
  }

  return Math.min(MAX_BILL, Math.max(MIN_BILL, parsed))
}

function calculate(rawBill) {
  const bill = clampBill(rawBill)
  const rate = 0.11
  const offset = 0.85
  const sunHours = 5.5
  const performanceRatio = 0.8
  const monthlyKwh = bill / rate
  const annualKwh = monthlyKwh * 12 * offset
  const systemKw = annualKwh / (sunHours * 365 * performanceRatio)
  const panels = Math.ceil(systemKw / 0.4)
  const costPerWatt = systemKw >= 10 ? 2.45 : systemKw >= 7 ? 2.6 : systemKw >= 5 ? 2.75 : 2.95
  const fixedCosts = 1800
  const grossCost = systemKw * 1000 * costPerWatt + fixedCosts
  const localRebate = systemKw >= 8 ? 2500 : systemKw >= 6 ? 1800 : 1200
  const netCost = Math.max(grossCost - localRebate, 0)
  const year1Savings = annualKwh * rate
  const monthlySavings = year1Savings / 12
  const payback = year1Savings > 0 ? netCost / year1Savings : 0

  let lifetime = 0
  for (let year = 0; year < 25; year += 1) {
    lifetime += year1Savings * Math.pow(1.025, year) * Math.pow(0.995, year)
  }

  return {
    systemKw: systemKw.toFixed(1),
    panels,
    year1: Math.round(year1Savings).toLocaleString(),
    monthly: `$${Math.round(monthlySavings)}`,
    lifetime: Math.round(lifetime).toLocaleString(),
    payback: payback.toFixed(1),
  }
}

const fallbackCards = [
  {
    title: 'System Size',
    detail: '~panels sized for your roof',
    suffix: 'kW',
  },
  {
    title: 'Year 1 Savings',
    detail: 'Avg monthly savings back in your pocket',
    prefix: '$',
  },
  {
    title: '25-Year Savings',
    detail: 'With 2.5% annual rate increase',
    prefix: '$',
    accent: true,
  },
  {
    title: 'Payback Period',
    detail: 'After available local rebates',
    suffix: 'years',
    accent: true,
  },
]

export default function CalculatorSection({ section = null, sectionId = 'solar-calculator' }) {
  const [bill, setBill] = useState(DEFAULT_BILL)
  const results = useMemo(() => calculate(bill), [bill])
  const title = section?.title || 'See what solar could save'
  const body =
    section?.body ||
    "Enter your average monthly electric bill and we'll estimate system size, possible savings, and a likely payback range. Solar stands on its own here, even when roofing decisions affect the bigger project."
  const disclaimer =
    section?.subtitle ||
    'Based on typical Texas residential production assumptions and current utility-rate ranges'
  const ctaLabel = section?.ctaLabel || 'Talk through your solar options'
  const ctaHref = section?.ctaHref || '#estimate'
  const ctaNote = section?.eyebrow || 'Free estimate · No commitment · Takes 2 minutes'
  const cards = fallbackCards.map((card, index) => ({
    ...card,
    title: section?.items?.[index]?.title || card.title,
    detail: portableTextToPlainText(section?.items?.[index]?.body) || card.detail,
  }))

  return (
    <section
      className="bg-warm relative overflow-hidden py-24"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/CalculatorSection.jsx',
        content: 'local JSX copy and local calculator logic',
      })}
    >
      <div
        className="absolute top-0 right-0 h-240 w-lg translate-x-1/2 -translate-y-1/2 rounded-full blur-[48px]"
        style={{ background: 'hsl(var(--color-primary-h) var(--color-primary-s) 72% / 0.1)' }}
      ></div>
      <div
        className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full blur-[48px]"
        style={{ background: 'hsl(calc(var(--color-primary-h) + 16) 80% 70% / 0.14)' }}
      ></div>
      <div className="relative z-1 mx-auto w-[min(72rem,calc(100%-3rem))]">
        <div className="mb-14 text-center">
          <h2 className="text-foreground type-display m-0 text-[clamp(2.875rem,4vw,4.25rem)]">{title}</h2>
          <PortableTextContent
            as="div"
            value={body}
            className="text-foreground mx-auto mt-3 max-w-208 text-[1rem]"
          />
        </div>

        <Card
          className="grid grid-cols-[minmax(280px,2fr)_minmax(320px,3fr)] overflow-hidden shadow-md max-[900px]:grid-cols-1"
          variant="surfaceStrong"
          radius="lg"
        >
          <div className="flex flex-col justify-center bg-[linear-gradient(to_bottom_right,var(--color-cyan-950),var(--color-cyan-900))] p-8 text-white">
            <label
              htmlFor="calc-bill"
              className="mb-3 block text-sm font-bold tracking-[0.15em] text-[rgba(103,232,249,0.7)] uppercase"
            >
              Your Monthly Electric Bill
            </label>
            <div className="relative mb-6">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-2xl font-semibold text-white/60">
                $
              </span>
              <input
                id="calc-bill"
                type="number"
                min={MIN_BILL}
                max={MAX_BILL}
                value={bill}
                onChange={(event) => setBill(clampBill(event.target.value))}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-4 pl-10 text-[1.875rem] font-semibold text-white outline-none"
              />
            </div>
            <Slider
              aria-label="Monthly electric bill"
              min={MIN_BILL}
              max={MAX_BILL}
              step={10}
              value={[bill]}
              onValueChange={([nextBill]) => setBill(clampBill(nextBill))}
              className="mb-4"
            />
            <div className="flex justify-between text-sm font-medium text-[rgba(103,232,249,0.5)]">
              <span>$50</span>
              <span>$800</span>
            </div>

            <div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-6 text-sm text-[rgba(103,232,249,0.6)]">
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                ></path>
              </svg>
              {portableTextToPlainText(disclaimer)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 max-sm:grid-cols-1 md:gap-6 md:p-8">
            <ResultCard
              title={cards[0].title}
              value={results.systemKw}
              suffix={cards[0].suffix}
              detail={cards[0].detail.replace(
                '~panels sized for your roof',
                `~${results.panels} panels on your roof`,
              )}
            />
            <ResultCard
              title={cards[1].title}
              value={results.year1}
              prefix={cards[1].prefix}
              detail={
                cards[1].detail === fallbackCards[1].detail
                  ? `Avg ${results.monthly}/mo back in your pocket`
                  : cards[1].detail
              }
            />
            <ResultCard
              title={cards[2].title}
              value={results.lifetime}
              prefix={cards[2].prefix}
              detail={cards[2].detail}
              accent={cards[2].accent}
            />
            <ResultCard
              title={cards[3].title}
              value={results.payback}
              suffix={cards[3].suffix}
              detail={cards[3].detail}
              accent={cards[3].accent}
            />

            <div className="col-span-full mt-2 flex flex-wrap items-center gap-4">
              <Button
                href={ctaHref}
                size="md"
                shape="pill"
                className="w-full max-w-72"
                onClick={() =>
                  trackAnalyticsEvent('calculator_cta_click', {
                    cta_label: ctaLabel,
                    cta_href: ctaHref,
                    bill_amount: bill,
                    system_size_kw: results.systemKw,
                    page_path: typeof window !== 'undefined' ? window.location.pathname : '/unknown',
                  })
                }
              >
                {ctaLabel}
              </Button>
              <span className="text-sm text-slate-700">{ctaNote}</span>
            </div>
          </div>
        </Card>
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      ></div>
    </section>
  )
}

function ResultCard({ title, value, prefix = '', suffix = '', detail, accent = false }) {
  return (
    <Card className={`bg-card p-5 ${accent ? 'ring-primary/10 ring-1' : ''}`}>
      <span className="text-sm font-bold tracking-[0.08em] text-slate-700 uppercase">{title}</span>
      <div className="text-foreground mt-2 flex items-baseline gap-1 text-[1.875rem] font-bold">
        {prefix ? <span className="text-sm font-medium text-slate-700">{prefix}</span> : null}
        <span>{value}</span>
        {suffix ? <span className="text-sm font-medium text-slate-700">{suffix}</span> : null}
      </div>
      <p className="mt-1.5 text-sm text-slate-700">{detail}</p>
    </Card>
  )
}
