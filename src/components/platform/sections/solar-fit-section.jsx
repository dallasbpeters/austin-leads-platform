'use client'

import { NavArrowLeft, NavArrowRight } from 'iconoir-react'
import { useId, useMemo, useRef, useState } from 'react'

import { getDevSectionAttributes } from '@/components/dev/dev-trace'
import { trackAnalyticsEvent } from '@/lib/analytics/client'
import {
  computeWithRoof,
  defaultValues,
  formatOutput,
  inputsUsedBy,
  isAsked,
  PANELS_WANTED_KEY,
  resolveModel,
} from '@/lib/solar-fit/model'
import { cn } from '@/lib/utils'

import { AddressSearch, findAddress, RoofMap } from './solar-fit-roof'

/**
 * "See if solar is right for you", as a one-question-at-a-time stepper (think
 * Typeform). The roof map sits beside the question and the estimate under them,
 * each number showing once the questions it reads are answered; the last step
 * adds the contact form. The questions, constants and formulas come from Sanity
 * (solarFitSection); the server reruns the same model when the form is sent.
 */
export function SolarFitSection({ page, section, sectionId = 'solar-fit' }) {
  const model = useMemo(() => resolveModel(section), [section])
  const [edited, setEdited] = useState({})
  // Starting values fill in any question the visitor has not touched, so a
  // question added in Studio shows up (with its starting value) right away.
  const answers = useMemo(() => ({ ...defaultValues(model), ...edited }), [model, edited])
  // The roof step: { placeId, address, roof, photo } once an address is picked.
  const [roofState, setRoofState] = useState({ status: 'idle' })
  // An address typed in the box but not picked from the list.
  const [typedAddress, setTypedAddress] = useState('')
  const roof = roofState.roof || null
  // The panel count comes from the formula ("Panels wanted") until the visitor sets it
  // with the map's +/- buttons; a new address goes back to the suggestion.
  const [chosenPanels, setChosenPanels] = useState(null)
  const { result, panelCount } = useMemo(
    () => computeWithRoof(model, answers, roof, chosenPanels),
    [model, answers, roof, chosenPanels],
  )
  // Questions marked "hide when the roof is found" (like shade) step aside once Google has the roof.
  const visibleInputs = useMemo(
    () => model.inputs.filter((input) => !(roof && input.hideWhenRoofFound) && isAsked(input, answers)),
    [model, roof, answers],
  )

  // Steps: the address, one per question, then the estimate (with the contact form).
  const steps = useMemo(
    () => [
      { kind: 'address' },
      ...visibleInputs.map((input) => ({ kind: 'input', input })),
      { kind: 'results' },
    ],
    [visibleInputs],
  )
  const [stepIndex, setStepIndex] = useState(0)
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const isLast = step.kind === 'results'
  const isChoice = step.kind === 'input' && (step.input.kind === 'select' || step.input.kind === 'yesno')
  const StepTag = isLast ? 'div' : 'form'
  // The furthest step reached: questions passed on the way stay answered when the visitor goes back.
  const [reached, setReached] = useState(0)
  const go = (delta) => {
    const next = Math.min(Math.max(stepIndex + delta, 0), steps.length - 1)
    setStepIndex(next)
    setReached((furthest) => Math.max(furthest, next))
  }
  // Each step remounts (its key changes), so focus its first field as it mounts and
  // Enter and the keyboard keep flowing. Not on first load: that would scroll the page.
  const firstStep = useRef(true)
  const focusFirstField = (node) => {
    if (!node) {
      return
    }
    if (firstStep.current) {
      firstStep.current = false
      return
    }
    node.querySelector('input, button[aria-pressed]')?.focus({ preventScroll: true })
  }

  async function onPickAddress({ placeId, text, session }) {
    setRoofState({ status: 'loading', address: text })
    setChosenPanels(null)
    try {
      const response = await fetch(
        `/api/solar-fit/roof?placeId=${encodeURIComponent(placeId)}&session=${session}`,
      )
      const body = await response.json()
      if (!response.ok) {
        throw new Error(body.error || 'Lookup failed')
      }
      const found = body.roof?.panels?.length && body.photo ? body.roof : null
      setRoofState({
        status: found ? 'found' : 'none',
        placeId,
        address: body.address || text,
        roof: found,
        photo: body.photo,
      })
    } catch (error) {
      setRoofState({ status: 'error', address: text, message: error instanceof Error ? error.message : '' })
    }
  }
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const fieldId = useId()

  /*
   * A number shows only once every question its formula reads has an answer: typed
   * in, or passed with its starting value, or (for "hide when the roof is found")
   * answered by Google's roof. Until then it would be a guess from the defaults.
   */
  const answered = new Set([
    ...Object.keys(edited),
    ...steps
      .slice(1, Math.max(reached, stepIndex))
      .flatMap((passed) => (passed.kind === 'input' ? [passed.input.key] : [])),
    ...(roof ? model.inputs.filter((input) => input.hideWhenRoofFound).map((input) => input.key) : []),
    // A skipped question ("Ask only when" is false) keeps its starting value, so it counts as answered.
    ...model.inputs.filter((input) => !isAsked(input, answers)).map((input) => input.key),
  ])
  const usedBy = inputsUsedBy(model)
  const isReady = (keys) => [...keys].every((key) => answered.has(key))
  const shown = result.outputs.filter(
    (output) => output.format !== 'hidden' && isReady(usedBy.get(output.key) || []),
  )
  const highlights = shown.filter((output) => output.highlight)
  const stats = shown.filter((output) => !output.highlight)
  const broken = result.outputs.filter((output) => output.error)
  const fitReady = isReady(inputsUsedBy(model, model.qualifyFormula))
  const fitMessage =
    !fitReady || result.qualifies === null
      ? ''
      : result.qualifies
        ? model.qualifiedMessage
        : model.notQualifiedMessage
  // The panels on the map come from the visitor's usage too, so they wait for it the same way.
  const panelsReady =
    chosenPanels !== null ||
    (usedBy.has(PANELS_WANTED_KEY)
      ? isReady(usedBy.get(PANELS_WANTED_KEY))
      : // Without that output, computeWithRoof sizes the panels from usage, else from the bill.
        ['consumption', 'bill'].some((key) => answered.has(key)))

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
          trap: form.get('hp_check'),
          consent: form.get('consent') === 'on',
          answers,
          placeId: roofState.placeId || '',
          panelCount: chosenPanels,
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

        <div className="solar-calculator__frame grid-frame solar-fit-stepper">
          <div className="solar-fit-stepper__progress" aria-hidden="true">
            <span
              style={{ width: `${((Math.min(stepIndex, steps.length - 1) + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="solar-fit-stepper__ask">
            {/* A form, so Enter moves on as in Typeform; the last step holds the contact form instead. */}
            <StepTag
              ref={focusFirstField}
              key={isLast ? 'results' : step.kind === 'address' ? 'address' : step.input.key}
              className="solar-fit-stepper__step"
              onSubmit={
                isLast
                  ? undefined
                  : async (event) => {
                      event.preventDefault()
                      // A typed address nobody picked from the list: look it up rather than skip.
                      if (step.kind === 'address' && typedAddress && roofState.status === 'idle') {
                        const match = await findAddress(typedAddress).catch(() => null)
                        if (match) {
                          setTypedAddress('')
                          await onPickAddress({ ...match, session: '' })
                        }
                      }
                      go(1)
                    }
              }
            >
              <p className="solar-fit-stepper__count">
                {isLast ? 'Last step' : `${Math.min(stepIndex, steps.length - 1) + 1} of ${steps.length - 1}`}
              </p>

              {step.kind === 'address' ? (
                <div className="solar-fit-stepper__question">
                  <label htmlFor={`${fieldId}-address`} className="solar-fit-stepper__label">
                    What is your home address?
                  </label>
                  <AddressSearch
                    id={`${fieldId}-address`}
                    picked={roofState.address}
                    onPick={(suggestion) => {
                      setTypedAddress('')
                      onPickAddress(suggestion)
                    }}
                    onTyped={setTypedAddress}
                  />
                  <p className="solar-fit__help">
                    {roofState.status === 'loading'
                      ? 'Finding your roof…'
                      : roofState.status === 'found'
                        ? 'Found your roof. Next, your bill, and we will place the panels on the map.'
                        : roofState.status === 'none'
                          ? 'We could not map that roof from the air, so your answers set the estimate.'
                          : roofState.status === 'error'
                            ? roofState.message || 'We could not look that up. Your answers set the estimate.'
                            : 'We map your roof from satellite imagery and place the panels for you. You can skip this.'}
                  </p>
                </div>
              ) : null}

              {step.kind === 'input' && isChoice ? (
                <fieldset className="solar-fit-stepper__question">
                  <legend className="solar-fit-stepper__label">{step.input.label}</legend>
                  {step.input.help ? <p className="solar-fit__help">{step.input.help}</p> : null}
                  <div className="solar-fit-stepper__choices">
                    {step.input.options.map((option, index) => {
                      const chosen = String(answers[step.input.key]) === String(option.value)
                      return (
                        <button
                          key={option.label}
                          type="button"
                          aria-pressed={chosen}
                          className={cn(
                            'solar-fit-stepper__choice',
                            chosen && 'solar-fit-stepper__choice--chosen',
                          )}
                          onClick={() => {
                            setEdited((values) => ({ ...values, [step.input.key]: option.value }))
                            // A beat to see the choice land, then on to the next question.
                            setTimeout(() => go(1), 220)
                          }}
                        >
                          <span className="solar-fit-stepper__choice-key" aria-hidden="true">
                            {String.fromCodePoint(65 + index)}
                          </span>
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              ) : null}

              {step.kind === 'input' && !isChoice ? (
                <div className="solar-fit-stepper__question">
                  <label htmlFor={`${fieldId}-${step.input.key}`} className="solar-fit-stepper__label">
                    {step.input.label}
                  </label>
                  {step.input.help ? <p className="solar-fit__help">{step.input.help}</p> : null}
                  <div className="solar-fit__number solar-fit-stepper__number">
                    {step.input.prefix ? (
                      <span className="solar-fit__affix" aria-hidden="true">
                        {step.input.prefix}
                      </span>
                    ) : null}
                    <input
                      id={`${fieldId}-${step.input.key}`}
                      type="number"
                      inputMode="decimal"
                      className="solar-fit__number-input"
                      value={answers[step.input.key]}
                      min={step.input.min}
                      max={step.input.max}
                      // Any amount, cents included: a Studio step of 10 made the browser refuse a bill like $152.50.
                      step="any"
                      onChange={setAnswer(step.input.key)}
                    />
                    {step.input.suffix ? (
                      <span className="solar-fit__affix" aria-hidden="true">
                        {step.input.suffix}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {isLast ? (
                <p className="solar-fit-stepper__label">
                  That is your estimate. Want the full report and a real quote?
                </p>
              ) : null}

              {broken.length ? (
                <p className="solar-fit__error" role="alert">
                  {broken.map((output) => `${output.label}: ${output.error}`).join(' · ')}
                </p>
              ) : null}

              {isLast ? null : (
                <div className="solar-fit-stepper__nav">
                  {stepIndex > 0 ? (
                    <button type="button" className="solar-fit-stepper__back" onClick={() => go(-1)}>
                      <NavArrowLeft aria-hidden="true" />
                      Back
                    </button>
                  ) : null}
                  <button type="submit" className="solar-calculator__cta-button">
                    {step.kind === 'address' && roofState.status === 'idle' && !typedAddress ? 'Skip' : 'OK'}
                    <NavArrowRight className="solar-calculator__cta-icon" aria-hidden="true" />
                  </button>
                  <span className="solar-fit-stepper__hint" aria-hidden="true">
                    or press <kbd>Enter ↵</kbd>
                  </span>
                </div>
              )}
            </StepTag>

            {isLast ? (
              <div className="solar-fit__contact solar-fit__contact--wide">
                <button type="button" className="solar-fit-stepper__back" onClick={() => go(-1)}>
                  <NavArrowLeft aria-hidden="true" />
                  Change my answers
                </button>
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
                        <span>Phone</span>
                        <input name="phone" type="tel" autoComplete="tel" />
                      </label>
                      <label className="solar-fit__form-field solar-fit__form-field--wide">
                        <span>Email</span>
                        <input name="email" type="email" autoComplete="email" required />
                      </label>
                    </div>
                    {/*
                     * Hidden from people; bots fill it and get dropped. Not named like a
                     * real field ("company" was): browser autofill filled it for real
                     * visitors, and their requests were dropped without a word.
                     */}
                    <input
                      className="solar-fit__trap"
                      name="hp_check"
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
                        {status.state === 'sending' ? 'Sending…' : section?.submitLabel || 'Talk to Kathie'}
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
            ) : null}
          </div>

          {/*
           * Wide screens: the roof map beside the question, then the numbers in a row under
           * both (stats under the question, monthly figures and the fit message under the map).
           * Phones: question, map, stats, monthly figures, one under the other.
           */}
          <div className="solar-fit-stepper__map">
            {roof ? (
              <RoofMap
                roof={roof}
                photo={roofState.photo}
                count={panelsReady ? panelCount : 0}
                address={roofState.address}
                onCountChange={panelsReady ? setChosenPanels : null}
              />
            ) : null}
            {stats.length || highlights.length || roof ? null : (
              <p className="solar-fit-stepper__waiting">
                Your roof and your numbers show up here as you answer.
              </p>
            )}
          </div>

          {/* Wide screens: the stats across the top, the monthly banner under the question (solar-fit-stepper.css). */}
          <div className="solar-fit-stepper__stats" aria-live="polite">
            {stats.length ? (
              <dl className="solar-calculator__stats solar-fit-stepper__readout">
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
          </div>
          <div className="solar-fit-stepper__totals" aria-live="polite">
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
            {fitMessage ? (
              <p className={cn('solar-fit__verdict', result.qualifies && 'solar-fit__verdict--yes')}>
                {fitMessage}
              </p>
            ) : null}
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
