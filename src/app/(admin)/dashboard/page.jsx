import Link from 'next/link'
import { FileText, Globe2, Server, SquarePen } from 'lucide-react'

import LaunchChecklistCard from '@/components/admin/LaunchChecklistCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGoogleAnalyticsSnapshot } from '@/lib/analytics/google'
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
  const gaSnapshot = await getGoogleAnalyticsSnapshot()
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
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl text-foreground tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Manage content, workflows, and infrastructure for Austin Leads.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="pr-8 px-3 py-1.5 text-muted-foreground text-sm bg-background border border-border rounded-md shadow-theme-sm appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-foreground">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>All time</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 mb-8 lg:gap-6 grid-cols-1 md:grid-cols-3">
          {statCards.map((metric) => {
            const Icon = metric.icon

            return (
              <Card key={metric.key} className="shadow-theme-sm">
                <CardHeader className="flex items-start justify-between pb-4">
                  <span className="font-medium text-muted-foreground text-sm">{metric.label}</span>
                  <div className="flex items-center justify-center h-8 w-8 text-muted-foreground bg-muted border border-border rounded-full">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl text-foreground tracking-tight">{counts[metric.key]}</h2>
                    <span className="font-medium text-muted-foreground text-sm">
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

        <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base text-foreground">Publishing Workflow</h3>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-theme-sm overflow-hidden">
              <div className="grid gap-4 px-5 py-3 font-medium text-muted-foreground text-sm tracking-wider bg-muted/40 border-b border-border grid-cols-12 uppercase">
                <div className="col-span-6 md:col-span-5">Title</div>
                <div className="hidden md:block col-span-3">Site</div>
                <div className="text-left col-span-4 md:col-span-2">Status</div>
                <div className="hidden md:block text-right col-span-2">Date</div>
              </div>

              {jobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  className="grid gap-4 px-5 py-4 text-sm border-b border-border last:border-b-0 grid-cols-12"
                >
                  <div className="col-span-6 md:col-span-5">
                    <div className="font-medium text-foreground">{job.title}</div>
                    <div className="text-muted-foreground text-sm">{job.contentType}</div>
                  </div>
                  <div className="hidden md:block text-muted-foreground col-span-3">{job.siteSlug}</div>
                  <div className="col-span-4 md:col-span-2">
                    <span className="px-2 py-1 font-medium text-foreground text-sm bg-muted rounded-full">
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="hidden md:block text-muted-foreground text-right text-sm col-span-2">
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
                {gaSnapshot?.status === 'available' ? (
                  <>
                    <div className="p-4 bg-muted/30 border border-border rounded-xl">
                      <div className="font-medium text-foreground text-sm">
                        GA4 last {gaSnapshot.windowDays} days
                      </div>
                      <div className="grid gap-3 mt-3 grid-cols-2">
                        <div>
                          <div className="font-medium text-muted-foreground text-xs tracking-[0.16em] uppercase">
                            Users
                          </div>
                          <div className="mt-1 font-semibold text-2xl text-foreground tracking-tight">
                            {gaSnapshot.totalUsers.toLocaleString('en-US')}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground text-xs tracking-[0.16em] uppercase">
                            Sessions
                          </div>
                          <div className="mt-1 font-semibold text-2xl text-foreground tracking-tight">
                            {gaSnapshot.sessions.toLocaleString('en-US')}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground text-xs tracking-[0.16em] uppercase">
                            Page views
                          </div>
                          <div className="mt-1 font-semibold text-2xl text-foreground tracking-tight">
                            {gaSnapshot.pageViews.toLocaleString('en-US')}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground text-xs tracking-[0.16em] uppercase">
                            Conversions
                          </div>
                          <div className="mt-1 font-semibold text-2xl text-foreground tracking-tight">
                            {gaSnapshot.conversions.toLocaleString('en-US')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl">
                      Property {gaSnapshot.propertyId}
                      {gaSnapshot.measurementId ? ` · ${gaSnapshot.measurementId}` : ''} · Engagement rate{' '}
                      {gaSnapshot.engagementRate.toFixed(1)}%
                    </div>
                  </>
                ) : gaSnapshot?.status === 'error' ? (
                  <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl">
                    Google Analytics is configured, but the admin could not read the reporting API.{' '}
                    {gaSnapshot.error}
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-muted/30 border border-border rounded-xl">
                      <div className="font-medium text-foreground text-sm">Connected providers</div>
                      <div className="mt-2 font-semibold text-2xl text-foreground tracking-tight">
                        {analytics.connectedProviders}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 border border-border rounded-xl">
                      <div className="font-medium text-foreground text-sm">Active goals</div>
                      <div className="mt-2 font-semibold text-2xl text-foreground tracking-tight">
                        {analytics.configuredGoals}
                      </div>
                    </div>
                    <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl">
                      GA4 reporting appears unavailable. Add GOOGLE_ANALYTICS_PROPERTY_ID and service account
                      credentials to surface live reporting here.
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-theme-sm">
              <CardHeader>
                <CardTitle className="text-base">Leads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 grid-cols-3">
                  <div className="p-4 bg-muted/30 border border-border rounded-xl">
                    <div className="font-medium text-foreground text-sm">Total</div>
                    <div className="mt-2 font-semibold text-2xl text-foreground tracking-tight">
                      {leadOverview.total}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-xl">
                    <div className="font-medium text-foreground text-sm">Last 30 days</div>
                    <div className="mt-2 font-semibold text-2xl text-foreground tracking-tight">
                      {leadOverview.last_30_days}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-xl">
                    <div className="font-medium text-foreground text-sm">Open</div>
                    <div className="mt-2 font-semibold text-2xl text-foreground tracking-tight">
                      {leadOverview.open}
                    </div>
                  </div>
                </div>

                {!leadDbReady ? (
                  <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl">
                    Add `DATABASE_URL` or `NEON_DATABASE_URL`, then run `pnpm db:setup` to enable live lead
                    capture and dashboard reporting.
                  </div>
                ) : recentLeads.length ? (
                  <div className="border border-border rounded-xl overflow-hidden">
                    {recentLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="grid gap-1 px-4 py-3 text-sm border-b border-border last:border-b-0"
                      >
                        <div className="font-medium text-foreground">{lead.full_name}</div>
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
                  <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl">
                    The database is connected, but no lead submissions have been captured yet.
                  </div>
                )}
                <Link
                  href="/crm"
                  className="items-center px-3 py-2 font-medium text-foreground text-sm bg-background border border-border rounded-md hover:bg-muted transition-colors inline-flex"
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
                <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl">
                  {domains.length} domains are tracked in the inventory.
                </div>
                <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl">
                  {sites.filter((site) => site.tier === 'redirect').length} domains are modeled as redirects.
                </div>
                <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl">
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
