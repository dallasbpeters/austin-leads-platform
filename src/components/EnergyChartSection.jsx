'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
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

  const chartHeight = 400
  const chartInnerWidth = Math.max(920, points.length * 72)
  const chartData = points.map((point, index) => ({
    key: point?._key || `point-${index + 1}`,
    label: point?.label || `P${index + 1}`,
    barValue: clampNumber(point?.barValue || 0, 0, yAxisMax),
    lineValue: Number(point?.lineValue) || 0,
  }))
  const yTicks = Array.from(new Set([0, 250, 500, 750, yAxisMax])).sort((a, b) => a - b)

  const renderLineLabel = ({ x, y, value, viewBox }) => {
    const chartTop = Number(viewBox?.y ?? 0)
    const chartBottom = chartTop + Number(viewBox?.height ?? chartHeight)
    const labelY = clamp(Number(y) - 12, chartTop + 12, chartBottom - 12)

    return (
      <text x={x} y={labelY} textAnchor="middle" dominantBaseline="middle" fill={lineColor} fontSize="12" fontWeight="600">
        {value}
        {lineUnitLabel}
      </text>
    )
  }

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
            <div style={{ minWidth: `${chartInnerWidth}px`, height: `${chartHeight}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.55} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="bars"
                    domain={[0, yAxisMax]}
                    ticks={yTicks}
                    tickFormatter={(value) => (value === yAxisMax ? `${value.toLocaleString()} ${unitLabel}` : value.toLocaleString())}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={72}
                  />
                  <YAxis
                    yAxisId="line"
                    orientation="right"
                    domain={['dataMin - 5', 'dataMax + 5']}
                    hide
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    formatter={(value, name) => {
                      if (name === 'barValue') return [`${value} ${unitLabel}`, 'Energy']
                      if (name === 'lineValue') return [`${value}${lineUnitLabel}`, 'Temp.']
                      return [value, name]
                    }}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar yAxisId="bars" dataKey="barValue" fill={barColor} radius={[2, 2, 0, 0]} maxBarSize={56} />
                  <Line
                    yAxisId="line"
                    type="monotone"
                    dataKey="lineValue"
                    stroke={lineColor}
                    strokeWidth={3}
                    dot={{ r: 4.5, fill: lineColor, strokeWidth: 0 }}
                    activeDot={{ r: 4.5 }}
                  >
                    <LabelList dataKey="lineValue" content={renderLineLabel} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

