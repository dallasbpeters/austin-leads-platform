'use client'

import { useMemo, useState } from 'react'
import Button from './Button'
import Card from './Card'
import { Slider } from '@/components/ui/slider'

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
  const federalCredit = grossCost * 0.3
  const netCost = Math.max(grossCost - federalCredit - localRebate, 0)
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

export default function CalculatorSection() {
  const [bill, setBill] = useState(DEFAULT_BILL)
  const results = useMemo(() => calculate(bill), [bill])

  return (
    <section className="bg-solar-warm relative overflow-hidden   py-24">
      <div className="absolute right-0 top-0 h-[60rem] w-[32rem] translate-x-1/2 -translate-y-1/2 rounded-full blur-[48px]" style={{ background: 'hsl(var(--color-primary-h) var(--color-primary-s) 72% / 0.1)' }}></div>
      <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full blur-[48px]" style={{ background: 'hsl(calc(var(--color-primary-h) + 16) 80% 70% / 0.14)' }}></div>
      <div className="relative z-[1] mx-auto w-[min(72rem,calc(100%-3rem))]">
        <div className="mb-14 text-center">
          <h2 className="m-0 text-[clamp(3.875rem,4vw,5.25rem)] type-display text-foreground">See what solar could save&nbsp;you</h2>
          <p className="text-foreground mx-auto mt-3 max-w-[52rem] text-base">Enter your average monthly electric bill and we&apos;ll estimate your system size, potential savings, and likely payback period.</p>
        </div>

        <Card className="grid overflow-hidden max-[900px]:grid-cols-1 [grid-template-columns:minmax(280px,2fr)_minmax(320px,3fr)]" variant="surfaceStrong" radius="lg">
          <div className="flex flex-col justify-center bg-[linear-gradient(to_bottom_right,var(--color-cyan-950),var(--color-cyan-900))] p-8 text-white">
            <label htmlFor="calc-bill" className="mb-3 block text-xs font-bold uppercase tracking-[0.15em] text-[rgba(103,232,249,0.7)]">
              Your Monthly Electric Bill
            </label>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-white/60">$</span>
              <input id="calc-bill" type="number" min={MIN_BILL} max={MAX_BILL} value={bill} onChange={(event) => setBill(clampBill(event.target.value))} className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-4 pl-10 text-[1.875rem] font-semibold text-white outline-none" />
            </div>
            <Slider min={MIN_BILL} max={MAX_BILL} step={10} value={[bill]} onValueChange={([nextBill]) => setBill(clampBill(nextBill))} className="mb-4" />
            <div className="flex justify-between text-xs font-medium text-[rgba(103,232,249,0.5)]">
              <span>$50</span>
              <span>$800</span>
            </div>

            <div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-6 text-xs text-[rgba(103,232,249,0.6)]">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"></path>
              </svg>
              Based on average Austin Energy rates and 5.5 peak sun hours per day
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-6 p-4 md:p-8 max-sm:grid-cols-1">
            <ResultCard title="System Size" value={results.systemKw} suffix="kW" detail={`~${results.panels} panels on your roof`} />
            <ResultCard title="Year 1 Savings" value={results.year1} prefix="$" detail={`Avg ${results.monthly}/mo back in your pocket`} />
            <ResultCard title="25-Year Savings" value={results.lifetime} prefix="$" detail="With 2.5% annual rate increase" accent />
            <ResultCard title="Payback Period" value={results.payback} suffix="years" detail="After federal credit and a typical local rebate" accent />

            <div className="col-span-full mt-2 flex flex-wrap items-center gap-4">
              <Button href="#estimate" size="md" pill className="w-full max-w-72">
                Talk to a solar pro →
              </Button>
              <span className="text-solar-slate-400 text-xs">Free estimate · No commitment · Takes 2 minutes</span>
            </div>
          </div>
        </Card>
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      ></div>
    </section>
  )
}

function ResultCard({ title, value, prefix = '', suffix = '', detail, accent = false }) {
  return (
    <Card className="bg-card p-5">
      <span className="text-solar-slate-400 text-xs font-bold uppercase tracking-[0.08em]">{title}</span>
      <div className="mt-2 flex items-baseline gap-1 text-[1.875rem] font-bold text-foreground">
        {prefix ? <span className="text-solar-slate-400 text-sm font-medium">{prefix}</span> : null}
        <span>{value}</span>
        {suffix ? <span className="text-solar-slate-400 text-sm font-medium">{suffix}</span> : null}
      </div>
      <p className="text-solar-slate-400 mt-1.5 text-xs">{detail}</p>
    </Card>
  )
}
