'use client'

import Link from 'next/link'
import { CloudRainWind, LocateFixed, MapPin, ShieldAlert, TriangleAlert, Wind } from 'lucide-react'

import { useHailWeatherLookup } from '@/hooks/useHailWeatherLookup'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

function riskTone(level) {
  if (level === 'high') {
    return 'border-red-500/30 bg-red-500/8 text-red-100'
  }

  if (level === 'elevated') {
    return 'border-amber-400/35 bg-amber-400/10 text-amber-50'
  }

  return 'border-cyan-300/25 bg-cyan-300/10 text-cyan-50'
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

export default function HailWeatherLookup({ section }) {
  const { data, error, isPending, query, setQuery, searchByQuery, searchByCurrentLocation } =
    useHailWeatherLookup('Austin, TX')

  const current = data?.current
  const daily = data?.daily?.[0]
  const alerts = data?.alerts || []
  const risk = data?.risk

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      <div className="space-y-5">
        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-foreground">
          Hail in your area
        </Badge>
        <div className="space-y-4">
          <h2 className="text-3xl tracking-tight text-foreground md:text-4xl">{section.title}</h2>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">{section.body}</p>
        </div>

        <form
          className="grid gap-3 md:grid-cols-[1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            searchByQuery()
          }}
        >
          <Input
            className="h-11 border-border/70 bg-white/90"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter ZIP code, city, or neighborhood"
            value={query}
          />
          <Button className="h-11" disabled={isPending}>
            {isPending ? 'Checking…' : 'Check weather'}
          </Button>
          <Button className="h-11" disabled={isPending} onClick={searchByCurrentLocation} type="button" variant="outline">
            <LocateFixed className="size-4" />
            Current location
          </Button>
        </form>

        {error ? (
          <Card className="border-red-500/20 bg-red-500/5 text-red-900">
            <CardContent className="p-4 text-sm">{error}</CardContent>
          </Card>
        ) : null}

        {risk ? (
          <Card className="border-border/80 bg-card">
            <CardContent className="grid gap-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${riskTone(risk.level)}`}>
                  <ShieldAlert className="size-3.5" />
                  {risk.level} risk
                </div>
                {data?.location?.name ? (
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {data.location.name}
                  </div>
                ) : null}
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{risk.headline}</div>
                <div className="mt-1 text-sm leading-7 text-muted-foreground">{risk.detail}</div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border-border/80 bg-card">
            <CardContent className="p-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <CloudRainWind className="size-4" />
                Conditions
              </div>
              <div className="mt-3 text-lg font-semibold text-foreground">{current?.weatherLabel || 'Loading'}</div>
              <div className="mt-1 text-sm text-muted-foreground">{formatNumber(current?.temperature, '°')} right now</div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card">
            <CardContent className="p-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Wind className="size-4" />
                Gusts
              </div>
              <div className="mt-3 text-lg font-semibold text-foreground">{formatNumber(daily?.windGustMax, ' mph')}</div>
              <div className="mt-1 text-sm text-muted-foreground">Forecast max today</div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card">
            <CardContent className="p-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <TriangleAlert className="size-4" />
                Alerts
              </div>
              <div className="mt-3 text-lg font-semibold text-foreground">{alerts.length}</div>
              <div className="mt-1 text-sm text-muted-foreground">Active NWS alerts nearby</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3">
          {(section.items || []).map((item) => (
            <Card key={item.title} className="border-border/80 bg-card">
              <CardContent className="p-4">
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <div className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden border-border/80 bg-card">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl text-foreground">Live storm view</CardTitle>
            {data?.updatedAt ? (
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Updated {new Date(data.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid min-h-[30rem] lg:grid-rows-[1fr_auto]">
            {data?.mapEmbedUrl ? (
              <iframe
                className="h-full min-h-[22rem] w-full border-0"
                loading="lazy"
                src={data.mapEmbedUrl}
                title="Storm location map"
              />
            ) : (
              <div className="flex min-h-[22rem] items-center justify-center bg-[linear-gradient(180deg,#102230,#1b3344)] text-sm text-white/70">
                Loading map…
              </div>
            )}

            <div className="grid gap-4 border-t border-border/60 bg-slate-950/92 p-5 text-white md:grid-cols-[1fr_auto] md:items-start">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold">
                    {alerts[0]?.event || daily?.weatherLabel || 'Weather outlook'}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-white/72">
                    {alerts[0]?.headline ||
                      `For ${data?.location?.name || 'this area'}, forecast conditions for ${formatDate(daily?.date)} show ${formatNumber(
                        daily?.precipitationProbabilityMax,
                        '%',
                      )} precipitation probability and gusts up to ${formatNumber(daily?.windGustMax, ' mph')}.`}
                  </div>
                </div>

                {alerts.length ? (
                  <div className="grid gap-2">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="rounded-xl border border-white/12 bg-white/6 px-4 py-3">
                        <div className="text-sm font-semibold">{alert.event}</div>
                        <div className="mt-1 text-sm text-white/72">{alert.area}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white/72">
                    No active NWS alerts are posted for this point right now. Use this as a storm signal, then confirm with a roof inspection if you saw recent impact.
                  </div>
                )}
              </div>

              {section.ctaHref ? (
                <Button asChild size="sm">
                  <Link href={section.ctaHref}>{section.ctaLabel || 'Request a roof review'}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
