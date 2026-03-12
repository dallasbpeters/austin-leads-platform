'use client'

import { LoaderCircle } from 'lucide-react'

import Button from '@/components/Button'
import { useLeadForm } from '@/hooks/useLeadForm'
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
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit}>
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

      <Button pill type="submit" size="lg" fullWidth disabled={disabled}>
        {disabled ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
        {buttonLabel}
      </Button>
    </form>
  )
}
