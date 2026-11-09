'use client'

import { useId } from 'react'

import { useLeadForm } from '@/hooks/useLeadForm'

/*
 * The roofer introduction form (Studio: Call to Action Section → Form →
 * Introduction). Name and email only; the lead route stores it and emails it to
 * info@texassolarandroofing.com (leads/email.js picks the inbox by lead type).
 */
export default function IntroductionRequestForm({ buttonLabel, context }) {
  const fieldId = useId()
  const { disabled, form, message, setForm, status, handleSubmit } = useLeadForm({ context })

  if (status === 'success') {
    return (
      <p className="intro-form__done" role="status">
        Thanks. We got your request and will email you an introduction within one business day.
      </p>
    )
  }

  const setField = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }))

  return (
    <form className="intro-form" onSubmit={handleSubmit}>
      <div className="intro-form__field">
        <label htmlFor={`${fieldId}-name`} className="intro-form__label">
          Name
        </label>
        <input
          id={`${fieldId}-name`}
          className="intro-form__input"
          type="text"
          autoComplete="name"
          required
          value={form.fullName}
          onChange={setField('fullName')}
        />
      </div>
      <div className="intro-form__field">
        <label htmlFor={`${fieldId}-email`} className="intro-form__label">
          Email
        </label>
        <input
          id={`${fieldId}-email`}
          className="intro-form__input"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={setField('email')}
        />
      </div>
      <button type="submit" className="consult__button intro-form__submit" disabled={disabled}>
        {disabled ? 'Sending…' : buttonLabel}
      </button>
      {status === 'error' ? (
        <p className="intro-form__error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  )
}
