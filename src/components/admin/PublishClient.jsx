'use client'

import Link from 'next/link'
import { startTransition } from 'react'
import { CheckCircle2, Clock3, LoaderCircle, RefreshCcw, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { usePublishManager } from '@/hooks/usePublishManager'
import { publishStatusTone } from '@/services/admin/publish'

const statusIcon = {
  queued: Clock3,
  draft_ready: CheckCircle2,
  approved: CheckCircle2,
  rejected: XCircle,
  published: CheckCircle2,
}

function JobStatus({ status }) {
  const Icon = statusIcon[status] || LoaderCircle

  return (
    <Badge variant={publishStatusTone[status] || 'outline'} className="items-center gap-1.5 inline-flex">
      <Icon className="h-3.5 w-3.5" />
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

export default function PublishClient({ initialJobs, sites }) {
  const { form, jobs, loading, changeJob, refreshJobs, setForm, submitJob } = usePublishManager({
    initialJobs,
    sites,
  })

  return (
    <div className="p-6 space-y-8 lg:p-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">AI publishing</p>
          <h1 className="mt-2 text-3xl text-foreground tracking-tight">Queue-assisted content drafting</h1>
          <p className="max-w-3xl mt-3 leading-7 text-base text-muted-foreground">
            This phase ships the publishing workflow, review states, and Sanity handoff contract. Real
            provider execution can replace the placeholder gateway later without rebuilding the UI.
          </p>
        </div>
        <Button variant="outline" onClick={() => startTransition(refreshJobs)} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh queue
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Preferred workflow: draft in Sanity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-5 space-y-3 leading-7 text-muted-foreground text-sm">
              <p>
                The current recommendation is to use the hosted Sanity Studio for AI-assisted drafting and
                final editing. The Studio tool creates a real draft document first, then lets Sanity Agent
                build the first pass inside the actual CMS.
              </p>
              <p>
                Use this admin page only as a legacy queue prototype. It is not the primary editorial path.
              </p>
              <Button asChild variant="outline">
                <Link href="/studio">Open Studio</Link>
              </Button>
            </div>
            <form className="grid gap-4" onSubmit={submitJob}>
              <div className="grid gap-2">
                <label className="font-medium text-foreground text-sm">Target site</label>
                <Select
                  value={form.siteSlug}
                  onValueChange={(value) => setForm((current) => ({ ...current, siteSlug: value }))}
                >
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
                <label className="font-medium text-foreground text-sm">Content type</label>
                <Select
                  value={form.contentType}
                  onValueChange={(value) => setForm((current) => ({ ...current, contentType: value }))}
                >
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
                <label className="font-medium text-foreground text-sm">Working title</label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Austin solar incentives for Travis County"
                />
              </div>

              <div className="grid gap-2">
                <label className="font-medium text-foreground text-sm">Prompt / brief</label>
                <Textarea
                  rows={5}
                  value={form.prompt}
                  onChange={(event) => setForm((current) => ({ ...current, prompt: event.target.value }))}
                  placeholder="Describe the article angle, audience, and facts the draft must cover."
                />
              </div>

              <div className="grid gap-2">
                <label className="font-medium text-foreground text-sm">Reference sources</label>
                <Textarea
                  rows={4}
                  value={form.sources}
                  onChange={(event) => setForm((current) => ({ ...current, sources: event.target.value }))}
                  placeholder={'One URL per line'}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="font-medium text-foreground text-sm">Provider</label>
                  <Input
                    value={form.provider}
                    onChange={(event) => setForm((current) => ({ ...current, provider: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="font-medium text-foreground text-sm">Model</label>
                  <Input
                    value={form.model}
                    onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
                  />
                </div>
              </div>

              <Button className="mt-2" disabled={loading || !form.prompt || !form.siteSlug} type="submit">
                {loading ? 'Creating...' : 'Create draft job'}
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
                          <div className="text-muted-foreground text-sm">{job.contentType}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{job.siteSlug}</TableCell>
                        <TableCell>
                          <JobStatus status={job.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {job.reviewStatus.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => changeJob(job.id, 'approve')}>
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => changeJob(job.id, 'reject')}>
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => changeJob(job.id, 'publish')}>
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
                  ['queued', 'Job was created and is waiting for provider execution.'],
                  ['draft_ready', 'Draft content exists and is ready for human review.'],
                  ['approved', 'Editorial review passed and the job is ready to publish.'],
                  ['published', 'The draft was handed off to the CMS layer.'],
                ].map(([label, body]) => (
                  <div className="p-4 bg-muted/30 border border-border rounded-xl" key={label}>
                    <div className="font-medium text-foreground">{label}</div>
                    <div className="mt-2 leading-6 text-muted-foreground text-sm">{body}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
