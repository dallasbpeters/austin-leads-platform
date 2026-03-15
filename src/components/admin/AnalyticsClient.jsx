'use client'

import { startTransition } from 'react'
import { DatabaseZap, RefreshCcw, Target, TriangleAlert, Waypoints } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useAnalyticsManager } from '@/hooks/useAnalyticsManager'
import { formatAnalyticsNumber } from '@/services/admin/analytics'

function formatPercent(value) {
  return `${value.toFixed(1)}%`
}

export default function AnalyticsClient({ overview, providers, gaSnapshot, goals, sites }) {
  const { form, goalList, loading, refreshGoals, setForm, submitGoal, updateGoal } = useAnalyticsManager({
    goals,
    sites,
  })
  const gaProvider = providers.find((provider) => provider.id === 'ga4')

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl text-foreground tracking-tight">Analytics</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Manage provider connectivity, instrumentation readiness, and KPI definitions.
            </p>
          </div>
          <Button variant="outline" onClick={() => startTransition(refreshGoals)} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh goals
          </Button>
        </div>

        <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-4">
          {(gaSnapshot?.status === 'available'
            ? [
                { label: 'GA4 users', value: formatAnalyticsNumber(gaSnapshot.totalUsers), icon: Waypoints },
                {
                  label: 'GA4 sessions',
                  value: formatAnalyticsNumber(gaSnapshot.sessions),
                  icon: DatabaseZap,
                },
                {
                  label: 'GA4 page views',
                  value: formatAnalyticsNumber(gaSnapshot.pageViews),
                  icon: Target,
                },
                {
                  label: 'GA4 engagement',
                  value: formatPercent(gaSnapshot.engagementRate),
                  icon: TriangleAlert,
                },
              ]
            : [
                {
                  label: 'Connected providers',
                  value: formatAnalyticsNumber(overview.connectedProviders),
                  icon: Waypoints,
                },
                {
                  label: 'Active goals',
                  value: formatAnalyticsNumber(overview.configuredGoals),
                  icon: Target,
                },
                {
                  label: 'Live reporting feeds',
                  value: formatAnalyticsNumber(overview.liveReportingSources),
                  icon: DatabaseZap,
                },
                {
                  label: 'Providers needing action',
                  value: formatAnalyticsNumber(overview.providersNeedingAction),
                  icon: TriangleAlert,
                },
              ]
          ).map((metric) => {
            const Icon = metric.icon

            return (
              <Card key={metric.label} className="shadow-theme-sm">
                <CardHeader className="flex items-center justify-between pb-3 space-y-0">
                  <CardTitle className="font-medium text-muted-foreground text-sm">{metric.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-semibold text-3xl text-foreground tracking-tight">{metric.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6">
          <Card className="shadow-theme-sm">
            <CardHeader>
              <CardTitle>Google Analytics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {gaSnapshot?.status === 'available' ? (
                <div className="p-4 text-sm bg-muted/20 border border-border rounded-xl">
                  <div className="font-medium text-foreground">Live GA4 report</div>
                  <div className="mt-1 leading-6 text-muted-foreground">
                    Property {gaSnapshot.propertyId}
                    {gaSnapshot.measurementId ? ` · ${gaSnapshot.measurementId}` : ''} · last{' '}
                    {gaSnapshot.windowDays} days · {formatAnalyticsNumber(gaSnapshot.conversions)} conversions
                  </div>
                </div>
              ) : null}
              {!gaSnapshot && gaProvider ? (
                <div className="grid gap-3 p-4 bg-muted/20 border border-border rounded-xl md:grid-cols-[1fr_1fr]">
                  <div>
                    <div className="font-medium text-foreground">Instrumentation</div>
                    <div className="mt-1 leading-6 text-muted-foreground text-sm">
                      {gaProvider.connected
                        ? `GA4 is installed on the site with measurement ID ${gaProvider.source}.`
                        : 'GA4 is not installed on the site yet.'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Admin reporting</div>
                    <div className="mt-1 leading-6 text-muted-foreground text-sm">{gaProvider.nextStep}</div>
                  </div>
                </div>
              ) : null}
              {gaSnapshot?.status === 'error' ? (
                <div className="p-4 text-sm bg-muted/20 border border-border rounded-xl">
                  <div className="font-medium text-foreground">GA4 reporting error</div>
                  <div className="mt-1 leading-6 text-muted-foreground">{gaSnapshot.error}</div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-theme-sm">
            <CardHeader>
              <CardTitle>Create analytics goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={submitGoal}>
                <div className="grid gap-2">
                  <label className="font-medium text-foreground text-sm">Goal name</label>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Hero site lead form submit"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="font-medium text-foreground text-sm">Goal level</label>
                    <Select
                      value={form.goalLevel}
                      onValueChange={(value) => setForm((current) => ({ ...current, goalLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose goal level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="site">Site</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="font-medium text-foreground text-sm">Site</label>
                    <Select
                      value={form.siteSlug}
                      onValueChange={(value) => setForm((current) => ({ ...current, siteSlug: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose site" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All sites</SelectItem>
                        {sites.map((site) => (
                          <SelectItem key={site.slug} value={site.slug}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="font-medium text-foreground text-sm">Event name</label>
                    <Input
                      value={form.eventName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, eventName: event.target.value }))
                      }
                      placeholder="lead_form_submitted"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="font-medium text-foreground text-sm">Target value</label>
                    <Input
                      value={form.targetValue}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, targetValue: event.target.value }))
                      }
                      placeholder="180"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="font-medium text-foreground text-sm">Interval</label>
                    <Select
                      value={form.interval}
                      onValueChange={(value) => setForm((current) => ({ ...current, interval: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="font-medium text-foreground text-sm">Owner</label>
                    <Input
                      value={form.owner}
                      onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="font-medium text-foreground text-sm">Notes</label>
                  <Textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Why this KPI matters and how it should be interpreted."
                  />
                </div>
                <Button disabled={loading || !form.name || !form.eventName} type="submit">
                  Save goal
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-theme-sm">
            <CardHeader>
              <CardTitle>Managed goals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goalList.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{goal.name}</div>
                        <div className="text-muted-foreground text-sm">{goal.eventName}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {goal.goalLevel || goal.scope || 'site'} · {goal.siteSlug}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatAnalyticsNumber(goal.targetValue)} / {goal.interval}
                      </TableCell>
                      <TableCell>
                        <Badge variant={goal.status === 'active' ? 'default' : 'outline'}>
                          {goal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={() => updateGoal(goal.id, goal.status === 'active' ? 'paused' : 'active')}
                        >
                          {goal.status === 'active' ? 'Pause' : 'Resume'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
