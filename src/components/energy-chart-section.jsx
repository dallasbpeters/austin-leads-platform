'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

import { getDevSectionAttributes } from './dev/dev-trace'
import PortableTextContent from './portable-text-content'

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
  if (!Number.isFinite(parsed)) {
    return min
  }
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
  return [0, step, step * 2, step * 3, maxValue].map((value) => Math.round(value))
}

function resolveChartColor(value, fallback) {
  if (typeof value !== 'string') {
    return fallback
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return fallback
  }
  return chartColorTokenMap[trimmed] || trimmed
}

function resolveAreaPointValue(point, seriesIndex, seriesCount) {
  if (seriesCount === 2) {
    if (seriesIndex === 0) {
      const n = Number(point?.barValue)
      return Number.isFinite(n) ? Math.max(n, 0) : 0
    }
    if (seriesIndex === 1) {
      const n = Number(point?.lineValue)
      return Number.isFinite(n) ? Math.max(n, 0) : 0
    }
  }
  const av = point?.areaValues
  if (Array.isArray(av) && av[seriesIndex] !== undefined && av[seriesIndex] !== null) {
    const n = Number(av[seriesIndex])
    if (Number.isFinite(n)) {
      return Math.max(n, 0)
    }
  }
  if (seriesIndex === 0) {
    const n = Number(point?.barValue)
    return Number.isFinite(n) ? Math.max(n, 0) : 0
  }
  if (seriesIndex === 1) {
    const n = Number(point?.lineValue)
    return Number.isFinite(n) ? Math.max(n, 0) : 0
  }
  return 0
}

function buildChartData(points, chartType, multiAreaCount) {
  return points.map((point, index) => {
    const row = {
      key: point?._key || `point-${index + 1}`,
      label: point?.label || `P${index + 1}`,
      barValue: Number.isFinite(Number(point?.barValue)) ? Math.max(Number(point?.barValue), 0) : 0,
      lineValue: Number.isFinite(Number(point?.lineValue)) ? Number(point?.lineValue) : 0,
      scatterX: Number.isFinite(Number(point?.barValue)) ? Math.max(Number(point?.barValue), 0) : 0,
      scatterY: Number.isFinite(Number(point?.lineValue)) ? Number(point?.lineValue) : 0,
    }
    if (chartType === 'area' && multiAreaCount > 0) {
      for (let i = 0; i < multiAreaCount; i += 1) {
        row[`area_${i}`] = resolveAreaPointValue(point, i, multiAreaCount)
      }
    }
    return row
  })
}

function computeYAxisMax(
  chartData,
  chartType,
  multiAreaCount,
  chartAreaStacked,
  areaSeriesDefs,
  configuredYAxisMax,
) {
  if (chartType === 'area' && multiAreaCount > 0) {
    if (chartAreaStacked) {
      const stackedPeak = chartData.reduce((max, row) => {
        const sum = areaSeriesDefs.reduce((acc, _, i) => acc + (Number(row[`area_${i}`]) || 0), 0)
        return Math.max(max, sum)
      }, 0)
      return Math.max(configuredYAxisMax, stackedPeak, 1)
    }
    const peak = chartData.reduce((max, row) => {
      let rowMax = max
      for (let i = 0; i < multiAreaCount; i += 1) {
        rowMax = Math.max(rowMax, Number(row[`area_${i}`]) || 0)
      }
      return rowMax
    }, 0)
    return Math.max(configuredYAxisMax, peak, 1)
  }
  const maxBarValue = chartData.reduce((max, point) => Math.max(max, Number(point?.barValue || 0)), 0)
  return Math.max(configuredYAxisMax, maxBarValue || 0, 1)
}

function ChartAxes({
  yAxisMax,
  yTicks,
  unitLabel,
  axisLineProps,
  tickLineProps,
  axisTickColor,
  showGrid,
  gridStroke,
  rightYAxis,
}) {
  return (
    <>
      <CartesianGrid stroke={gridStroke} strokeOpacity={1} vertical={showGrid} horizontal={showGrid} />
      <XAxis
        dataKey="label"
        tick={{ fill: axisTickColor, fontSize: 12 }}
        axisLine={axisLineProps}
        tickLine={tickLineProps}
        dy={10}
      />
      <YAxis
        yAxisId={rightYAxis ? 'bars' : undefined}
        domain={[0, yAxisMax]}
        ticks={yTicks}
        tickFormatter={(value) =>
          value === yAxisMax ? `${value.toLocaleString()} ${unitLabel}` : value.toLocaleString()
        }
        tick={{ fill: axisTickColor, fontSize: 12 }}
        axisLine={axisLineProps}
        tickLine={tickLineProps}
        width={72}
      />
      {rightYAxis ? (
        <YAxis
          yAxisId="line"
          orientation="right"
          domain={['dataMin - 5', 'dataMax + 5']}
          tick={{ fill: axisTickColor, fontSize: 12 }}
          axisLine={axisLineProps}
          tickLine={tickLineProps}
          width={56}
        />
      ) : null}
    </>
  )
}

function ChartTooltipWithLegend({
  formatter,
  labelFormatter,
  showLegend,
  unitLabel,
  primaryLabel,
  isComposed,
  secondaryLabel,
  lineUnitLabel,
}) {
  const handleFormatter = isComposed
    ? (value, name) => {
        if (name === 'barValue') {
          return [`${value} ${unitLabel}`, `${primaryLabel} (${unitLabel})`]
        }
        if (name === 'lineValue') {
          return [`${value}${lineUnitLabel || ''}`, `${secondaryLabel || ''} (${lineUnitLabel || ''})`]
        }
        return [value, name]
      }
    : formatter || ((value) => [`${value} ${unitLabel}`, primaryLabel])

  return (
    <>
      <Tooltip
        cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        formatter={handleFormatter}
        labelFormatter={labelFormatter || ((label) => `${label}`)}
      />
      {showLegend ? <Legend /> : null}
    </>
  )
}

function renderLineLabel({ x, y, value, viewBox }, lineColor, lineUnitLabel, chartHeight) {
  const chartTop = Number(viewBox?.y ?? 0)
  const chartBottom = chartTop + Number(viewBox?.height ?? chartHeight)
  const labelY = clamp(Number(y) - 12, chartTop + 12, chartBottom - 12)
  return (
    <text
      x={x}
      y={labelY}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={lineColor}
      fontSize="12"
      fontWeight="600"
    >
      {value}
      {lineUnitLabel}
    </text>
  )
}

function AreaSeriesRenderer({
  areaSeriesDefs,
  multiAreaCount,
  areaFillOpacity,
  unitLabel,
  stackId,
  barColor,
  primaryLabel,
}) {
  if (multiAreaCount > 0) {
    return areaSeriesDefs.map((seriesDef, index) => {
      const seriesTitle = String(seriesDef?.title || '').trim() || `Series ${index + 1}`
      const seriesColor = resolveChartColor(seriesDef?.color, PIE_COLORS[index % PIE_COLORS.length])
      return (
        <Area
          key={seriesDef?._key || `area-series-${index}`}
          type="monotone"
          dataKey={`area_${index}`}
          name={`${seriesTitle} (${unitLabel})`}
          stroke={seriesColor}
          fill={seriesColor}
          fillOpacity={areaFillOpacity}
          strokeWidth={2}
          stackId={stackId}
        />
      )
    })
  }
  return (
    <Area
      type="monotone"
      dataKey="barValue"
      name={`${primaryLabel} (${unitLabel})`}
      stroke={barColor}
      fill={barColor}
      fillOpacity={areaFillOpacity}
      strokeWidth={3}
    />
  )
}

function renderBarChart(
  chartData,
  yAxisMax,
  yTicks,
  unitLabel,
  primaryLabel,
  barColor,
  showGrid,
  showLegend,
  gridStroke,
  axisTickColor,
  axisLineProps,
  tickLineProps,
) {
  return (
    <BarChart data={chartData} margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
      <ChartAxes
        {...{
          yAxisMax,
          yTicks,
          unitLabel,
          axisLineProps,
          tickLineProps,
          axisTickColor,
          showGrid,
          gridStroke,
        }}
      />
      <ChartTooltipWithLegend
        showLegend={showLegend}
        unitLabel={unitLabel}
        primaryLabel={primaryLabel}
        formatter={(value) => [`${value} ${unitLabel}`, primaryLabel]}
      />
      <Bar
        dataKey="barValue"
        name={`${primaryLabel} (${unitLabel})`}
        fill={barColor}
        radius={[2, 2, 0, 0]}
        maxBarSize={56}
      />
    </BarChart>
  )
}

function renderLineChart(
  chartData,
  yAxisMax,
  yTicks,
  unitLabel,
  primaryLabel,
  barColor,
  showGrid,
  showLegend,
  gridStroke,
  axisTickColor,
  axisLineProps,
  tickLineProps,
) {
  return (
    <LineChart data={chartData} margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
      <ChartAxes
        {...{
          yAxisMax,
          yTicks,
          unitLabel,
          axisLineProps,
          tickLineProps,
          axisTickColor,
          showGrid,
          gridStroke,
        }}
      />
      <ChartTooltipWithLegend
        showLegend={showLegend}
        unitLabel={unitLabel}
        primaryLabel={primaryLabel}
        formatter={(value) => [`${value} ${unitLabel}`, primaryLabel]}
      />
      <Line
        type="monotone"
        dataKey="barValue"
        name={`${primaryLabel} (${unitLabel})`}
        stroke={barColor}
        strokeWidth={3}
        dot={{ r: 4.5, fill: barColor, strokeWidth: 0 }}
        activeDot={{ r: 4.5 }}
      />
    </LineChart>
  )
}

function renderAreaChart(
  chartData,
  yAxisMax,
  yTicks,
  unitLabel,
  primaryLabel,
  barColor,
  showGrid,
  showLegend,
  gridStroke,
  axisTickColor,
  axisLineProps,
  tickLineProps,
  areaSeriesDefs,
  multiAreaCount,
  areaFillOpacity,
  chartAreaStacked,
) {
  const stackId = chartAreaStacked && multiAreaCount > 1 ? 'energy-areas' : undefined
  return (
    <AreaChart data={chartData} margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
      <ChartAxes
        {...{
          yAxisMax,
          yTicks,
          unitLabel,
          axisLineProps,
          tickLineProps,
          axisTickColor,
          showGrid,
          gridStroke,
        }}
      />
      <ChartTooltipWithLegend
        showLegend={showLegend}
        unitLabel={unitLabel}
        primaryLabel={primaryLabel}
        formatter={(value, name) => [`${value} ${unitLabel}`, name]}
      />
      <AreaSeriesRenderer
        {...{ areaSeriesDefs, multiAreaCount, areaFillOpacity, unitLabel, stackId, barColor, primaryLabel }}
      />
    </AreaChart>
  )
}

function renderPieChart(pieData, unitLabel, primaryLabel, showLegend) {
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

function renderScatterChart(
  chartData,
  unitLabel,
  lineUnitLabel,
  secondaryLabel,
  lineColor,
  showGrid,
  showLegend,
  gridStroke,
  axisTickColor,
  axisLineProps,
  tickLineProps,
) {
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

function renderComposedChart(
  chartData,
  yAxisMax,
  yTicks,
  unitLabel,
  lineUnitLabel,
  primaryLabel,
  secondaryLabel,
  barColor,
  lineColor,
  showGrid,
  showLegend,
  gridStroke,
  axisTickColor,
  axisLineProps,
  tickLineProps,
  hasSecondaryData,
  chartHeight,
) {
  return (
    <ComposedChart data={chartData} margin={{ top: 22, right: 20, left: 8, bottom: 44 }}>
      <ChartAxes
        {...{
          yAxisMax,
          yTicks,
          unitLabel,
          axisLineProps,
          tickLineProps,
          axisTickColor,
          showGrid,
          gridStroke,
          rightYAxis: true,
        }}
      />
      <ChartTooltipWithLegend
        showLegend={showLegend}
        unitLabel={unitLabel}
        primaryLabel={primaryLabel}
        isComposed
        secondaryLabel={secondaryLabel}
        lineUnitLabel={lineUnitLabel}
      />
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
          <LabelList
            dataKey="lineValue"
            content={(props) => renderLineLabel(props, lineColor, lineUnitLabel, chartHeight)}
          />
        </Line>
      ) : null}
    </ComposedChart>
  )
}

function inferAreaSeries(sec, chartType, points, primaryLabel, secondaryLabel) {
  const cms =
    chartType === 'area' && Array.isArray(sec.chartAreaSeries)
      ? sec.chartAreaSeries.filter((item) => item && typeof item === 'object')
      : []
  if (cms.length > 0) {
    return { areaSeriesDefs: cms, multiAreaCount: cms.length }
  }
  const maxLen = points.reduce(
    (m, pt) => Math.max(m, Array.isArray(pt?.areaValues) ? pt.areaValues.length : 0),
    0,
  )
  if (chartType !== 'area' || maxLen < 1) {
    return { areaSeriesDefs: [], multiAreaCount: 0 }
  }
  const defs = Array.from({ length: maxLen }, (_, i) => ({
    _key: `inferred-area-${i}`,
    title: i === 0 ? primaryLabel : i === 1 ? secondaryLabel : `Series ${i + 1}`,
    color: i === 0 ? sec.chartBarColor : i === 1 ? sec.chartLineColor : undefined,
  }))
  return { areaSeriesDefs: defs, multiAreaCount: defs.length }
}

function buildEnergyChartConfig(section) {
  const sec = section || {}
  const hasSanityPoints = Array.isArray(sec.chartPoints)
  const points = hasSanityPoints ? sec.chartPoints.filter(Boolean) : defaultPoints
  const configuredYAxisMax = clampNumber(sec.chartYAxisMax || 1000, 1, 10_000_000)
  const chartType = sec.chartType || 'composed'
  const showGrid = sec.showGrid !== false
  const showLegend = sec.showLegend !== false
  const showAxisLines = sec.showAxisLines !== false
  const areaFillOpacity = clampNumber(sec.chartAreaFillOpacity ?? 0.24, 0, 1)
  const primaryLabel = sec.chartPrimaryLabel || 'Primary'
  const secondaryLabel = sec.chartSecondaryLabel || 'Secondary'
  const barColor = resolveChartColor(sec.chartBarColor, 'var(--color-primary)')
  const lineColor = resolveChartColor(sec.chartLineColor, 'var(--color-secondary)')
  const unitLabel = sec.chartUnitLabel || 'kWh'
  const lineUnitLabel = sec.chartLineUnitLabel || 'deg'
  const periodLabel = sec.chartPeriodLabel || 'Jul 2024 - Jul 2025'
  const chartHeight = 400
  const chartAreaStacked = sec.chartAreaStacked === true

  const { areaSeriesDefs, multiAreaCount } = inferAreaSeries(
    sec,
    chartType,
    points,
    primaryLabel,
    secondaryLabel,
  )
  const chartData = buildChartData(points, chartType, multiAreaCount)
  const yAxisMax = computeYAxisMax(
    chartData,
    chartType,
    multiAreaCount,
    chartAreaStacked,
    areaSeriesDefs,
    configuredYAxisMax,
  )

  return {
    points,
    chartType,
    showGrid,
    showLegend,
    showAxisLines,
    areaFillOpacity,
    primaryLabel,
    secondaryLabel,
    barColor,
    lineColor,
    unitLabel,
    lineUnitLabel,
    periodLabel,
    areaSeriesDefs,
    multiAreaCount,
    chartAreaStacked,
    chartHeight,
    chartData,
    yAxisMax,
  }
}

function SectionHeader({ section, title }) {
  return (
    <div className="mb-8 max-w-3xl space-y-3">
      {section?.eyebrow ? (
        <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">{section.eyebrow}</p>
      ) : null}
      <h2 className="text-3xl tracking-normal md:text-4xl">{title}</h2>
      {section?.body ? (
        <PortableTextContent as="div" value={section.body} className="text-muted-foreground leading-7" />
      ) : null}
    </div>
  )
}

export default function EnergyChartSection({ section = null, sectionId = 'energy-chart' }) {
  const cfg = buildEnergyChartConfig(section)
  const {
    chartType,
    showGrid,
    showLegend,
    showAxisLines,
    unitLabel,
    lineUnitLabel,
    primaryLabel,
    secondaryLabel,
    barColor,
    lineColor,
    periodLabel,
    areaSeriesDefs,
    multiAreaCount,
    areaFillOpacity,
    chartAreaStacked,
    chartHeight,
    chartData,
    yAxisMax,
  } = cfg

  const yTicks = buildYAxisTicks(yAxisMax)
  const gridStroke = 'rgba(148, 163, 184, 0.38)'
  const axisTickColor = 'rgba(100, 116, 139, 0.95)'
  const hasSecondaryData = chartData.some((point) => Number.isFinite(Number(point?.lineValue)))
  const axisLineProps = showAxisLines ? { stroke: gridStroke, strokeWidth: 1 } : false
  const tickLineProps = showAxisLines ? { stroke: gridStroke, strokeWidth: 1 } : false
  const pieData = chartData.filter((point) => point.barValue > 0)
  const titleValue = section?.title || 'Home energy usage trend'

  const chartRenderers = {
    bar: () =>
      renderBarChart(
        chartData,
        yAxisMax,
        yTicks,
        unitLabel,
        primaryLabel,
        barColor,
        showGrid,
        showLegend,
        gridStroke,
        axisTickColor,
        axisLineProps,
        tickLineProps,
      ),
    line: () =>
      renderLineChart(
        chartData,
        yAxisMax,
        yTicks,
        unitLabel,
        primaryLabel,
        barColor,
        showGrid,
        showLegend,
        gridStroke,
        axisTickColor,
        axisLineProps,
        tickLineProps,
      ),
    area: () =>
      renderAreaChart(
        chartData,
        yAxisMax,
        yTicks,
        unitLabel,
        primaryLabel,
        barColor,
        showGrid,
        showLegend,
        gridStroke,
        axisTickColor,
        axisLineProps,
        tickLineProps,
        areaSeriesDefs,
        multiAreaCount,
        areaFillOpacity,
        chartAreaStacked,
      ),
    pie: () => renderPieChart(pieData, unitLabel, primaryLabel, showLegend),
    scatter: () =>
      renderScatterChart(
        chartData,
        unitLabel,
        lineUnitLabel,
        secondaryLabel,
        lineColor,
        showGrid,
        showLegend,
        gridStroke,
        axisTickColor,
        axisLineProps,
        tickLineProps,
      ),
    composed: () =>
      renderComposedChart(
        chartData,
        yAxisMax,
        yTicks,
        unitLabel,
        lineUnitLabel,
        primaryLabel,
        secondaryLabel,
        barColor,
        lineColor,
        showGrid,
        showLegend,
        gridStroke,
        axisTickColor,
        axisLineProps,
        tickLineProps,
        hasSecondaryData,
        chartHeight,
      ),
  }
  const renderChart = () => (chartRenderers[chartType] || chartRenderers.composed)()

  return (
    <section
      className="bg-background border-border/60 border-b"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/energy-chart-section.jsx',
        content: 'editable energy chart section',
      })}
    >
      <div className="mx-auto max-w-7xl px-3 py-16 md:px-6 lg:px-10">
        <SectionHeader section={section} title={titleValue} />
        <div className="border-border/70 bg-card rounded-2xl border p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold md:text-[1rem]">{periodLabel}</p>
          </div>
          {chartData.length === 0 ? (
            <div className="border-border/70 bg-background text-muted-foreground flex h-[240px] items-center justify-center rounded-xl border border-dashed text-sm">
              No chart points configured.
            </div>
          ) : (
            <div className="w-full min-w-0" style={{ minHeight: `${chartHeight}px` }}>
              <div
                className="min-h-40 w-full"
                role="img"
                aria-label={`${titleValue} chart showing ${periodLabel}`}
                style={{ width: '100%', height: `${chartHeight}px`, minHeight: `${chartHeight}px` }}
              >
                <ResponsiveContainer width="100%" aspect={1.2} maxHeight={450}>
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
