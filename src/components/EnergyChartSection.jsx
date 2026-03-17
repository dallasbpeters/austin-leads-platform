'use client'

import PortableTextContent from './PortableTextContent'
import { getDevSectionAttributes } from './dev/DevTrace'

const defaultPoints = [
  { label: 'Jul', barValue: 450, lineValue: 60 },
  { label: 'Aug', barValue: 470, lineValue: 68 },
  { label: 'Sep', barValue: 560, lineValue: 65 },
  { label: 'Oct', barValue: 720, lineValue: 60 },
  { label: 'Nov', barValue: 700, lineValue: 51 },
  { label: 'Dec', barValue: 920, lineValue: 43 },
  { label: 'Jan', barValue: 900, lineValue: 42 },
  { label: 'Feb', barValue: 890, lineValue: 35 },
  { label: 'Mar', barValue: 820, lineValue: 38 },
  { label: 'Apr', barValue: 720, lineValue: 45 },
  { label: 'May', barValue: 560, lineValue: 52 },
  { label: 'Jun', barValue: 580, lineValue: 56 },
  { label: 'Jul', barValue: 460, lineValue: 62 },
]

function clampNumber(value, min, max) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return min
  return Math.max(min, Math.min(max, parsed))
}

export default function EnergyChartSection({ section = null, sectionId = 'energy-chart', editAttributes = {} }) {
  const points =
    Array.isArray(section?.chartPoints) && section.chartPoints.length
      ? section.chartPoints
      : defaultPoints

  const yAxisMax = clampNumber(section?.chartYAxisMax || 1000, 100, 100000)
  const barColor = section?.chartBarColor || 'var(--color-primary)'
  const lineColor = section?.chartLineColor || '#7e22ce'
  const unitLabel = section?.chartUnitLabel || 'kWh'
  const lineUnitLabel = section?.chartLineUnitLabel || 'deg'
  const periodLabel = section?.chartPeriodLabel || 'Jul 2024 - Jul 2025'

  const lineValues = points.map((point) => Number(point?.lineValue) || 0)
  const minLine = Math.min(...lineValues)
  const maxLine = Math.max(...lineValues)
  const lineRange = Math.max(maxLine - minLine, 1)

  const chartHeight = 300
  const bottomPadding = 30
  const usableHeight = chartHeight - bottomPadding
  const stepX = 72
  const leftPadding = 36
  const svgWidth = leftPadding + stepX * Math.max(points.length - 1, 1) + 28

  const linePath = points
    .map((point, index) => {
      const value = Number(point?.lineValue) || 0
      const x = leftPadding + index * stepX
      const y = 20 + ((maxLine - value) / lineRange) * (usableHeight - 32)
      return `${x},${y}`
    })
    .join(' ')

  const yTicks = [0, 250, 500, 750, yAxisMax]

  return (
    <section
      className="bg-background border-b border-border/60"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/EnergyChartSection.jsx',
        content: 'editable energy chart section',
      })}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-16 lg:px-10">
        <div className="space-y-3 max-w-3xl mb-8">
          {section?.eyebrow ? (
            <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">{section.eyebrow}</p>
          ) : null}
          <h2 className="text-3xl tracking-tight md:text-4xl">{section?.title || 'Home energy usage trend'}</h2>
          {section?.body ? (
            <PortableTextContent as="div" value={section.body} className="text-muted-foreground leading-7" />
          ) : null}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-4 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <p className="font-semibold text-sm md:text-base">{periodLabel}</p>
            <p className="text-muted-foreground text-xs md:text-sm">View: Year</p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[880px]">
              <div className="relative" style={{ height: `${chartHeight}px` }}>
                {yTicks.map((tick, index) => {
                  const y = usableHeight - (tick / yAxisMax) * usableHeight
                  return (
                    <div key={`tick-${index}`} className="absolute left-0 right-0" style={{ top: `${y}px` }}>
                      <div className="border-t border-border/55" />
                      <span className="absolute -left-1 -translate-x-full -translate-y-1/2 text-muted-foreground text-xs">
                        {tick.toLocaleString()} {index === yTicks.length - 1 ? unitLabel : ''}
                      </span>
                    </div>
                  )
                })}

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-2">
                  {points.map((point, index) => {
                    const barValue = clampNumber(point?.barValue || 0, 0, yAxisMax)
                    const barHeight = (barValue / yAxisMax) * usableHeight
                    return (
                      <div key={point?._key || `bar-${index}`} className="relative flex-1 min-w-[56px] max-w-[64px]">
                        <div
                          className="w-full rounded-t-sm"
                          style={{
                            height: `${barHeight}px`,
                            backgroundColor: barColor,
                          }}
                        />
                        <div className="pt-2 text-center text-muted-foreground text-xs">{point?.label || `P${index + 1}`}</div>
                      </div>
                    )
                  })}
                </div>

                <svg className="absolute inset-0 pointer-events-none" viewBox={`0 0 ${svgWidth} ${chartHeight}`} preserveAspectRatio="none">
                  <polyline fill="none" stroke={lineColor} strokeWidth="4" points={linePath} />
                  {points.map((point, index) => {
                    const value = Number(point?.lineValue) || 0
                    const x = leftPadding + index * stepX
                    const y = 20 + ((maxLine - value) / lineRange) * (usableHeight - 32)
                    return (
                      <g key={point?._key || `line-${index}`}>
                        <circle cx={x} cy={y} r="3.5" fill={lineColor} />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          fill={lineColor}
                          fontSize="12"
                          fontWeight="600"
                        >
                          {value}
                          {lineUnitLabel}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

