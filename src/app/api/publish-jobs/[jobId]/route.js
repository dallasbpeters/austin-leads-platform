import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { publishPageToSanity } from '@/lib/platform/content'
import {
  ensurePublishJobsTable,
  getPublishJob,
  hasPublishDatabase,
  updatePublishJob,
} from '@/lib/platform/publish-db'
import { generatePublishDraft } from '@/lib/platform/publish-generate'

export const runtime = 'nodejs'
export const maxDuration = 60

const ACTIONS = new Set(['regenerate', 'approve', 'reject', 'publish'])

export async function GET(_request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  const { jobId } = await params
  await ensurePublishJobsTable()
  const job = await getPublishJob(jobId)

  return job ? NextResponse.json({ job }) : NextResponse.json({ error: 'Job not found.' }, { status: 404 })
}

async function handleRegenerate(job) {
  const draft = await generatePublishDraft(job)
  if (!draft.ok) {
    return updatePublishJob(job.id, { status: 'failed', error: draft.error || draft.reason })
  }

  return updatePublishJob(job.id, {
    status: 'draft_ready',
    reviewStatus: 'in_review',
    output: draft.output,
    provider: draft.provider,
    model: draft.model,
    error: null,
  })
}

/*
 * The Sanity write is the one genuinely external step, and it reports its own
 * outcome rather than throwing. The job is only marked published when that
 * write actually landed -- it previously flipped to 'published' regardless, so
 * a missing write token produced jobs that claimed success while nothing had
 * been created.
 */
async function handlePublish(job) {
  if (!job.output) {
    return updatePublishJob(job.id, {
      status: 'failed',
      error: 'Nothing to publish — generate a draft first.',
    })
  }

  const publishResult = await publishPageToSanity(job)
  if (publishResult?.ok === false) {
    return updatePublishJob(job.id, {
      status: 'failed',
      publishResult,
      error: publishResult.message || 'Publishing to Sanity failed.',
    })
  }

  return updatePublishJob(job.id, {
    status: 'published',
    reviewStatus: 'published',
    publishResult,
    error: null,
  })
}

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }
  if (!hasPublishDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const { jobId } = await params

  let body = {}
  try {
    body = await request.json()
  } catch {
    // An empty body means "regenerate", matching the previous default.
  }

  const action = body.action || 'regenerate'
  if (!ACTIONS.has(action)) {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }

  try {
    await ensurePublishJobsTable()
    const job = await getPublishJob(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
    }

    if (action === 'approve') {
      const updated = await updatePublishJob(jobId, { status: 'approved', reviewStatus: 'approved' })
      return NextResponse.json({ job: updated })
    }

    if (action === 'reject') {
      const updated = await updatePublishJob(jobId, {
        status: 'rejected',
        reviewStatus: 'changes_requested',
      })
      return NextResponse.json({ job: updated })
    }

    const updated = action === 'publish' ? await handlePublish(job) : await handleRegenerate(job)
    return NextResponse.json({ job: updated, publishResult: updated.publishResult ?? null })
  } catch (error) {
    console.error('[publish] update failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
