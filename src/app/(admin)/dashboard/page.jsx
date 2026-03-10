import { FileText, Globe2, Server, SquarePen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllRenderableSites, getAllSites } from "@/lib/platform/content";
import { getAnalyticsOverview, listDomainRecords, listPublishJobs } from "@/lib/platform/store";

const statCards = [
  { label: "Published Content", key: "jobs", icon: FileText },
  { label: "Pending Reviews", key: "queued", icon: SquarePen },
  { label: "Active Domains", key: "domains", icon: Server },
];

export default function DashboardPage() {
  const sites = getAllSites();
  const liveSites = getAllRenderableSites();
  const domains = listDomainRecords();
  const jobs = listPublishJobs();
  const analytics = getAnalyticsOverview();

  const counts = {
    jobs: jobs.length,
    queued: jobs.filter((job) => job.reviewStatus !== "published").length,
    domains: domains.length,
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage content, workflows, and infrastructure for Austin Leads.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="shadow-theme-sm cursor-pointer appearance-none rounded-md border border-border bg-background px-3 py-1.5 pr-8 text-sm text-muted-foreground outline-none focus:ring-2 focus:ring-foreground">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>All time</option>
            </select>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {statCards.map((metric) => {
            const Icon = metric.icon;

            return (
              <Card key={metric.key} className="shadow-theme-sm">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl tracking-tight text-foreground">
                      {counts[metric.key]}
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground">
                      {metric.key === "domains"
                        ? `${liveSites.filter((site) => site.tier === "hero").length} Hero Domains`
                        : metric.key === "queued"
                          ? "Action required"
                          : "Current queue"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base text-foreground">Publishing Workflow</h3>
            </div>

            <div className="shadow-theme-sm overflow-hidden rounded-xl border border-border bg-card">
              <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <div className="col-span-6 md:col-span-5">Title</div>
                <div className="col-span-3 hidden md:block">Site</div>
                <div className="col-span-4 md:col-span-2 text-left">Status</div>
                <div className="col-span-2 hidden text-right md:block">Date</div>
              </div>

              {jobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  className="grid grid-cols-12 gap-4 border-b border-border px-5 py-4 text-sm last:border-b-0"
                >
                  <div className="col-span-6 md:col-span-5">
                    <div className="font-medium text-foreground">{job.title}</div>
                    <div className="text-xs text-muted-foreground">{job.contentType}</div>
                  </div>
                  <div className="col-span-3 hidden text-muted-foreground md:block">{job.siteSlug}</div>
                  <div className="col-span-4 md:col-span-2">
                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">
                      {job.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="col-span-2 hidden text-right text-xs text-muted-foreground md:block">
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="shadow-theme-sm">
              <CardHeader>
                <CardTitle className="text-base">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="text-sm font-medium text-foreground">Connected providers</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {analytics.connectedProviders}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="text-sm font-medium text-foreground">Active goals</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {analytics.configuredGoals}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                  Real analytics is now instrumentation-first. The admin surface shows provider status and KPI
                  configuration until live data sources are connected.
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-theme-sm">
              <CardHeader>
                <CardTitle className="text-base">Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                  {domains.length} domains are tracked in the inventory.
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                  {sites.filter((site) => site.tier === "redirect").length} domains are modeled as redirects.
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                  Domain connection and verification stay managed through the dedicated Domains route.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
