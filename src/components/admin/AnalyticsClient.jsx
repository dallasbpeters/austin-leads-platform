"use client";

import { startTransition, useEffect, useState } from "react";
import { Gauge, RefreshCcw, Settings2, Target, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

async function request(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error("Request failed.");
  }

  return response.json();
}

function number(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function AnalyticsClient({ overview, providers, goals, sites }) {
  const [goalList, setGoalList] = useState(goals);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    scope: "site",
    siteSlug: sites[0]?.slug || "all",
    eventName: "",
    targetValue: "",
    interval: "monthly",
    owner: "Platform Ops",
    notes: "",
  });

  useEffect(() => {
    setGoalList(goals);
  }, [goals]);

  async function refreshGoals() {
    setLoading(true);

    try {
      const data = await request("/api/analytics/goals");
      setGoalList(data.goals);
    } finally {
      setLoading(false);
    }
  }

  async function submitGoal(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await request("/api/analytics/goals", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({
        name: "",
        scope: "site",
        siteSlug: sites[0]?.slug || "all",
        eventName: "",
        targetValue: "",
        interval: "monthly",
        owner: "Platform Ops",
        notes: "",
      });
      await refreshGoals();
    } finally {
      setLoading(false);
    }
  }

  async function updateGoal(goalId, status) {
    setLoading(true);

    try {
      await request(`/api/analytics/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await refreshGoals();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage provider connectivity, instrumentation readiness, and KPI definitions.
            </p>
          </div>
          <Button variant="outline" onClick={() => startTransition(refreshGoals)} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh goals
          </Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Connected providers", value: number(overview.connectedProviders), icon: TrendingUp },
            { label: "Active goals", value: number(overview.configuredGoals), icon: Target },
            { label: "Protected admin APIs", value: number(overview.protectedAdminApis), icon: Settings2 },
            { label: "Instrumented custom events", value: number(overview.eventsInstrumented), icon: Gauge },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <Card key={metric.label} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold tracking-tight text-foreground">{metric.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Provider status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{provider.name}</div>
                        <div className="text-xs text-muted-foreground">{provider.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={provider.connected ? "default" : "outline"}>{provider.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{provider.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Instrumentation notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Vercel Web Analytics and Speed Insights are mounted in the root layout, so telemetry begins once the app is deployed on Vercel.",
                "This page no longer invents sessions, leads, or conversion rates. It shows real provider readiness and the KPI definitions your team actually controls.",
                "Add GA4 or Search Console environment variables when you want a second reporting source layered onto Vercel telemetry.",
              ].map((text) => (
                <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-7 text-muted-foreground" key={text}>
                  {text}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Create analytics goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={submitGoal}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Goal name</label>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Hero site lead form submit"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">Scope</label>
                    <Select value={form.scope} onValueChange={(value) => setForm((current) => ({ ...current, scope: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="site">Site</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">Site</label>
                    <Select value={form.siteSlug} onValueChange={(value) => setForm((current) => ({ ...current, siteSlug: value }))}>
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
                    <label className="text-sm font-medium text-foreground">Event name</label>
                    <Input
                      value={form.eventName}
                      onChange={(event) => setForm((current) => ({ ...current, eventName: event.target.value }))}
                      placeholder="lead_form_submitted"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">Target value</label>
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
                    <label className="text-sm font-medium text-foreground">Interval</label>
                    <Select value={form.interval} onValueChange={(value) => setForm((current) => ({ ...current, interval: value }))}>
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
                    <label className="text-sm font-medium text-foreground">Owner</label>
                    <Input
                      value={form.owner}
                      onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Notes</label>
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

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Managed goals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead>Scope</TableHead>
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
                        <div className="text-xs text-muted-foreground">{goal.eventName}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {goal.scope} · {goal.siteSlug}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {number(goal.targetValue)} / {goal.interval}
                      </TableCell>
                      <TableCell>
                        <Badge variant={goal.status === "active" ? "default" : "outline"}>
                          {goal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={() => updateGoal(goal.id, goal.status === "active" ? "paused" : "active")}
                        >
                          {goal.status === "active" ? "Pause" : "Resume"}
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
  );
}
