'use client'

import { useEffect, useRef } from 'react'
import { LoaderCircle } from 'lucide-react'
import { sendGAEvent } from '@next/third-parties/google'

import Button from '@/components/Button'
import { useLeadForm } from '@/hooks/useLeadForm'
import { LEAD_SERVICE_OPTIONS } from '@/lib/leads/service-options'
import { toRuntimeToken } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

export default function LeadCaptureForm({
  context,
  buttonLabel = 'Request a Consultation',
  checkboxLabel = 'I agree to be contacted about my inquiry. We do not sell your information.',
  compact = false,
  className,
  inputClassName,
  labelClassName,
  checkboxClassName,
  messageClassName,
}) {
  const { disabled, form, message, setForm, status, handleSubmit } = useLeadForm({ context })
  const fieldPrefix = toRuntimeToken(context?.sourceSection || 'lead') || 'lead'
  const privacyFieldId = `${fieldPrefix}-privacy`
  const serviceInterestFieldId = `${fieldPrefix}-service-interest`
  const formRef = useRef(null)
  const hasTrackedViewRef = useRef(false)

  useEffect(() => {
    const element = formRef.current
    if (!element || hasTrackedViewRef.current) {
      return
    }

    const trackView = () => {
      if (hasTrackedViewRef.current) {
        return
      }

      hasTrackedViewRef.current = true

      try {
        sendGAEvent('event', 'lead_form_view', {
          form_id: 'lead_capture_form',
          lead_type: context?.sourceType || 'consultation',
          source_section: context?.sourceSection || 'unknown',
          site_slug: context?.siteSlug || 'unknown',
          page_path:
            context?.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/unknown'),
          service_interest: form.serviceInterest || 'unknown',
        })
      } catch {
        // Do not block UX if analytics is unavailable.
      }
    }

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      trackView()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackView()
          observer.disconnect()
        }
      },
      {
        threshold: 0.35,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [context, form.serviceInterest])

  const updateField = (field) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <form ref={formRef} className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit}>
      <div>
        <label className={cn('mb-2 block text-sm font-semibold', labelClassName)}>Full Name</label>
        <input
          type="text"
          placeholder="e.g. Jane Doe"
          className={cn(
            'w-full border-0 border-b bg-transparent px-0 py-2 text-sm outline-none',
            inputClassName,
          )}
          value={form.fullName}
          onChange={updateField('fullName')}
          disabled={disabled}
          required
        />
      </div>

      <div className={cn('grid gap-6 md:grid-cols-2', compact && 'grid-cols-1')}>
        <div>
          <label className={cn('mb-2 block text-sm font-semibold', labelClassName)}>Email Address</label>
          <input
            type="email"
            placeholder="jane@example.com"
            className={cn(
              'w-full border-0 border-b bg-transparent px-0 py-2 text-sm outline-none',
              inputClassName,
            )}
            value={form.email}
            onChange={updateField('email')}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label className={cn('mb-2 block text-sm font-semibold', labelClassName)}>Phone Number</label>
          <input
            type="tel"
            placeholder="(512) 000-0000"
            className={cn(
              'w-full border-0 border-b bg-transparent px-0 py-2 text-sm outline-none',
              inputClassName,
            )}
            value={form.phone}
            onChange={updateField('phone')}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <label htmlFor={serviceInterestFieldId} className={cn('mb-2 block text-sm font-semibold', labelClassName)}>
          Service interested in
        </label>
        <select
          id={serviceInterestFieldId}
          className={cn(
            'w-full border-0 border-b bg-transparent px-0 py-2 text-sm outline-none',
            inputClassName,
          )}
          value={form.serviceInterest}
          onChange={updateField('serviceInterest')}
          disabled={disabled}
          required
        >
          {LEAD_SERVICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id={privacyFieldId}
          className={cn('mt-1 h-4 w-4', checkboxClassName)}
          defaultChecked
          disabled={disabled}
        />
        <label
          htmlFor={privacyFieldId}
          className={cn('text-sm font-semibold', labelClassName)}
        >
          {checkboxLabel}
        </label>
      </div>

      {message ? (
        <div
          className={cn(
            "absolute px-4 py-3 text-sm border rounded-sm -top-20",
            status === 'success'
              ? "text-emerald-50 bg-emerald-500 border-emerald-200"
              : "text-rose-900 bg-rose-50 border-rose-200",
            messageClassName,
          )}
        >
          {message}
        </div>
      ) : null}

      <Button pill type="submit" size="lg" fullWidth disabled={disabled}>
        {disabled ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> : null}
        {buttonLabel}
      </Button>
    </form>
  )
}
