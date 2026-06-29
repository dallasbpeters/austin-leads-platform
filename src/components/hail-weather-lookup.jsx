'use client'

import { CloudRainWind, LocateFixed, MapPin, ShieldAlert, TriangleAlert, Wind } from 'lucide-react'
import dynamic from 'next/dynamic'
import posthog from 'posthog-js'

import PortableTextContent from '@/components/portable-text-content'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useHailWeatherLookup } from '@/hooks/useHailWeatherLookup'

const HailLayerMap = dynamic(() => import('@/components/hail-layer-map'), { ssr: false })

const riskTone = (level) => {
  if (level === 'high') {
    return 'border-red-500/30 bg-red-500/8 text-red-100'
  }
  if (level === 'elevated') {
    return 'border-amber-400/35 bg-amber-400/10 text-amber-900'
  }
  return 'border-cyan-300/25 bg-cyan-300/10 text-cyan-900'
}

const formatNumber = (value, suffix = '') => {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }
  return `${Math.round(Number(value))}${suffix}`
}

const formatDate = (dateString) => {
  if (!dateString) {
    return ''
  }
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatDistance = (distanceMiles) => {
  if (distanceMiles === null || distanceMiles === undefined || Number.isNaN(Number(distanceMiles))) {
    return 'Nearby'
  }
  return `${Number(distanceMiles).toFixed(1)} mi`
}

const formatStormDate = (dateString) => {
  if (!dateString) {
    return 'Recent storm'
  }
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const MetricCard = ({ icon: Icon, label, value, sublabel }) => {
  return (
    <Card className="bg-card border-border/80">
      <CardContent className="p-4">
        <div className="text-muted-foreground inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
          <Icon className="size-8" aria-hidden="true" />
          {label}
        </div>
        <div className="text-foreground mt-3 text-lg font-semibold">{value}</div>
        <div className="text-muted-foreground mt-1 text-sm">{sublabel}</div>
      </CardContent>
    </Card>
  )
}

const MetricCardsRow = ({ current, daily, alerts }) => {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <MetricCard
        icon={CloudRainWind}
        label="Conditions"
        value={current?.weatherLabel || 'Loading'}
        sublabel={`${formatNumber(current?.temperature, '°')} right now`}
      />
      <MetricCard
        icon={Wind}
        label="Gusts"
        value={formatNumber(daily?.windGustMax, ' mph')}
        sublabel="Forecast max today"
      />
      <MetricCard
        icon={TriangleAlert}
        label="Alerts"
        value={alerts.length}
        sublabel="Active NWS alerts nearby"
      />
    </div>
  )
}

const RiskCard = ({ risk, location }) => {
  if (!risk) {
    return null
  }
  return (
    <Card className="bg-card border-border/80">
      <CardContent className="grid gap-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase ${riskTone(risk.level)}`}
          >
            <ShieldAlert className="size-3.5" aria-hidden="true" />
            {risk.level} risk
          </div>
          {location?.name ? (
            <div className="text-muted-foreground inline-flex items-center gap-2 text-sm">
              <MapPin className="size-4" aria-hidden="true" />
              {location.name}
            </div>
          ) : null}
        </div>
        <div>
          <div className="text-foreground text-lg font-semibold">{risk.headline}</div>
          <div className="text-muted-foreground mt-1 text-sm leading-7">{risk.detail}</div>
        </div>
      </CardContent>
    </Card>
  )
}

const StormEventCard = ({ storm }) => {
  return (
    <div key={storm.id} className="rounded-xl border border-white/12 bg-white/6 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold text-white">{formatStormDate(storm.date)}</div>
        <div className="rounded-full border border-white/12 px-2 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/72 uppercase">
          {storm.validationLevel === 'strong' ? 'dual source' : 'single source'}
        </div>
        <div className="text-xs text-white/60">
          Nearest point: {formatDistance(storm.nearestDistanceMiles)}
        </div>
      </div>
      <div className="mt-2 text-sm text-white">{storm.summary}</div>
      <div className="mt-1 text-sm text-white/72">{storm.sourceSummary}</div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/62">
        <span>{storm.hailSignatureCount} radar signatures</span>
        <span>{storm.stormReportCount} hail reports</span>
        {storm.maxHailSize ? <span>Max hail size: {storm.maxHailSize} in</span> : null}
      </div>
    </div>
  )
}

const StormEventsList = ({ stormEvents }) => {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-white">Storm evidence in the last 30 days</div>
      {stormEvents.length ? (
        <div className="grid gap-3">
          {stormEvents.map((storm) => (
            <StormEventCard key={storm.id} storm={storm} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white/72">
          No hail-signature or hail-report evidence was found for this search window.
        </div>
      )}
    </div>
  )
}

const AlertsSection = ({ alerts }) => {
  if (alerts.length) {
    return (
      <div className="grid gap-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-xl border border-white/12 bg-white/6 px-4 py-3">
            <div className="text-sm font-semibold">{alert.event}</div>
            <div className="mt-1 text-sm text-white/72">{alert.area}</div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white/72">
      No active NWS alerts are posted for this point right now. Treat that as one data point, then confirm
      conditions with a roof inspection if you saw recent impact.
    </div>
  )
}

const HailLayerStats = ({ hailLayer }) => {
  if (!hailLayer) {
    return null
  }
  return (
    <div className="grid gap-2 md:grid-cols-3">
      <StatBox
        label="Radar hail signatures"
        value={`${hailLayer.hailSignatures.length} points in the last 30 days`}
      />
      <StatBox
        label="Storm reports"
        value={`${hailLayer.stormReports.length} hail-related reports in the last 30 days`}
      />
      <StatBox
        label="Legend"
        value="Orange = radar hail signature, cyan = storm report, orange dot = property"
      />
    </div>
  )
}

const StatBox = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white/72">
      <div className="font-semibold text-white">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  )
}

const MapInfoGrid = ({ windowLabel, locationName, stormEvents }) => {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      <StatBox label="Search window" value={windowLabel} />
      <StatBox label="Property marker" value={locationName || 'Selected location'} />
      <StatBox
        label="Validated storms"
        value={
          stormEvents.length
            ? `${stormEvents.length} storm day${stormEvents.length === 1 ? '' : 's'} found`
            : 'No storm days found'
        }
      />
    </div>
  )
}

const WeatherDescription = ({ alerts, daily, location, formatDate: fmtDate }) => {
  return (
    <div>
      <div className="text-sm font-semibold">
        {alerts[0]?.event || daily?.weatherLabel || 'Weather outlook'}
      </div>
      <div className="mt-1 text-sm leading-6 text-white/72">
        {alerts[0]?.headline ||
          `For ${location?.name || 'this area'}, forecast conditions for ${fmtDate(daily?.date)} show ${formatNumber(
            daily?.precipitationProbabilityMax,
            '%',
          )} precipitation probability and gusts up to ${formatNumber(daily?.windGustMax, ' mph')}.`}
      </div>
    </div>
  )
}

const SearchForm = ({ query, setQuery, isPending, searchByQuery, searchByCurrentLocation }) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    posthog.capture('hail_damage_lookup', { query, lookup_method: 'text_search' })
    searchByQuery()
  }
  const handleGeolocate = () => {
    posthog.capture('hail_damage_lookup', { lookup_method: 'geolocation' })
    searchByCurrentLocation()
  }

  return (
    <form className="grid grid-cols-1 gap-3 md:grid-cols-[300px_400px_200px]" onSubmit={handleSubmit}>
      <Button
        size="md"
        className="h-11"
        disabled={isPending}
        onClick={handleGeolocate}
        type="button"
        variant="outline"
      >
        <LocateFixed className="size-4" aria-hidden="true" />
        Current location
      </Button>
      <label htmlFor="hail-weather-lookup-query" className="sr-only">
        Search location
      </label>
      <Input
        id="hail-weather-lookup-query"
        name="hail-weather-lookup-query"
        className="border-border/70 h-11 w-full bg-white"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Enter ZIP code, city, or neighborhood"
        value={query}
      />
      <Button className="h-11" id="hail-weather-lookup-submit" size="md" disabled={isPending} type="submit">
        {isPending ? 'Checking…' : 'Check weather'}
      </Button>
    </form>
  )
}

const extractWeatherData = (data) => {
  return {
    current: data?.current,
    daily: data?.daily?.[0],
    alerts: data?.alerts || [],
    risk: data?.risk,
    hailLayer: data?.hailLayer,
    stormEvents: data?.stormEvents || [],
    location: data?.location,
  }
}

const buildWindowLabel = (hailLayer) => {
  if (hailLayer?.startDate && hailLayer?.endDate) {
    return `${formatDate(hailLayer.startDate)} - ${formatDate(hailLayer.endDate)}`
  }
  return 'Last 30 days'
}

const HailWeatherLookup = ({ section }) => {
  const hook = useHailWeatherLookup('Austin, TX')
  const { data } = hook
  const { error } = hook
  const { isPending } = hook
  const { hasUserSearched } = hook
  const { query } = hook
  const { setQuery } = hook
  const { searchByQuery } = hook
  const { searchByCurrentLocation } = hook

  const { current, daily, alerts, risk, hailLayer, stormEvents, location } = extractWeatherData(data)
  const windowLabel = buildWindowLabel(hailLayer)

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-1">
      <div className="space-y-5">
        <Badge variant="outline" className="text-foreground bg-primary/5 border-primary/20">
          Hail in your area
        </Badge>
        <div className="space-y-4">
          <h2 className="text-foreground text-3xl tracking-normal md:text-4xl">{section.title}</h2>
          <PortableTextContent
            as="div"
            value={section.body}
            className="text-muted-foreground max-w-2xl text-[1rem] leading-8"
          />
        </div>

        <SearchForm {...{ query, setQuery, isPending, searchByQuery, searchByCurrentLocation }} />

        {hasUserSearched && error ? (
          <Card className="border-red-500/20 bg-red-500/5 text-red-900">
            <CardContent className="p-4 text-sm">{error}</CardContent>
          </Card>
        ) : null}

        <RiskCard risk={risk} location={location} />
        <MetricCardsRow current={current} daily={daily} alerts={alerts} />
      </div>

      <Card className="overflow-hidden border-none p-0">
        <CardContent className="p-0">
          <div className="grid min-h-250 lg:grid-rows-[1fr_auto]">
            {location ? (
              <HailLayerMap center={location} hailLayer={hailLayer} />
            ) : (
              <div className="flex min-h-88 items-center justify-center bg-[linear-gradient(180deg,#102230,#1b3344)] text-sm text-white/70">
                Check weather to see a map of hail in your area
              </div>
            )}

            <div className="border-border/60 grid gap-4 border-t bg-slate-950/92 p-5 text-white md:grid-cols-[1fr_auto] md:items-start">
              <div className="space-y-4">
                <MapInfoGrid
                  windowLabel={windowLabel}
                  locationName={location?.name}
                  stormEvents={stormEvents}
                />
                <WeatherDescription
                  alerts={alerts}
                  daily={daily}
                  location={location}
                  formatDate={formatDate}
                />
                <HailLayerStats hailLayer={hailLayer} />
                <StormEventsList stormEvents={stormEvents} />
                <AlertsSection alerts={alerts} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HailWeatherLookup
