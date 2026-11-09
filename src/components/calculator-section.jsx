'use client'

import { NavArrowDown, NavArrowRight } from 'iconoir-react'
import Link from 'next/link'
import { useId, useMemo, useState } from 'react'

import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { cn } from '@/lib/utils'

import { trackAnalyticsEvent } from '@/lib/analytics/client'
import { getDevSectionAttributes } from './dev/dev-trace'
import PortableTextContent from './portable-text-content'

const YEARS = 25
const SUN_HOURS = 5.5
const PERFORMANCE_RATIO = 0.8
const PANEL_KW = 0.4
const DEGRADATION = 0.995
// Permits, design and interconnection, added when the $/watt is our tiered estimate.
const FIXED_COSTS = 1800

// The rebate comes from the electric company, never typed in. Austin Energy pays
// a fixed $4,000; Oncor's varies, so it is left out and checked at the estimate.
const UTILITIES = [
  { value: 'austin-energy', label: 'Austin Energy ($4,000 rebate)', rebate: 4000 },
  { value: 'oncor', label: 'Oncor (rebate varies)', rebate: 0 },
]

const DEFAULTS = {
  bill: 200,
  rate: 0.11,
  increase: 2.5,
  systemKw: '',
  costPerWatt: '',
  offset: 85,
  utility: 'austin-energy',
}

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return value === '' || !Number.isFinite(parsed) ? fallback : parsed
}

const tieredCostPerWatt = (kw) => (kw >= 10 ? 2.45 : kw >= 7 ? 2.6 : kw >= 5 ? 2.75 : 2.95)

function calculate(inputs) {
  const bill = Math.max(0, toNumber(inputs.bill, DEFAULTS.bill))
  const rate = Math.max(0.01, toNumber(inputs.rate, DEFAULTS.rate))
  const increase = toNumber(inputs.increase, DEFAULTS.increase) / 100
  const offset = Math.min(100, Math.max(0, toNumber(inputs.offset, DEFAULTS.offset))) / 100
  const incentives = UTILITIES.find((utility) => utility.value === inputs.utility)?.rebate ?? 0

  const yearlyKwhPerKw = SUN_HOURS * 365 * PERFORMANCE_RATIO
  const autoKw = ((bill / rate) * 12 * offset) / yearlyKwhPerKw
  const systemKw = Math.max(0, toNumber(inputs.systemKw, autoKw))
  const isAutoCost = inputs.costPerWatt === ''
  const costPerWatt = toNumber(inputs.costPerWatt, tieredCostPerWatt(systemKw))
  const grossCost = systemKw * 1000 * costPerWatt + (isAutoCost && systemKw > 0 ? FIXED_COSTS : 0)
  const netCost = Math.max(grossCost - incentives, 0)

  // Solar can't save more than the bill it replaces.
  const year1Savings = Math.min(systemKw * yearlyKwhPerKw * rate, bill * 12)

  const series = []
  let utility = 0
  let solar = netCost
  let saved = 0
  let payback = null
  for (let year = 1; year <= YEARS; year += 1) {
    const yearBill = bill * 12 * (1 + increase) ** (year - 1)
    const yearSavings = year1Savings * (1 + increase) ** (year - 1) * DEGRADATION ** (year - 1)
    utility += yearBill
    solar += yearBill - yearSavings
    if (payback === null && saved + yearSavings >= netCost) {
      payback = year - 1 + (netCost - saved) / yearSavings
    }
    saved += yearSavings
    series.push({ year, utility, solar })
  }

  return {
    systemKw,
    panels: Math.ceil(systemKw / PANEL_KW),
    grossCost,
    netCost,
    year1Savings,
    monthlySavings: year1Savings / 12,
    netSavings: utility - solar,
    payback,
    series,
  }
}

const money = (value) => `$${Math.round(value).toLocaleString('en-US')}`

const fallbackStats = {
  payback: { title: 'Payback period', detail: '(cost − incentives) ÷ savings' },
  netSavings: { title: '25-yr net savings', detail: 'vs. staying on the grid' },
  annual: { title: 'Annual savings · yr 1', detail: '' },
  system: { title: 'Auto-estimated system', detail: '' },
}

export default function CalculatorSection({ section = null, sectionId = 'solar-calculator' }) {
  const [inputs, setInputs] = useState(DEFAULTS)
  const results = useMemo(() => calculate(inputs), [inputs])
  const fieldId = useId()

  const title = section?.title || 'See what solar could save'
  const body =
    section?.body ||
    "Enter your average monthly electric bill and we'll estimate system size, possible savings, and a likely payback range."
  const disclaimer =
    portableTextToPlainText(section?.subtitle) ||
    'Based on typical Texas residential production and current utility rates. Your numbers vary by roof, usage and utility.'
  const ctaLabel = section?.ctaLabel || 'Get my exact quote'
  const ctaHref = section?.ctaHref || '#consultation'
  const ctaNote = section?.eyebrow || 'Like what you see? Get an exact quote, free and no pressure.'

  // Sanity items keep their old order: system size, year-1 savings, 25-year savings, payback.
  const itemText = (index, fallback) => ({
    title: section?.items?.[index]?.title || fallback.title,
    detail: portableTextToPlainText(section?.items?.[index]?.body) || fallback.detail,
  })
  const stats = {
    system: itemText(0, fallbackStats.system),
    annual: itemText(1, fallbackStats.annual),
    netSavings: itemText(2, fallbackStats.netSavings),
    payback: itemText(3, fallbackStats.payback),
  }

  const setField = (name) => (event) => setInputs((current) => ({ ...current, [name]: event.target.value }))

  const field = (name, label, props = {}) => (
    <div className="solar-calculator__field">
      <label htmlFor={`${fieldId}-${name}`} className="solar-calculator__label">
        {label}
      </label>
      <input
        id={`${fieldId}-${name}`}
        type="number"
        inputMode="decimal"
        value={inputs[name]}
        onChange={setField(name)}
        className="solar-calculator__input"
        {...props}
      />
    </div>
  )

  return (
    <section
      className="solar-calculator"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/calculator-section.jsx',
        content: 'Sanity copy + local calculator logic',
      })}
    >
      <div className="solar-calculator__shell">
        <div className="solar-calculator__intro">
          <h2 className="solar-calculator__title">{title}</h2>
          <PortableTextContent as="div" value={body} className="solar-calculator__lede" />
        </div>

        <div className="solar-calculator__frame grid-frame">
          <div className="solar-calculator__inputs">
            {field('bill', 'Monthly electricity bill ($)', { min: 0, step: 10 })}

            <details className="solar-calculator__advanced" open>
              <summary className="solar-calculator__summary">
                Advanced assumptions
                <NavArrowDown className="solar-calculator__summary-icon" aria-hidden="true" />
              </summary>
              <div className="solar-calculator__advanced-grid">
                {field('rate', 'Electricity rate ($/kWh)', { min: 0, step: 0.01 })}
                {field('increase', 'Annual rate increase (%)', { min: 0, step: 0.5 })}
                {field('systemKw', 'System size (kW), blank = auto', {
                  min: 0,
                  step: 0.1,
                  placeholder: 'auto',
                })}
                {field('costPerWatt', 'Installed cost ($/watt), blank = auto', {
                  min: 0,
                  step: 0.05,
                  placeholder: 'auto',
                })}
                {field('offset', '% of bill offset', { min: 0, max: 100, step: 5 })}
                <div className="solar-calculator__field">
                  <label htmlFor={`${fieldId}-utility`} className="solar-calculator__label">
                    Electric company
                  </label>
                  <select
                    id={`${fieldId}-utility`}
                    value={inputs.utility}
                    onChange={setField('utility')}
                    className="solar-calculator__input"
                  >
                    {UTILITIES.map((utility) => (
                      <option key={utility.value} value={utility.value}>
                        {utility.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="solar-calculator__hint">
                Austin Energy pays a $4,000 one-time solar rebate. Oncor rebates vary, so we leave them out
                here and check yours at your free estimate.
              </p>
            </details>

            <div className="solar-calculator__system">
              <p className="solar-calculator__eyebrow">{stats.system.title}</p>
              <p className="solar-calculator__system-value">
                {results.systemKw.toFixed(1)} kW
                <span className="solar-calculator__system-panels"> · ~{results.panels} panels</span>
              </p>
              <p className="solar-calculator__system-detail">
                Gross {money(results.grossCost)} · net {money(results.netCost)}
              </p>
            </div>
          </div>

          <div className="solar-calculator__outputs">
            <dl className="solar-calculator__stats" aria-live="polite">
              <Stat
                title={stats.payback.title}
                value={results.payback === null ? `${YEARS}+ yr` : `${results.payback.toFixed(1)} yr`}
                detail={stats.payback.detail}
              />
              <Stat
                title={stats.netSavings.title}
                value={money(results.netSavings)}
                detail={stats.netSavings.detail}
                positive={results.netSavings > 0}
              />
              <Stat title="Monthly savings · yr 1" value={money(results.monthlySavings)} />
              <Stat title={stats.annual.title} value={money(results.year1Savings)} />
            </dl>

            <CostChart series={results.series} />

            <div className="solar-calculator__cta">
              <p className="solar-calculator__cta-note">{ctaNote}</p>
              <Link
                href={ctaHref}
                className="solar-calculator__cta-button"
                onClick={() =>
                  trackAnalyticsEvent('calculator_cta_click', {
                    cta_label: ctaLabel,
                    cta_href: ctaHref,
                    bill_amount: toNumber(inputs.bill, DEFAULTS.bill),
                    system_size_kw: results.systemKw.toFixed(1),
                    page_path: typeof window !== 'undefined' ? window.location.pathname : '/unknown',
                  })
                }
              >
                {ctaLabel}
                <NavArrowRight className="solar-calculator__cta-icon" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <p className="solar-calculator__disclaimer">{disclaimer}</p>
      </div>
    </section>
  )
}

function Stat({ title, value, detail, positive = false }) {
  return (
    <div className="solar-calculator__stat">
      <dt className="solar-calculator__eyebrow">{title}</dt>
      <dd
        className={cn('solar-calculator__stat-value', positive && 'solar-calculator__stat-value--positive')}
      >
        {value}
      </dd>
      {detail ? <dd className="solar-calculator__stat-detail">{detail}</dd> : null}
    </div>
  )
}

const CHART = { width: 560, height: 240, top: 12, right: 44, bottom: 28, left: 8 }

// Rounds the axis top up to a 1, 2 or 5 step so the tick labels stay readable.
function niceStep(max, ticks = 5) {
  const raw = max / ticks
  const power = 10 ** Math.floor(Math.log10(raw || 1))
  const step = [1, 2, 5, 10].find((m) => m * power >= raw) * power
  return step
}

const shortMoney = (value) => (value >= 1000 ? `${Math.round(value / 1000)}k` : `${Math.round(value)}`)

function CostChart({ series }) {
  const [active, setActive] = useState(null)
  const titleId = useId()
  const max = Math.max(...series.map((point) => Math.max(point.utility, point.solar)), 1)
  const step = niceStep(max)
  const top = Math.ceil(max / step) * step
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step)

  const plotW = CHART.width - CHART.left - CHART.right
  const plotH = CHART.height - CHART.top - CHART.bottom
  const x = (year) => CHART.left + ((year - 1) / (YEARS - 1)) * plotW
  const y = (value) => CHART.top + plotH - (value / top) * plotH
  const path = (key) =>
    series.map((point, index) => `${index ? 'L' : 'M'}${x(point.year)},${y(point[key])}`).join(' ')

  const onPointerMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect()
    const svgX = ((event.clientX - box.left) / box.width) * CHART.width
    const year = Math.round(((svgX - CHART.left) / plotW) * (YEARS - 1)) + 1
    setActive(Math.min(YEARS, Math.max(1, year)))
  }

  const point = active ? series[active - 1] : null

  return (
    <figure className="solar-calculator__chart" aria-labelledby={titleId}>
      <figcaption className="solar-calculator__chart-head">
        <span id={titleId} className="solar-calculator__eyebrow">
          Cumulative costs
        </span>
        <span className="solar-calculator__legend" aria-hidden="true">
          <span className="solar-calculator__legend-item solar-calculator__legend-item--utility">
            Utility
          </span>
          <span className="solar-calculator__legend-item solar-calculator__legend-item--solar">Solar</span>
        </span>
      </figcaption>

      <div className="solar-calculator__plot">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="solar-calculator__svg"
          role="img"
          aria-label="What you would pay over 25 years with your utility alone and with solar."
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={CHART.left}
                x2={CHART.left + plotW}
                y1={y(tick)}
                y2={y(tick)}
                className="solar-calculator__gridline"
              />
              <text
                x={CHART.width - 4}
                y={y(tick)}
                className="solar-calculator__tick"
                textAnchor="end"
                dy="0.32em"
              >
                {shortMoney(tick)}
              </text>
            </g>
          ))}
          {[1, 5, 10, 15, 20, 25].map((year) => (
            <text
              key={year}
              x={x(year)}
              y={CHART.height - 6}
              className="solar-calculator__tick"
              textAnchor="middle"
            >
              Y{year}
            </text>
          ))}

          <path d={path('utility')} className="solar-calculator__line solar-calculator__line--utility" />
          <path d={path('solar')} className="solar-calculator__line solar-calculator__line--solar" />

          {point ? (
            <g className="solar-calculator__crosshair">
              <line x1={x(point.year)} x2={x(point.year)} y1={CHART.top} y2={CHART.top + plotH} />
              <circle
                cx={x(point.year)}
                cy={y(point.utility)}
                r="4.5"
                className="solar-calculator__dot--utility"
              />
              <circle
                cx={x(point.year)}
                cy={y(point.solar)}
                r="4.5"
                className="solar-calculator__dot--solar"
              />
            </g>
          ) : null}
        </svg>

        {point ? (
          <div
            className={cn('solar-calculator__tooltip', point.year > 14 && 'solar-calculator__tooltip--left')}
            style={{ '--tooltip-x': `${(x(point.year) / CHART.width) * 100}%` }}
            aria-hidden="true"
          >
            <span>Year {point.year}</span>
            <span>Utility: {money(point.utility)}</span>
            <span>Solar: {money(point.solar)}</span>
          </div>
        ) : null}
      </div>

      <table className="sr-only">
        <caption>Cumulative cost by year</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">Utility</th>
            <th scope="col">Solar</th>
          </tr>
        </thead>
        <tbody>
          {series.map((row) => (
            <tr key={row.year}>
              <th scope="row">{row.year}</th>
              <td>{money(row.utility)}</td>
              <td>{money(row.solar)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
