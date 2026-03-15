'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { CloudRainWind, LocateFixed, MapPin, ShieldAlert, TriangleAlert, Wind } from 'lucide-react'

import { useHailWeatherLookup } from '@/hooks/useHailWeatherLookup'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cleanRuntimeHref } from '@/lib/sanity/stega'

const HailLayerMap = dynamic(() => import('@/components/HailLayerMap'), {
  ssr: false,
})

function riskTone(level) {
  if (level === 'high') {
    return 'border-red-500/30 bg-red-500/8 text-red-100'
  }

  if (level === 'elevated') {
    return 'border-amber-400/35 bg-amber-400/10 text-amber-900'
  }

  return 'border-cyan-300/25 bg-cyan-300/10 text-cyan-900'
}

function formatNumber(value, suffix = '') {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  return `${Math.round(Number(value))}${suffix}`
}

function formatDate(dateString) {
  if (!dateString) {
    return ''
  }

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatDistance(distanceMiles) {
  if (distanceMiles === null || distanceMiles === undefined || Number.isNaN(Number(distanceMiles))) {
    return 'Nearby'
  }

  return `${Number(distanceMiles).toFixed(1)} mi`
}

function formatStormDate(dateString) {
  if (!dateString) {
    return 'Recent storm'
  }

  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function HailWeatherLookup({ section }) {
  const { data, error, isPending, hasUserSearched, query, setQuery, searchByQuery, searchByCurrentLocation } =
    useHailWeatherLookup('Austin, TX')

  const current = data?.current
  const daily = data?.daily?.[0]
  const alerts = data?.alerts || []
  const risk = data?.risk
  const hailLayer = data?.hailLayer
  const stormEvents = data?.stormEvents || []

  const hasStormPoints = Boolean(hailLayer?.hailSignatures?.length || hailLayer?.stormReports?.length)
  const windowLabel =
    hailLayer?.startDate && hailLayer?.endDate
      ? `${formatDate(hailLayer.startDate)} - ${formatDate(hailLayer.endDate)}`
      : 'Last 30 days'

  return (
    <div className="grid max-w-7xl gap-8 mx-auto lg:grid-cols-1">
      <div className="space-y-5">
        <Badge variant="outline" className="text-foreground bg-primary/5 border-primary/20">
          Hail in your area
        </Badge>
        <div className="space-y-4">
          <h2 className="text-3xl text-foreground tracking-tight md:text-4xl">{section.title}</h2>
          <p className="max-w-2xl leading-8 text-base text-muted-foreground">{section.body}</p>
        </div>

        <form
          className="grid gap-3 grid-cols-1 md:grid-cols-[300px_400px_200px]"
          onSubmit={(event) => {
            event.preventDefault()
            searchByQuery()
          }}
        >
          <Button
            size="md"
            className="h-11"
            disabled={isPending}
            onClick={searchByCurrentLocation}
            type="button"
            variant="outline"
          >
            <LocateFixed className="size-4" />
            Current location
          </Button>
          <Input
            id="hail-weather-lookup-query"
            name="hail-weather-lookup-query"
            htmlFor="hail-weather-lookup-query"
            className="h-11 w-full bg-white border-border/70"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter ZIP code, city, or neighborhood"
            value={query}
          />
          <Button
            className="h-11"
            id="hail-weather-lookup-submit"
            size="md"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Checking…' : 'Check weather'}
          </Button>
        </form>

        {hasUserSearched && error ? (
          <Card className="text-red-900 bg-red-500/5 border-red-500/20">
            <CardContent className="p-4 text-sm">{error}</CardContent>
          </Card>
        ) : null}

        {risk ? (
          <Card className="bg-card border-border/80">
            <CardContent className="grid gap-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase ${riskTone(risk.level)}`}
                >
                  <ShieldAlert className="size-3.5" />
                  {risk.level} risk
                </div>
                {data?.location?.name ? (
                  <div className="items-center gap-2 text-muted-foreground text-sm inline-flex">
                    <MapPin className="size-4" />
                    {data.location.name}
                  </div>
                ) : null}
              </div>
              <div>
                <div className="font-semibold text-foreground text-lg">{risk.headline}</div>
                <div className="mt-1 leading-7 text-muted-foreground text-sm">{risk.detail}</div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="bg-card border-border/80">
            <CardContent className="p-4">
              <div className="items-center gap-2 font-semibold text-muted-foreground text-xs tracking-[0.16em] inline-flex uppercase">
                <CloudRainWind className="size-8" />
                Conditions
              </div>
              <div className="mt-3 font-semibold text-foreground text-lg">
                {current?.weatherLabel || 'Loading'}
              </div>
              <div className="mt-1 text-muted-foreground text-sm">
                {formatNumber(current?.temperature, '°')} right now
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/80">
            <CardContent className="p-4">
              <div className="items-center gap-2 font-semibold text-muted-foreground text-xs tracking-[0.16em] inline-flex uppercase">
                <Wind className="size-8" />
                Gusts
              </div>
              <div className="mt-3 font-semibold text-foreground text-lg">
                {formatNumber(daily?.windGustMax, ' mph')}
              </div>
              <div className="mt-1 text-muted-foreground text-sm">Forecast max today</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/80">
            <CardContent className="p-4">
              <div className="items-center gap-2 font-semibold text-muted-foreground text-xs tracking-[0.16em] inline-flex uppercase">
                <TriangleAlert className="size-8" />
                Alerts
              </div>
              <div className="mt-3 font-semibold text-foreground text-lg">{alerts.length}</div>
              <div className="mt-1 text-muted-foreground text-sm">Active NWS alerts nearby</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="p-0 border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="grid min-h-250 lg:grid-rows-[1fr_auto]">
            {data?.location ? (
              <HailLayerMap center={data.location} hailLayer={hailLayer} />
            ) : (
              <div className="flex items-center justify-center min-h-88 text-sm text-white/70 bg-[linear-gradient(180deg,#102230,#1b3344)]">
                Check weather to see a map of hail in your area
              </div>
            )}

            <div className="grid md:items-start gap-4 p-5 text-white bg-slate-950/92 border-border/60 border-t md:grid-cols-[1fr_auto]">
              <div className="space-y-4">
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="px-4 py-3 text-sm text-white/72 bg-white/6 border border-white/12 rounded-xl">
                    <div className="font-semibold text-white">Search window</div>
                    <div className="mt-1">{windowLabel}</div>
                  </div>
                  <div className="px-4 py-3 text-sm text-white/72 bg-white/6 border border-white/12 rounded-xl">
                    <div className="font-semibold text-white">Property marker</div>
                    <div className="mt-1">{data?.location?.name || 'Selected location'}</div>
                  </div>
                  <div className="px-4 py-3 text-sm text-white/72 bg-white/6 border border-white/12 rounded-xl">
                    <div className="font-semibold text-white">Validated storms</div>
                    <div className="mt-1">
                      {stormEvents.length
                        ? `${stormEvents.length} storm day${stormEvents.length === 1 ? '' : 's'} found`
                        : 'No storm days found'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-sm">
                    {alerts[0]?.event || daily?.weatherLabel || 'Weather outlook'}
                  </div>
                  <div className="mt-1 leading-6 text-sm text-white/72">
                    {alerts[0]?.headline ||
                      `For ${data?.location?.name || 'this area'}, forecast conditions for ${formatDate(daily?.date)} show ${formatNumber(
                        daily?.precipitationProbabilityMax,
                        '%',
                      )} precipitation probability and gusts up to ${formatNumber(daily?.windGustMax, ' mph')}.`}
                  </div>
                </div>

                {hailLayer ? (
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="px-4 py-3 text-sm text-white/72 bg-white/6 border border-white/12 rounded-xl">
                      <div className="font-semibold text-white">Radar hail signatures</div>
                      <div className="mt-1">{hailLayer.hailSignatures.length} points in the last 30 days</div>
                    </div>
                    <div className="px-4 py-3 text-sm text-white/72 bg-white/6 border border-white/12 rounded-xl">
                      <div className="font-semibold text-white">Storm reports</div>
                      <div className="mt-1">
                        {hailLayer.stormReports.length} hail-related reports in the last 30 days
                      </div>
                    </div>
                    <div className="px-4 py-3 text-sm text-white/72 bg-white/6 border border-white/12 rounded-xl">
                      <div className="font-semibold text-white">Legend</div>
                      <div className="mt-1">
                        Orange = radar hail signature, cyan = storm report, orange dot = property
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <div className="font-semibold text-sm text-white">Storm evidence in the last 30 days</div>
                  {stormEvents.length ? (
                    <div className="grid gap-3">
                      {stormEvents.map((storm) => (
                        <div
                          key={storm.id}
                          className="px-4 py-4 bg-white/6 border border-white/12 rounded-xl"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-semibold text-sm text-white">
                              {formatStormDate(storm.date)}
                            </div>
                            <div className="px-2 py-1 font-semibold text-[11px] text-white/72 tracking-[0.14em] border border-white/12 rounded-full uppercase">
                              {storm.validationLevel === 'strong' ? 'dual source' : 'single source'}
                            </div>
                            <div className="text-white/60 text-xs">
                              Nearest point: {formatDistance(storm.nearestDistanceMiles)}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-white">{storm.summary}</div>
                          <div className="mt-1 text-sm text-white/72">{storm.sourceSummary}</div>
                          <div className="flex flex-wrap gap-3 mt-2 text-white/62 text-xs">
                            <span>{storm.hailSignatureCount} radar signatures</span>
                            <span>{storm.stormReportCount} hail reports</span>
                            {storm.maxHailSize ? <span>Max hail size: {storm.maxHailSize} in</span> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-white/72 bg-white/6 border border-white/12 rounded-xl">
                      No hail-signature or hail-report evidence was found for this search window.
                    </div>
                  )}
                </div>

                {alerts.length ? (
                  <div className="grid gap-2">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="px-4 py-3 bg-white/6 border border-white/12 rounded-xl">
                        <div className="font-semibold text-sm">{alert.event}</div>
                        <div className="mt-1 text-sm text-white/72">{alert.area}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-white/72 bg-white/6 border border-white/12 rounded-xl">
                    No active NWS alerts are posted for this point right now. Treat that as one data point,
                    then confirm conditions with a roof inspection if you saw recent impact.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
