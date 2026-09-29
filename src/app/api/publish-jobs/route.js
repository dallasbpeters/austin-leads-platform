import { after, NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { safeAuth } from '@/lib/auth/session'
import {
  ensurePublishJobsTable,
  hasPublishDatabase,
  insertPublishJob,
  listPublishJobs,
  updatePublishJob,
} from '@/lib/platform/publish-db'
import { generatePublishDraft, hasPublishGenerator } from '@/lib/platform/publish-generate'
import { getPostHogWorkflowLogger, posthogLogProvider } from '@/lib/posthog-logs'

export const runtime = 'nodejs'
export const maxDuration = 60

const logPublishJobCreation = ({ outcome, severityText, draftGenerated }) => {
  const logger = getPostHogWorkflowLogger()
  if (!logger) {
    return
  }

  logger.emit({
    body: 'publish_job_creation_completed',
    severityText,
    attributes: {
      workflow: 'publish_job_creation',
      outcome,
      draft_generated: draftGenerated,
    },
  })

  after(async () => {
    await posthogLogProvider?.forceFlush()
  })
}

export async function GET() {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }
  if (!hasPublishDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    await ensurePublishJobsTable()
    return NextResponse.json({ jobs: await listPublishJobs() })
  } catch (error) {
    console.error('[publish] list failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/*
 * Creates the job, then drafts it immediately. Generation is inline rather than
 * queued because a draft takes a few seconds and there is no worker in this
 * app; the job row is written first either way, so a generation failure leaves
 * a recoverable job carrying its error rather than losing the request.
 */
export async function POST(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }
  if (!hasPublishDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const session = await safeAuth()

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.siteSlug) {
    return NextResponse.json({ error: 'A site is required' }, { status: 400 })
  }
  if (!(body.title || body.prompt)) {
    return NextResponse.json({ error: 'A title or prompt is required' }, { status: 400 })
  }

  try {
    await ensurePublishJobsTable()
    const job = await insertPublishJob({ ...body, status: 'generating' })

    if (!hasPublishGenerator()) {
      const updated = await updatePublishJob(job.id, {
        status: 'needs_setup',
        error: 'Draft generation is not configured. Set GROQ_API_KEY.',
      })
      logPublishJobCreation({
        outcome: 'generator_not_configured',
        severityText: 'WARN',
        draftGenerated: false,
      })
      return NextResponse.json({ job: updated }, { status: 201 })
    }

    const draft = await generatePublishDraft(job, session?.user?.id)
    const updated = draft.ok
      ? await updatePublishJob(job.id, {
          status: 'draft_ready',
          reviewStatus: 'in_review',
          output: draft.output,
          provider: draft.provider,
          model: draft.model,
        })
      : await updatePublishJob(job.id, {
          status: 'failed',
          error: draft.error || draft.reason,
        })

    logPublishJobCreation({
      outcome: draft.ok ? 'draft_ready' : 'draft_generation_failed',
      severityText: draft.ok ? 'INFO' : 'ERROR',
      draftGenerated: draft.ok,
    })
    return NextResponse.json({ job: updated }, { status: 201 })
  } catch (error) {
    logPublishJobCreation({ outcome: 'request_failed', severityText: 'ERROR', draftGenerated: false })
    console.error('[publish] create failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
