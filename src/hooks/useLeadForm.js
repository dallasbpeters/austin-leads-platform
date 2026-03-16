'use client'

import { useMemo, useState } from 'react'

import { submitLead } from '@/services/leads'
import { trackAnalyticsEvent } from '@/lib/analytics/client'
import { normalizeLeadServiceInterest } from '@/lib/leads/service-options'

function defaultState(defaultServiceInterest) {
  return {
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    serviceInterest: normalizeLeadServiceInterest(defaultServiceInterest),
  }
}

export function useLeadForm({ context }) {
  const [form, setForm] = useState(() => defaultState(context?.serviceInterest))
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const disabled = useMemo(() => status === 'submitting', [status])

  function buildAnalyticsParams(nextForm) {
    return {
      form_id: 'lead_capture_form',
      lead_type: context?.sourceType || 'consultation',
      source_section: context?.sourceSection || 'unknown',
      site_slug: context?.siteSlug || 'unknown',
      page_path:
        context?.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/unknown'),
      service_interest: nextForm?.serviceInterest || 'unknown',
    }
  }

  function trackLeadEvent(eventName, params) {
    trackAnalyticsEvent(eventName, params)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')

    try {
      await submitLead({
        ...context,
        ...form,
      })

      trackLeadEvent('generate_lead', {
        ...buildAnalyticsParams(form),
        submit_status: 'success',
      })

      setForm(defaultState(context?.serviceInterest))
      setStatus('success')
      setMessage('We have received your request and will be in touch within the next 24 hours.')
    } catch (error) {
      trackLeadEvent('lead_submit_error', {
        ...buildAnalyticsParams(form),
        submit_status: 'error',
      })

      setStatus('error')
      setMessage(error.message || 'Unable to submit your request.')
    }
  }

  return {
    disabled,
    form,
    message,
    setForm,
    status,
    handleSubmit,
  }
}
