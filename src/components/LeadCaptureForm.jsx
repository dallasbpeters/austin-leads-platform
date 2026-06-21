'use client'

import { LoaderCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { useLeadForm } from '@/hooks/useLeadForm'
import { trackAnalyticsEvent } from '@/lib/analytics/client'
import { LEAD_SERVICE_OPTIONS } from '@/lib/leads/service-options'
import { toRuntimeToken } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

export default function LeadCaptureForm({
  context,
  buttonLabel = 'Request a Consultation',
  checkboxLabel = 'I agree to be contacted about my inquiry. We do not sell your information.',
  serviceOptions = LEAD_SERVICE_OPTIONS,
  compact = false,
  className,
  inputClassName,
  labelClassName,
  checkboxClassName,
  messageClassName,
}) {
  const { disabled, form, message, setForm, status, handleSubmit } = useLeadForm({ context })
  const fieldPrefix = toRuntimeToken(context?.sourceSection || 'lead') || 'lead'
  const fullNameFieldId = `${fieldPrefix}-full-name`
  const emailFieldId = `${fieldPrefix}-email`
  const phoneFieldId = `${fieldPrefix}-phone`
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

      trackAnalyticsEvent('lead_form_view', {
        form_id: 'lead_capture_form',
        lead_type: context?.sourceType || 'consultation',
        source_section: context?.sourceSection || 'unknown',
        site_slug: context?.siteSlug || 'unknown',
        page_path:
          context?.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/unknown'),
        service_interest: form.serviceInterest || 'unknown',
      })
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
  const updateCheckedField = (field) => (event) => {
    const checked = event.target.checked
    setForm((current) => ({ ...current, [field]: checked }))
  }

  return (
    <form ref={formRef} className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit}>
      <div>
        <label htmlFor={fullNameFieldId} className={cn('mb-2 block text-sm font-semibold', labelClassName)}>
          Full Name
        </label>
        <input
          id={fullNameFieldId}
          type="text"
          autoComplete="name"
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
          <label htmlFor={emailFieldId} className={cn('mb-2 block text-sm font-semibold', labelClassName)}>
            Email Address
          </label>
          <input
            id={emailFieldId}
            type="email"
            autoComplete="email"
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
          <label htmlFor={phoneFieldId} className={cn('mb-2 block text-sm font-semibold', labelClassName)}>
            Phone Number
          </label>
          <input
            id={phoneFieldId}
            type="tel"
            autoComplete="tel"
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
        <label
          htmlFor={serviceInterestFieldId}
          className={cn('mb-2 block text-sm font-semibold', labelClassName)}
        >
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
          {serviceOptions.map((option) => (
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
          checked={Boolean(form.privacyAccepted)}
          onChange={updateCheckedField('privacyAccepted')}
          disabled={disabled}
          required
        />
        <label htmlFor={privacyFieldId} className={cn('text-sm font-semibold', labelClassName)}>
          {checkboxLabel}
        </label>
      </div>

      {message ? (
        <div
          className={cn(
            'rounded-sm border px-4 py-3 text-sm',
            status === 'success'
              ? 'border-emerald-200 bg-emerald-500 text-emerald-50'
              : 'border-rose-200 bg-rose-50 text-rose-900',
            messageClassName,
          )}
        >
          {message}
        </div>
      ) : null}

      <Button shape="pill" type="submit" size="lg" className="w-full" disabled={disabled}>
        {disabled ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
        {buttonLabel}
      </Button>
    </form>
  )
}
