'use client'

import { NavArrowRight } from 'iconoir-react'
import { useId, useMemo, useState } from 'react'

import { getDevSectionAttributes } from '@/components/dev/dev-trace'
import { trackAnalyticsEvent } from '@/lib/analytics/client'
import { computeModel, defaultValues, formatOutput, resolveModel } from '@/lib/solar-fit/model'
import { cn } from '@/lib/utils'

/**
 * "See if solar is right for you": questions on the left, live results on the
 * right, and a contact step that sends the estimate. The questions, constants
 * and formulas come from Sanity (solarFitSection); the server reruns the same
 * model when the form is sent.
 */
export function SolarFitSection({ page, section, sectionId = 'solar-fit' }) {
  const model = useMemo(() => resolveModel(section), [section])
  const [edited, setEdited] = useState({})
  // Starting values fill in any question the visitor has not touched, so a
  // question added in Studio shows up (with its starting value) right away.
  const answers = useMemo(() => ({ ...defaultValues(model), ...edited }), [model, edited])
  const result = useMemo(() => computeModel(model, answers), [model, answers])
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const fieldId = useId()

  const shown = result.outputs.filter((output) => output.format !== 'hidden')
  const highlights = shown.filter((output) => output.highlight)
  const stats = shown.filter((output) => !output.highlight)
  const broken = result.outputs.filter((output) => output.error)
  const fitMessage =
    result.qualifies === null ? '' : result.qualifies ? model.qualifiedMessage : model.notQualifiedMessage

  const setAnswer = (key) => (event) => setEdited((current) => ({ ...current, [key]: event.target.value }))

  async function onSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setStatus({ state: 'sending', message: '' })

    try {
      const response = await fetch('/api/solar-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.get('fullName'),
          email: form.get('email'),
          phone: form.get('phone'),
          company: form.get('company'),
          consent: form.get('consent') === 'on',
          answers,
          pageId: page?._id || page?.id || '',
          sectionKey: section?._key || '',
          pagePath: typeof window === 'undefined' ? '' : window.location.pathname,
        }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.error || 'Something went wrong. Please call us instead.')
      }
      trackAnalyticsEvent('solar_fit_submitted', {
        qualifies: String(body.qualifies),
        page_path: window.location.pathname,
      })
      setStatus({
        state: 'sent',
        message:
          section?.successMessage ||
          'Thanks. We sent a copy of your estimate to your email and will reach out within one business day.',
      })
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' })
    }
  }

  return (
    <section
      className="solar-calculator solar-fit"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/solar-fit-section.jsx',
        content: 'Sanity solarFitSection: questions, constants and formulas',
      })}
    >
      <div className="solar-calculator__shell">
        <div className="solar-calculator__intro">
          {section?.eyebrow ? <p className="solar-fit__eyebrow">{section.eyebrow}</p> : null}
          <h2 className="solar-calculator__title">{section?.title || 'See if solar is right for you'}</h2>
          <p className="solar-calculator__lede">
            {section?.body ||
              'Answer a few questions to see a rough system size, savings and monthly payment. Then send it to us for a free, no-pressure review.'}
          </p>
        </div>

        <div className="solar-calculator__frame grid-frame">
          <div className="solar-calculator__inputs">
            {model.inputs.map((input) => (
              <div key={input.key} className="solar-calculator__field">
                <label htmlFor={`${fieldId}-${input.key}`} className="solar-calculator__label">
                  {input.label}
                </label>
                {input.kind === 'select' || input.kind === 'yesno' ? (
                  <select
                    id={`${fieldId}-${input.key}`}
                    className="solar-calculator__input"
                    value={answers[input.key]}
                    onChange={setAnswer(input.key)}
                  >
                    {input.options.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="solar-fit__number">
                    {input.prefix ? (
                      <span className="solar-fit__affix" aria-hidden="true">
                        {input.prefix}
                      </span>
                    ) : null}
                    <input
                      id={`${fieldId}-${input.key}`}
                      type="number"
                      inputMode="decimal"
                      className="solar-fit__number-input"
                      value={answers[input.key]}
                      min={input.min}
                      max={input.max}
                      step={input.step || 'any'}
                      onChange={setAnswer(input.key)}
                    />
                    {input.suffix ? (
                      <span className="solar-fit__affix" aria-hidden="true">
                        {input.suffix}
                      </span>
                    ) : null}
                  </div>
                )}
                {input.help ? <p className="solar-fit__help">{input.help}</p> : null}
              </div>
            ))}
          </div>

          <div className="solar-calculator__outputs">
            {highlights.length ? (
              <div className="solar-calculator__system">
                {highlights.map((output) => (
                  <div key={output.key} className="solar-fit__highlight">
                    <p className="solar-calculator__eyebrow">{output.label}</p>
                    <p className="solar-calculator__system-value">{formatOutput(output)}</p>
                    {output.detail ? (
                      <p className="solar-calculator__system-detail">{output.detail}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            {stats.length ? (
              <dl className="solar-calculator__stats" aria-live="polite">
                {stats.map((output) => (
                  <div key={output.key} className="solar-calculator__stat">
                    <dt className="solar-calculator__eyebrow">{output.label}</dt>
                    <dd className="solar-calculator__stat-value">{formatOutput(output)}</dd>
                    {output.detail ? (
                      <dd className="solar-calculator__stat-detail">{output.detail}</dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            ) : null}

            {fitMessage ? (
              <p
                className={cn('solar-fit__verdict', result.qualifies && 'solar-fit__verdict--yes')}
                aria-live="polite"
              >
                {fitMessage}
              </p>
            ) : null}

            {broken.length ? (
              <p className="solar-fit__error" role="alert">
                {broken.map((output) => `${output.label}: ${output.error}`).join(' · ')}
              </p>
            ) : null}
          </div>

          <div className="solar-fit__contact solar-fit__contact--wide">
            {status.state === 'sent' ? (
              <p className="solar-fit__sent" role="status">
                {status.message}
              </p>
            ) : (
              <form className="solar-fit__form" onSubmit={onSubmit}>
                <p className="solar-fit__form-title">Get your full estimate, free and no pressure.</p>
                <div className="solar-fit__form-grid">
                  <label className="solar-fit__form-field">
                    <span>Name</span>
                    <input name="fullName" autoComplete="name" required />
                  </label>
                  <label className="solar-fit__form-field">
                    <span>Email</span>
                    <input name="email" type="email" autoComplete="email" required />
                  </label>
                  <label className="solar-fit__form-field">
                    <span>Phone</span>
                    <input name="phone" type="tel" autoComplete="tel" />
                  </label>
                </div>
                {/* Hidden from people; bots fill it and get dropped. */}
                <input
                  className="solar-fit__trap"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <label className="solar-fit__consent">
                  <input name="consent" type="checkbox" required />
                  <span>It is OK to email or call me about my estimate. No spam, no commitment.</span>
                </label>
                <div className="solar-fit__actions">
                  <button
                    type="submit"
                    className="solar-calculator__cta-button"
                    disabled={status.state === 'sending'}
                  >
                    {status.state === 'sending' ? 'Sending…' : section?.submitLabel || 'See if you qualify'}
                    <NavArrowRight className="solar-calculator__cta-icon" aria-hidden="true" />
                  </button>
                  {status.state === 'error' ? (
                    <p className="solar-fit__error" role="alert">
                      {status.message}
                    </p>
                  ) : null}
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="solar-calculator__disclaimer">
          Estimates only. Real numbers vary by roof, usage, utility and financing. We confirm everything with
          a free visit.
        </p>
      </div>
    </section>
  )
}

export default SolarFitSection
