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
      <div className="inline-block text-md leading-8">
        <label className={cn("inline mr-2 font-semibold ", labelClassName)}>My Name is</label>
        <input
          type="text"
          placeholder="first name last name"
          className={cn(
            " w-80 text-inherit inline px-0 py-2 bg-transparent border-0 border-b outline-none",
            inputClassName,
          )}
          value={form.fullName}
          onChange={updateField('fullName')}
          disabled={disabled}
          required
        /><br/>
        <label htmlFor="service-interest" className={cn("inline mr-2 font-semibold", labelClassName)}>
          and I am interested in
        </label>
        <select
          id="service-interest"
          className={cn(
            "text-inherit inline mr-4 px-0 py-2 bg-transparent border-0 border-b outline-none",
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
        <br/>
          <label className={cn("inline mr-2 font-semibold", labelClassName)}>Please contact me at:</label>
          <input
            type="email"
            placeholder="email address"
            className={cn(
              "w-60 text-inherit inline px-0 py-2 bg-transparent border-0 border-b outline-none",
              inputClassName,
            )}
            value={form.email}
            onChange={updateField('email')}
            disabled={disabled}
            required
          />
           <br/>
          <label className={cn("inline mr-2 font-semibold", labelClassName)}>or my phone number:</label>
          <input
            type="tel"
            placeholder="phone number"
            className={cn(
              "w-60 text-inherit inline px-0 py-2 bg-transparent border-0 border-b outline-none",
              inputClassName,
            )}
            value={form.phone}
            onChange={updateField('phone')}
            disabled={disabled}
          />

        
      </div>

      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id={privacyFieldId}
          className={cn("h-4 w-4 mt-0.5", checkboxClassName)}
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
