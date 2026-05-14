'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

import {
  buildDefaultPublishForm,
  createPublishJob,
  fetchPublishJobs,
  updatePublishJob,
} from '@/services/admin/publish'

export function usePublishManager({ initialJobs, sites }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(buildDefaultPublishForm(sites))

  useEffect(() => {
    setJobs(initialJobs)
  }, [initialJobs])

  async function refreshJobs() {
    setLoading(true)

    try {
      const data = await fetchPublishJobs()
      setJobs(data.jobs)
    } finally {
      setLoading(false)
    }
  }

  async function submitJob(event) {
    event.preventDefault()
    setLoading(true)

    try {
      await createPublishJob(form)
      posthog.capture('admin_publish_job_created', {
        site_slug: form.siteSlug,
        job_title: form.title,
      })
      setForm((current) => ({
        ...current,
        title: '',
        prompt: '',
        sources: '',
      }))
      await refreshJobs()
    } finally {
      setLoading(false)
    }
  }

  async function changeJob(jobId, action) {
    setLoading(true)

    try {
      await updatePublishJob(jobId, action)
      await refreshJobs()
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    jobs,
    loading,
    changeJob,
    refreshJobs,
    setForm,
    submitJob,
  }
}
