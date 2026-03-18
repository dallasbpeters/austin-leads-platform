'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
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

const PIE_COLORS = ['#0ea5e9', '#7e22ce', '#14b8a6', '#f97316', '#4f46e5', '#22c55e', '#e11d48']
const chartColorTokenMap = {
  primary: 'var(--color-primary)',
  sweetcorn: 'var(--color-sweetcorn)',
  voodoo: 'var(--color-voodoo)',
  tidal: 'var(--color-tidal)',
  secondaryAlt: 'var(--color-secondary-alt)',
  blue400: 'var(--color-blue-400)',
  secondary: 'var(--color-secondary)',
  tasman: 'var(--color-tasman)',
  chaletGreen: 'var(--color-chalet-green)',
  metterhorn: 'var(--color-metterhorn)',
  heather: 'var(--color-heather)',
  wattle: 'var(--color-wattle)',
  charade: 'var(--color-charade)',
  ceramic: 'var(--color-ceramic)',
  tapaGreen: 'var(--color-tapa-green)',
  seaMist: 'var(--color-sea-mist)',
  blackCurrent: 'var(--color-black-current)',
  confetti: 'var(--color-confetti)',
}

function buildYAxisTicks(maxValue) {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return [0, 1]
  }

  const step = maxValue / 4
  const ticks = [0, step, step * 2, step * 3, maxValue]
  return ticks.map((value) => Math.round(value))
}

function resolveChartColor(value, fallback) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (!trimmed) return fallback
  return chartColorTokenMap[trimmed] || trimmed
}

export default function EnergyChartSection({ section = null, sectionId = 'energy-chart', editAttributes = {} }) {
  const hasSanityPoints = Array.isArray(section?.chartPoints)
  const points = hasSanityPoints ? section.chartPoints.filter(Boolean) : defaultPoints

  const configuredYAxisMax = clampNumber(section?.chartYAxisMax || 1000, 1, 10000000)
  const chartType = section?.chartType || 'composed'
  const showGrid = section?.showGrid !== false
  const showLegend = section?.showLegend !== false
  const showAxisLines = section?.showAxisLines !== false
  const areaFillOpacity = clampNumber(section?.chartAreaFillOpacity ?? 0.24, 0, 1)
  const primaryLabel = section?.chartPrimaryLabel || 'Primary'
  const secondaryLabel = section?.chartSecondaryLabel || 'Secondary'
  const barColor = resolveChartColor(section?.chartBarColor, 'var(--color-primary)')
  const lineColor = resolveChartColor(section?.chartLineColor, 'var(--color-secondary)')
  const unitLabel = section?.chartUnitLabel || 'kWh'
  const lineUnitLabel = section?.chartLineUnitLabel || 'deg'
  const periodLabel = section?.chartPeriodLabel || 'Jul 2024 - Jul 2025'

  const chartHeight = 400
  const chartInnerWidth = Math.max(920, points.length * 72)
  const chartData = points.map((point, index) => ({
    key: point?._key || `point-${index + 1}`,
    label: point?.label || `P${index + 1}`,
    barValue: Number.isFinite(Number(point?.barValue)) ? Math.max(Number(point?.barValue), 0) : 0,
    lineValue: Number(point?.lineValue ?? 0),
    scatterX: Number.isFinite(Number(point?.barValue)) ? Math.max(Number(point?.barValue), 0) : 0,
    scatterY: Number(point?.lineValue ?? 0),
  }))
  const maxBarValue = chartData.reduce((max, point) => Math.max(max, Number(point?.barValue || 0)), 0)
  const yAxisMax = Math.max(configuredYAxisMax, maxBarValue || 0, 1)
  const yTicks = buildYAxisTicks(yAxisMax)
  const gridStroke = 'rgba(148, 163, 184, 0.38)'
  const axisTickColor = 'rgba(100, 116, 139, 0.95)'
  const hasSecondaryData = chartData.some((point) => Number.isFinite(Number(point?.lineValue)))

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

  const axisLineProps = showAxisLines ? { stroke: gridStroke, strokeWidth: 1 } : false
  const tickLineProps = showAxisLines ? { stroke: gridStroke, strokeWidth: 1 } : false
  const pieData = chartData.filter((point) => point.barValue > 0)

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={chartData} margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
          <CartesianGrid stroke={gridStroke} strokeOpacity={1} vertical={showGrid} horizontal={showGrid} />
          <XAxis
            dataKey="label"
            tick={{ fill: axisTickColor, fontSize: 12 }}
            axisLine={axisLineProps}
            tickLine={tickLineProps}
            dy={10}
          />
          <YAxis
            domain={[0, yAxisMax]}
            ticks={yTicks}
            tickFormatter={(value) => (value === yAxisMax ? `${value.toLocaleString()} ${unitLabel}` : value.toLocaleString())}
            tick={{ fill: axisTickColor, fontSize: 12 }}
            axisLine={axisLineProps}
            tickLine={tickLineProps}
            width={72}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            formatter={(value) => [`${value} ${unitLabel}`, primaryLabel]}
            labelFormatter={(label) => `Label: ${label}`}
          />
          {showLegend ? <Legend /> : null}
          <Bar dataKey="barValue" name={`${primaryLabel} (${unitLabel})`} fill={barColor} radius={[2, 2, 0, 0]} maxBarSize={56} />
        </BarChart>
      )
    }

    if (chartType === 'line') {
      return (
        <LineChart data={chartData} margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
          <CartesianGrid stroke={gridStroke} strokeOpacity={1} vertical={showGrid} horizontal={showGrid} />
          <XAxis
            dataKey="label"
            tick={{ fill: axisTickColor, fontSize: 12 }}
            axisLine={axisLineProps}
            tickLine={tickLineProps}
            dy={10}
          />
          <YAxis
            tick={{ fill: axisTickColor, fontSize: 12 }}
            axisLine={axisLineProps}
            tickLine={tickLineProps}
            width={72}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            formatter={(value) => [`${value}${lineUnitLabel}`, secondaryLabel]}
            labelFormatter={(label) => `Label: ${label}`}
          />
          {showLegend ? <Legend /> : null}
          <Line
            type="monotone"
            dataKey="lineValue"
            name={`${secondaryLabel} (${lineUnitLabel})`}
            stroke={lineColor}
            strokeWidth={3}
            dot={{ r: 4.5, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 4.5 }}
          />
        </LineChart>
      )
    }

    if (chartType === 'area') {
      return (
        <AreaChart data={chartData} margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
          <CartesianGrid stroke={gridStroke} strokeOpacity={1} vertical={showGrid} horizontal={showGrid} />
          <XAxis
            dataKey="label"
            tick={{ fill: axisTickColor, fontSize: 12 }}
            axisLine={axisLineProps}
            tickLine={tickLineProps}
            dy={10}
          />
          <YAxis
            tick={{ fill: axisTickColor, fontSize: 12 }}
            axisLine={axisLineProps}
            tickLine={tickLineProps}
            width={72}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            formatter={(value) => [`${value}${lineUnitLabel}`, secondaryLabel]}
            labelFormatter={(label) => `Label: ${label}`}
          />
          {showLegend ? <Legend /> : null}
          <Area
            type="monotone"
            dataKey="lineValue"
            name={`${secondaryLabel} (${lineUnitLabel})`}
            stroke={lineColor}
            fill={lineColor}
            fillOpacity={areaFillOpacity}
            strokeWidth={3}
          />
        </AreaChart>
      )
    }

    if (chartType === 'pie') {
      return (
        <PieChart margin={{ top: 14, right: 20, left: 20, bottom: 14 }}>
          <Tooltip formatter={(value) => [`${value} ${unitLabel}`, primaryLabel]} />
          {showLegend ? <Legend /> : null}
          <Pie
            data={pieData}
            dataKey="barValue"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={130}
            innerRadius={60}
            stroke="rgba(255,255,255,0.5)"
          >
            {pieData.map((entry, index) => (
              <Cell key={entry.key || `slice-${index + 1}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      )
    }

    if (chartType === 'scatter') {
      return (
        <ScatterChart margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
          <CartesianGrid stroke={gridStroke} strokeOpacity={1} vertical={showGrid} horizontal={showGrid} />
          <XAxis
            type="number"
            dataKey="scatterX"
            name={unitLabel}
            tick={{ fill: axisTickColor, fontSize: 12 }}
            axisLine={axisLineProps}
            tickLine={tickLineProps}
          />
          <YAxis
            type="number"
            dataKey="scatterY"
            name={lineUnitLabel}
            tick={{ fill: axisTickColor, fontSize: 12 }}
            axisLine={axisLineProps}
            tickLine={tickLineProps}
            width={72}
          />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} formatter={(value, name) => [value, name]} />
          {showLegend ? <Legend /> : null}
          <Scatter name={`${secondaryLabel} (${lineUnitLabel})`} data={chartData} fill={lineColor} />
        </ScatterChart>
      )
    }

    return (
      <ComposedChart data={chartData} margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
        <CartesianGrid stroke={gridStroke} strokeOpacity={1} vertical={showGrid} horizontal={showGrid} />
        <XAxis
          dataKey="label"
          tick={{ fill: axisTickColor, fontSize: 12 }}
          axisLine={axisLineProps}
          tickLine={tickLineProps}
          dy={10}
        />
        <YAxis
          yAxisId="bars"
          domain={[0, yAxisMax]}
          ticks={yTicks}
          tickFormatter={(value) => (value === yAxisMax ? `${value.toLocaleString()} ${unitLabel}` : value.toLocaleString())}
          tick={{ fill: axisTickColor, fontSize: 12 }}
          axisLine={axisLineProps}
          tickLine={tickLineProps}
          width={72}
        />
        <YAxis
          yAxisId="line"
          orientation="right"
          domain={['dataMin - 5', 'dataMax + 5']}
          tick={{ fill: axisTickColor, fontSize: 12 }}
          axisLine={axisLineProps}
          tickLine={tickLineProps}
          width={56}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          formatter={(value, name) => {
            if (name === 'barValue') return [`${value} ${unitLabel}`, `${primaryLabel} (${unitLabel})`]
            if (name === 'lineValue') return [`${value}${lineUnitLabel}`, `${secondaryLabel} (${lineUnitLabel})`]
            return [value, name]
          }}
          labelFormatter={(label) => `Month: ${label}`}
        />
        {showLegend ? <Legend /> : null}
        <Bar
          yAxisId="bars"
          dataKey="barValue"
          name={`${primaryLabel} (${unitLabel})`}
          fill={barColor}
          radius={[2, 2, 0, 0]}
          maxBarSize={56}
        />
        {hasSecondaryData ? (
          <Line
            yAxisId="line"
            type="monotone"
            dataKey="lineValue"
            name={`${secondaryLabel} (${lineUnitLabel})`}
            stroke={lineColor}
            strokeWidth={3}
            dot={{ r: 4.5, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 4.5 }}
          >
            <LabelList dataKey="lineValue" content={renderLineLabel} />
          </Line>
        ) : null}
      </ComposedChart>
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

          {chartData.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-background text-muted-foreground text-sm">
              No chart points configured.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div style={{ minWidth: `${chartInnerWidth}px`, height: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

