import { requestJson } from '@/services/admin/hero-pages'

export const publishStatusTone = {
  queued: 'secondary',
  draft_ready: 'default',
  approved: 'default',
  rejected: 'destructive',
  published: 'default',
}

export async function fetchPublishJobs() {
  return requestJson('/api/publish-jobs')
}

export async function createPublishJob(form) {
  return requestJson('/api/publish-jobs', {
    method: 'POST',
    body: JSON.stringify({
      ...form,
      sources: form.sources
        .split('\n')
        .map((source) => source.trim())
        .filter(Boolean),
    }),
  })
}

export async function updatePublishJob(jobId, action) {
  return requestJson(`/api/publish-jobs/${jobId}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  })
}

export function buildDefaultPublishForm(sites) {
  return {
    siteSlug: sites[0]?.slug || '',
    contentType: 'post',
    title: '',
    prompt: '',
    provider: 'placeholder-openai',
    model: 'gpt-4.1',
    sources: '',
  }
}
