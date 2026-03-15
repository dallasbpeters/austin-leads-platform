'use client'

import { LoaderCircle } from 'lucide-react'

import Button from '@/components/Button'
import { useLeadForm } from '@/hooks/useLeadForm'
import { LEAD_SERVICE_OPTIONS } from '@/lib/leads/service-options'
import { toRuntimeToken } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

export default function LeadCaptureForm({
  context,
  buttonLabel = 'Request a Consultation',
  compact = false,
  checkboxLabel = 'I agree to be contacted about my inquiry. We do not sell your information.',
  className,
  inputClassName,
  labelClassName,
  checkboxClassName,
  messageClassName,
}) {
  const { disabled, form, message, setForm, status, handleSubmit } = useLeadForm({ context })
  const privacyFieldId = `${toRuntimeToken(context.sourceSection || 'lead') || 'lead'}-privacy`

  const updateField = (field) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <form className={cn("flex flex-col relative gap-6", className)} onSubmit={handleSubmit}>
      <div>
        <label className={cn("block mb-2 font-semibold text-sm", labelClassName)}>Full Name</label>
        <input
          type="text"
          placeholder="e.g. Jane Doe"
          className={cn(
            "w-full px-0 py-2 text-sm bg-transparent border-0 border-b outline-none",
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
          <label className={cn("block mb-2 font-semibold text-sm", labelClassName)}>Email Address</label>
          <input
            type="email"
            placeholder="jane@example.com"
            className={cn(
              "w-full px-0 py-2 text-sm bg-transparent border-0 border-b outline-none",
              inputClassName,
            )}
            value={form.email}
            onChange={updateField('email')}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label className={cn("block mb-2 font-semibold text-sm", labelClassName)}>Phone Number</label>
          <input
            type="tel"
            placeholder="(512) 000-0000"
            className={cn(
              "w-full px-0 py-2 text-sm bg-transparent border-0 border-b outline-none",
              inputClassName,
            )}
            value={form.phone}
            onChange={updateField('phone')}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <label htmlFor="service-interest" className={cn("block mb-2 font-semibold text-sm", labelClassName)}>
          Service interested in
        </label>
        <select
          id="service-interest"
          className={cn(
            "w-full px-0 py-2 text-sm bg-transparent border-0 border-b outline-none",
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
          className={cn("h-4 w-4 mt-1", checkboxClassName)}
          defaultChecked
          disabled={disabled}
        />
        <label htmlFor={privacyFieldId} className={cn("font-semibold text-sm", labelClassName)}>
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
