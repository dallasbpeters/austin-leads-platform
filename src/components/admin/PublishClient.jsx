"use client";

import { startTransition, useEffect, useState } from "react";
import { CheckCircle2, Clock3, LoaderCircle, RefreshCcw, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const statusTone = {
  queued: "secondary",
  draft_ready: "default",
  approved: "default",
  rejected: "destructive",
  published: "default",
};

const statusIcon = {
  queued: Clock3,
  draft_ready: CheckCircle2,
  approved: CheckCircle2,
  rejected: XCircle,
  published: CheckCircle2,
};

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

function JobStatus({ status }) {
  const Icon = statusIcon[status] || LoaderCircle;

  return (
    <Badge variant={statusTone[status] || "outline"} className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export default function PublishClient({ initialJobs, sites }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    siteSlug: sites[0]?.slug || "",
    contentType: "post",
    title: "",
    prompt: "",
    provider: "placeholder-openai",
    model: "gpt-4.1",
    sources: "",
  });

  async function refreshJobs() {
    setLoading(true);

    try {
      const data = await request("/api/publish-jobs");
      setJobs(data.jobs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  async function submitJob(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await request("/api/publish-jobs", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          sources: form.sources
            .split("\n")
            .map((source) => source.trim())
            .filter(Boolean),
        }),
      });

      setForm((current) => ({
        ...current,
        title: "",
        prompt: "",
        sources: "",
      }));
      await refreshJobs();
    } finally {
      setLoading(false);
    }
  }

  async function changeJob(jobId, action) {
    setLoading(true);

    try {
      await request(`/api/publish-jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      await refreshJobs();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">AI publishing</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Queue-assisted content drafting
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            This phase ships the publishing workflow, review states, and Sanity handoff contract.
            Real provider execution can replace the placeholder gateway later without rebuilding the UI.
          </p>
        </div>
        <Button variant="outline" onClick={() => startTransition(refreshJobs)} disabled={loading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh queue
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create draft job</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submitJob}>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Target site</label>
                <Select value={form.siteSlug} onValueChange={(value) => setForm((current) => ({ ...current, siteSlug: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.slug} value={site.slug}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Content type</label>
                <Select value={form.contentType} onValueChange={(value) => setForm((current) => ({ ...current, contentType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="servicePage">Service page</SelectItem>
                    <SelectItem value="locationPage">Location page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Working title</label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Austin solar incentives for Travis County"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Prompt / brief</label>
                <Textarea
                  rows={5}
                  value={form.prompt}
                  onChange={(event) => setForm((current) => ({ ...current, prompt: event.target.value }))}
                  placeholder="Describe the article angle, audience, and facts the draft must cover."
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Reference sources</label>
                <Textarea
                  rows={4}
                  value={form.sources}
                  onChange={(event) => setForm((current) => ({ ...current, sources: event.target.value }))}
                  placeholder={"One URL per line"}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Provider</label>
                  <Input
                    value={form.provider}
                    onChange={(event) => setForm((current) => ({ ...current, provider: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Model</label>
                  <Input
                    value={form.model}
                    onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
                  />
                </div>
              </div>

              <Button className="mt-2" disabled={loading || !form.prompt || !form.siteSlug} type="submit">
                {loading ? "Creating..." : "Create draft job"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
          </TabsList>
          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <CardTitle>Publish jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{job.title}</div>
                          <div className="text-xs text-muted-foreground">{job.contentType}</div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{job.siteSlug}</TableCell>
                        <TableCell>
                          <JobStatus status={job.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {job.reviewStatus.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => changeJob(job.id, "approve")}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => changeJob(job.id, "reject")}
                            >
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => changeJob(job.id, "publish")}>
                              Publish
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="states">
            <Card>
              <CardHeader>
                <CardTitle>Workflow states</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {[
                  ["queued", "Job was created and is waiting for provider execution."],
                  ["draft_ready", "Draft content exists and is ready for human review."],
                  ["approved", "Editorial review passed and the job is ready to publish."],
                  ["published", "The draft was handed off to the CMS layer."],
                ].map(([label, body]) => (
                  <div className="rounded-xl border border-border bg-muted/30 p-4" key={label}>
                    <div className="font-medium text-foreground">{label}</div>
                    <div className="mt-2 text-sm leading-6 text-muted-foreground">{body}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
