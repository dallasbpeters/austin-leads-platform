'use client'

import { CheckCircle2, ExternalLink, LoaderCircle, Upload, Youtube } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TONE = {
  draft: 'secondary',
  review: 'secondary',
  changes: 'destructive',
  approved: 'default',
  published: 'default',
}

const LABEL = {
  draft: 'Draft',
  review: 'In review',
  changes: 'Changes requested',
  approved: 'Approved',
  published: 'Published',
}

/*
 * Watch the film, approve it, push it to YouTube.
 *
 * Everything here talks to API routes rather than doing work in the browser, so
 * the page behaves identically on a laptop and on Vercel — the upload streams
 * server-side from `renderUrl`, and the browser never touches the file.
 *
 * Copy is NOT editable here on purpose: the script lives in Sanity Studio, and a
 * second editing surface would drift from it within a week.
 */
export default function VideosClient({ initialProjects, youtubeConnected, channelEmail }) {
  const [projects, setProjects] = useState(initialProjects || [])
  const [busy, setBusy] = useState(null)
  const [problem, setProblem] = useState(null)

  async function refresh() {
    const res = await fetch('/api/videos')
    if (res.ok) {
      const data = await res.json()
      setProjects(data.projects || [])
    }
  }

  async function setStatus(id, status) {
    setBusy(`${id}:status`)
    setProblem(null)
    try {
      const res = await fetch('/api/videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed (${res.status})`)
      }
      await refresh()
    } catch (error) {
      setProblem(error.message)
    } finally {
      setBusy(null)
    }
  }

  async function uploadToYoutube(project) {
    setBusy(`${project._id}:upload`)
    setProblem(null)
    try {
      const res = await fetch('/api/youtube/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: project.slug }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `Upload failed (${res.status})`)
      }
      await refresh()
    } catch (error) {
      setProblem(error.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Videos</h1>
          <p className="text-muted-foreground text-sm">Watch the cut, approve it, and push it to YouTube.</p>
        </div>

        {youtubeConnected ? (
          <Badge variant="default" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            YouTube connected{channelEmail ? ` · ${channelEmail}` : ''}
          </Badge>
        ) : (
          <Button asChild variant="outline">
            <a href="/api/youtube/auth">
              <Youtube className="mr-2 h-4 w-4" />
              Connect YouTube
            </a>
          </Button>
        )}
      </header>

      {problem && (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
          {problem}
        </div>
      )}

      {projects.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground p-6 text-sm">
            No video projects yet. Create one in Studio, or run{' '}
            <code className="text-foreground">npm run video:seed</code>.
          </CardContent>
        </Card>
      )}

      {projects.map((project) => {
        const uploading = busy === `${project._id}:upload`
        const savingStatus = busy === `${project._id}:status`
        const canUpload = project.status === 'approved' && Boolean(project.renderUrl)

        return (
          <Card key={project._id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="min-w-0">
                <CardTitle className="truncate">{project.title}</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">{project.message}</p>
              </div>
              <Badge variant={TONE[project.status] || 'secondary'}>
                {LABEL[project.status] || project.status}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              {project.renderUrl ? (
                /* No caption track exists for these renders yet; the narration
                   script lives in Sanity if one is ever needed. */
                <video
                  controls
                  preload="metadata"
                  src={project.renderUrl}
                  className="border-border w-full rounded-lg border bg-black"
                />
              ) : (
                <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
                  No render to play yet. Render the film, then publish it to a URL:
                  <pre className="text-foreground mt-2 text-xs">
                    cd videos/{project.slug} &amp;&amp; npx hyperframes render{'\n'}
                    npm run video:render:push {project.slug}
                  </pre>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {project.status !== 'approved' && project.status !== 'published' && (
                  <Button
                    variant="outline"
                    disabled={savingStatus}
                    onClick={() => setStatus(project._id, 'approved')}
                  >
                    {savingStatus ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Approve
                  </Button>
                )}

                {project.youtube?.url ? (
                  <Button asChild variant="outline">
                    <a href={project.youtube.url} target="_blank" rel="noreferrer">
                      <Youtube className="mr-2 h-4 w-4" />
                      On YouTube
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    disabled={!canUpload || !youtubeConnected || uploading}
                    onClick={() => uploadToYoutube(project)}
                  >
                    {uploading ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {uploading ? 'Uploading…' : 'Upload to YouTube'}
                  </Button>
                )}

                {project.reviewUrl && (
                  <Button asChild variant="ghost">
                    <a href={project.reviewUrl} target="_blank" rel="noreferrer">
                      Open review link
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Say exactly which precondition is missing, rather than leaving a dead button. */}
              {!project.youtube?.url && !canUpload && (
                <p className="text-muted-foreground text-xs">
                  {project.status !== 'approved'
                    ? 'Approve it before uploading.'
                    : 'Needs a hosted render URL before it can upload.'}
                  {youtubeConnected ? '' : ' YouTube is not connected yet.'}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
