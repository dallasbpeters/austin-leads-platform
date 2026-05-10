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
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-foreground text-2xl tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage provider connectivity, instrumentation readiness, and KPI definitions.
            </p>
          </div>
          <Button variant="outline" onClick={() => startTransition(refreshGoals)} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh goals
          </Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                <CardHeader className="flex items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-muted-foreground text-sm font-medium">{metric.label}</CardTitle>
                  <Icon className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-foreground text-3xl font-semibold tracking-tight">{metric.value}</div>
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
                <div className="bg-muted/20 border-border rounded-xl border p-4 text-sm">
                  <div className="text-foreground font-medium">Live GA4 report</div>
                  <div className="text-muted-foreground mt-1 leading-6">
                    Property {gaSnapshot.propertyId}
                    {gaSnapshot.measurementId ? ` · ${gaSnapshot.measurementId}` : ''} · last{' '}
                    {gaSnapshot.windowDays} days · {formatAnalyticsNumber(gaSnapshot.conversions)} conversions
                  </div>
                </div>
              ) : null}
              {!gaSnapshot && gaProvider ? (
                <div className="bg-muted/20 border-border grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_1fr]">
                  <div>
                    <div className="text-foreground font-medium">Instrumentation</div>
                    <div className="text-muted-foreground mt-1 text-sm leading-6">
                      {gaProvider.connected
                        ? `GA4 is installed on the site with measurement ID ${gaProvider.source}.`
                        : 'GA4 is not installed on the site yet.'}
                    </div>
                  </div>
                  <div>
                    <div className="text-foreground font-medium">Admin reporting</div>
                    <div className="text-muted-foreground mt-1 text-sm leading-6">{gaProvider.nextStep}</div>
                  </div>
                </div>
              ) : null}
              {gaSnapshot?.status === 'error' ? (
                <div className="bg-muted/20 border-border rounded-xl border p-4 text-sm">
                  <div className="text-foreground font-medium">GA4 reporting error</div>
                  <div className="text-muted-foreground mt-1 leading-6">{gaSnapshot.error}</div>
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
                  <label className="text-foreground text-sm font-medium">Goal name</label>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Hero site lead form submit"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-foreground text-sm font-medium">Goal level</label>
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
                    <label className="text-foreground text-sm font-medium">Site</label>
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
                    <label className="text-foreground text-sm font-medium">Event name</label>
                    <Input
                      value={form.eventName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, eventName: event.target.value }))
                      }
                      placeholder="lead_form_submitted"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-foreground text-sm font-medium">Target value</label>
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
                    <label className="text-foreground text-sm font-medium">Interval</label>
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
                    <label className="text-foreground text-sm font-medium">Owner</label>
                    <Input
                      value={form.owner}
                      onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-foreground text-sm font-medium">Notes</label>
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
                        <div className="text-foreground font-medium">{goal.name}</div>
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
