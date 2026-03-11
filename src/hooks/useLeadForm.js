'use client'

import { useMemo, useState } from 'react'

import { submitLead } from '@/services/leads'

function defaultState() {
  return {
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  }
}

export function useLeadForm({ context }) {
  const [form, setForm] = useState(defaultState)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const disabled = useMemo(() => status === 'submitting', [status])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')

    try {
      await submitLead({
        ...context,
        ...form,
      })

      setForm(defaultState())
      setStatus('success')
      setMessage('We have received your request and will be in touch within the next 24 hours.')
    } catch (error) {
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
