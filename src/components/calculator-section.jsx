'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { cn } from '@/lib/utils'

import { trackAnalyticsEvent } from '@/lib/analytics/client'
import Card from './card'
import { getDevSectionAttributes } from './dev/dev-trace'
import PortableTextContent from './portable-text-content'

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
    lifetime += year1Savings * 1.025 ** year * 0.995 ** year
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
      className="solar-calculator"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/calculator-section.jsx',
        content: 'local JSX copy and local calculator logic',
      })}
    >
      <div className="solar-calculator__shell">
        <div className="solar-calculator__intro">
          <h2 className="solar-calculator__title">{title}</h2>
          <PortableTextContent as="div" value={body} className="solar-calculator__lede" />
        </div>

        <Card className="solar-calculator__panel" variant="surfaceStrong" radius="lg">
          <div className="solar-calculator__input-pane">
            <label htmlFor="calc-bill" className="solar-calculator__label">
              Your Monthly Electric Bill
            </label>
            <div className="solar-calculator__field">
              <span className="solar-calculator__currency">$</span>
              <input
                id="calc-bill"
                type="number"
                min={MIN_BILL}
                max={MAX_BILL}
                value={bill}
                onChange={(event) => setBill(clampBill(event.target.value))}
                className="solar-calculator__input"
              />
            </div>
            <Slider
              aria-label="Monthly electric bill"
              min={MIN_BILL}
              max={MAX_BILL}
              step={10}
              value={[bill]}
              onValueChange={([nextBill]) => setBill(clampBill(nextBill))}
              className="solar-calculator__slider"
            />
            <div className="solar-calculator__range-labels">
              <span>$50</span>
              <span>$800</span>
            </div>

            <div className="solar-calculator__note">
              <svg
                className="solar-calculator__note-icon"
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

          <div className="solar-calculator__results">
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

            <div className="solar-calculator__actions">
              <Button
                href={ctaHref}
                size="md"
                shape="pill"
                className="solar-calculator__cta"
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
              <span className="solar-calculator__cta-note">{ctaNote}</span>
            </div>
          </div>
        </Card>
      </div>
      <div className="solar-calculator__backdrop solar-grid-bg" aria-hidden="true" />
    </section>
  )
}

function ResultCard({ title, value, prefix = '', suffix = '', detail, accent = false }) {
  return (
    <Card className={cn('solar-calculator__result', accent && 'solar-calculator__result--accent')}>
      <span className="solar-calculator__result-title">{title}</span>
      <div className="solar-calculator__result-value">
        {prefix ? <span className="solar-calculator__result-unit">{prefix}</span> : null}
        <span className="solar-calculator__result-number">{value}</span>
        {suffix ? <span className="solar-calculator__result-unit">{suffix}</span> : null}
      </div>
      <p className="solar-calculator__result-detail">{detail}</p>
    </Card>
  )
}
