import Link from 'next/link'
import { FileText, Globe2, Server, SquarePen } from 'lucide-react'

import LaunchChecklistCard from '@/components/admin/LaunchChecklistCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ensureLeadSubmissionsTable,
  getLeadSubmissionOverview,
  hasLeadDatabase,
  listRecentLeadSubmissions,
} from '@/lib/leads/db'
import { getAllRenderableSites, getAllSites, getLaunchChecklist } from '@/lib/platform/content'
import { getAnalyticsOverview, listDomainRecords, listPublishJobs } from '@/lib/platform/store'

const statCards = [
  { label: 'Published Content', key: 'jobs', icon: FileText },
  { label: 'Pending Reviews', key: 'queued', icon: SquarePen },
  { label: 'Active Domains', key: 'domains', icon: Server },
]

export default async function DashboardPage() {
  const sites = getAllSites()
  const liveSites = getAllRenderableSites()
  const domains = listDomainRecords()
  const jobs = listPublishJobs()
  const analytics = getAnalyticsOverview()
  const checklist = await getLaunchChecklist()
  let leadOverview = { total: 0, last_30_days: 0, open: 0 }
  let recentLeads = []
  let leadDbReady = false

  if (hasLeadDatabase()) {
    try {
      await ensureLeadSubmissionsTable()
      leadOverview = await getLeadSubmissionOverview()
      recentLeads = await listRecentLeadSubmissions(5)
      leadDbReady = true
    } catch {
      leadDbReady = false
    }
  }

  const counts = {
    jobs: jobs.length,
    queued: jobs.filter((job) => job.reviewStatus !== 'published').length,
    domains: domains.length,
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-foreground text-2xl tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage content, workflows, and infrastructure for Austin Leads.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="shadow-theme-sm border-border bg-background text-muted-foreground focus:ring-foreground cursor-pointer appearance-none rounded-md border px-3 py-1.5 pr-8 text-sm outline-none focus:ring-2">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>All time</option>
            </select>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {statCards.map((metric) => {
            const Icon = metric.icon

            return (
              <Card key={metric.key} className="shadow-theme-sm">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <span className="text-muted-foreground text-sm font-medium">{metric.label}</span>
                  <div className="border-border bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-foreground text-3xl tracking-tight">{counts[metric.key]}</h2>
                    <span className="text-muted-foreground text-sm font-medium">
                      {metric.key === 'domains'
                        ? `${liveSites.filter((site) => site.tier === 'hero').length} Hero Domains`
                        : metric.key === 'queued'
                          ? 'Action required'
                          : 'Current queue'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-base">Publishing Workflow</h3>
            </div>

            <div className="shadow-theme-sm border-border bg-card overflow-hidden rounded-xl border">
              <div className="border-border bg-muted/40 text-muted-foreground grid grid-cols-12 gap-4 border-b px-5 py-3 text-sm font-medium tracking-wider uppercase">
                <div className="col-span-6 md:col-span-5">Title</div>
                <div className="col-span-3 hidden md:block">Site</div>
                <div className="col-span-4 text-left md:col-span-2">Status</div>
                <div className="col-span-2 hidden text-right md:block">Date</div>
              </div>

              {jobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  className="border-border grid grid-cols-12 gap-4 border-b px-5 py-4 text-sm last:border-b-0"
                >
                  <div className="col-span-6 md:col-span-5">
                    <div className="text-foreground font-medium">{job.title}</div>
                    <div className="text-muted-foreground text-sm">{job.contentType}</div>
                  </div>
                  <div className="text-muted-foreground col-span-3 hidden md:block">{job.siteSlug}</div>
                  <div className="col-span-4 md:col-span-2">
                    <span className="bg-muted text-foreground rounded-full px-2 py-1 text-sm font-medium">
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-muted-foreground col-span-2 hidden text-right text-sm md:block">
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            <LaunchChecklistCard checklist={checklist} />
          </div>

          <div className="flex flex-col gap-6">
            <Card className="shadow-theme-sm">
              <CardHeader>
                <CardTitle className="text-base">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-border bg-muted/30 rounded-xl border p-4">
                  <div className="text-foreground text-sm font-medium">Connected providers</div>
                  <div className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
                    {analytics.connectedProviders}
                  </div>
                </div>
                <div className="border-border bg-muted/30 rounded-xl border p-4">
                  <div className="text-foreground text-sm font-medium">Active goals</div>
                  <div className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
                    {analytics.configuredGoals}
                  </div>
                </div>
                <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-4 text-sm leading-6">
                  Real analytics is now instrumentation-first. The admin surface shows provider status and KPI
                  configuration until live data sources are connected.
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-theme-sm">
              <CardHeader>
                <CardTitle className="text-base">Leads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="border-border bg-muted/30 rounded-xl border p-4">
                    <div className="text-foreground text-sm font-medium">Total</div>
                    <div className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
                      {leadOverview.total}
                    </div>
                  </div>
                  <div className="border-border bg-muted/30 rounded-xl border p-4">
                    <div className="text-foreground text-sm font-medium">Last 30 days</div>
                    <div className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
                      {leadOverview.last_30_days}
                    </div>
                  </div>
                  <div className="border-border bg-muted/30 rounded-xl border p-4">
                    <div className="text-foreground text-sm font-medium">Open</div>
                    <div className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
                      {leadOverview.open}
                    </div>
                  </div>
                </div>

                {!leadDbReady ? (
                  <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-4 text-sm leading-6">
                    Add `DATABASE_URL` or `NEON_DATABASE_URL`, then run `pnpm db:setup` to enable live lead
                    capture and dashboard reporting.
                  </div>
                ) : recentLeads.length ? (
                  <div className="border-border overflow-hidden rounded-xl border">
                    {recentLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="border-border grid gap-1 border-b px-4 py-3 text-sm last:border-b-0"
                      >
                        <div className="text-foreground font-medium">{lead.full_name}</div>
                        <div className="text-muted-foreground">
                          {lead.email}
                          {lead.phone ? ` · ${lead.phone}` : ''}
                        </div>
                        <div className="text-muted-foreground text-sm tracking-[0.16em] uppercase">
                          {lead.service_interest || lead.source_type} · {lead.source_domain} ·{' '}
                          {lead.page_path}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-4 text-sm leading-6">
                    The database is connected, but no lead submissions have been captured yet.
                  </div>
                )}
                <Link
                  href="/crm"
                  className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                >
                  Open CRM
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-theme-sm">
              <CardHeader>
                <CardTitle className="text-base">Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-4 text-sm leading-6">
                  {domains.length} domains are tracked in the inventory.
                </div>
                <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-4 text-sm leading-6">
                  {sites.filter((site) => site.tier === 'redirect').length} domains are modeled as redirects.
                </div>
                <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-4 text-sm leading-6">
                  Domain connection and verification stay managed through the dedicated Domains route.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
