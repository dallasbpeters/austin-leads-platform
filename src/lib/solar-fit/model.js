// Imported from @sanity/client (not @/ paths) so Studio's formula builder can share this file.
import { stegaClean } from '@sanity/client/stega'

import { evaluateFormula, FormulaError } from './formula'

/*
 * The "See if solar is right for you" model: the questions, the constants and
 * the formulas. It lives in Sanity (solarFitSection) so the math can change
 * without a deploy; DEFAULT_MODEL is only the fallback while the section is
 * empty. The same model runs in the browser for live results and on the server
 * when the form is sent, so the email and spreadsheet always match what the
 * homeowner saw.
 *
 * DEFAULT_MODEL is a placeholder until the final formula and payment estimate
 * are settled. It has no federal tax credit (that ended December 31, 2025).
 */
export const DEFAULT_MODEL = {
  inputs: [
    {
      key: 'bill',
      label: 'Average monthly electric bill',
      kind: 'number',
      defaultValue: 200,
      min: 30,
      max: 1500,
      step: 10,
      prefix: '$',
    },
    {
      key: 'owner',
      label: 'Do you own your home?',
      kind: 'select',
      defaultValue: 1,
      options: [
        { label: 'Yes', value: 1 },
        { label: 'No, I rent', value: 0 },
      ],
    },
    {
      key: 'roofAge',
      label: 'How old is your roof?',
      kind: 'select',
      defaultValue: 5,
      options: [
        { label: 'Under 10 years', value: 5 },
        { label: '10 to 20 years', value: 15 },
        { label: 'Over 20 years', value: 25 },
      ],
    },
    {
      key: 'shade',
      label: 'How much shade hits your roof?',
      kind: 'select',
      defaultValue: 0.95,
      options: [
        { label: 'Little or none', value: 0.95 },
        { label: 'Some', value: 0.85 },
        { label: 'A lot', value: 0.65 },
      ],
    },
    {
      key: 'apr',
      label: 'Credit range (for the payment estimate)',
      kind: 'select',
      defaultValue: 0.0849,
      options: [
        { label: 'Excellent (740+)', value: 0.0699 },
        { label: 'Good (680–739)', value: 0.0849 },
        { label: 'Fair (620–679)', value: 0.0999 },
        { label: 'Still building', value: 0.1299 },
      ],
      help: 'Placeholder rates until the financing partner confirms them.',
    },
  ],
  constants: [
    { key: 'rate', label: 'Electricity rate ($/kWh)', value: 0.11 },
    { key: 'sunHours', label: 'Peak sun hours per day', value: 5.5 },
    { key: 'performance', label: 'System performance ratio', value: 0.8 },
    { key: 'offset', label: 'Share of the bill to cover', value: 0.85 },
    { key: 'rebate', label: 'Austin Energy rebate ($)', value: 2500 },
    { key: 'fixedCosts', label: 'Permits and design ($)', value: 1800 },
    { key: 'increase', label: 'Yearly rate increase', value: 0.025 },
    { key: 'termYears', label: 'Loan term (years)', value: 20 },
    { key: 'panelKw', label: 'Panel size (kW)', value: 0.4 },
  ],
  outputs: [
    {
      key: 'systemKw',
      label: 'System size',
      formula: '(bill / rate) * 12 * offset / (sunHours * 365 * performance * shade)',
      format: 'kw',
      decimals: 1,
    },
    { key: 'panels', label: 'Panels', formula: 'ceil(systemKw / panelKw)', format: 'hidden' },
    {
      key: 'costPerWatt',
      label: 'Cost per watt',
      formula: 'systemKw >= 10 ? 2.45 : systemKw >= 7 ? 2.6 : systemKw >= 5 ? 2.75 : 2.95',
      format: 'hidden',
    },
    {
      key: 'netCost',
      label: 'Estimated cost after rebate',
      formula: 'max(0, systemKw * 1000 * costPerWatt + fixedCosts - rebate)',
      format: 'currency',
      detail: 'After the $2,500 Austin Energy rebate',
    },
    {
      key: 'monthlySavings',
      label: 'Monthly savings',
      formula: 'min(bill, systemKw * sunHours * 365 * performance * shade * rate / 12)',
      format: 'currency',
      highlight: true,
    },
    {
      key: 'monthlyPayment',
      label: 'Estimated monthly payment',
      formula: 'payment(netCost, apr, termYears)',
      format: 'currency',
      detail: 'Placeholder loan terms',
      highlight: true,
    },
    {
      key: 'payback',
      label: 'Payback',
      formula: 'netCost / max(1, monthlySavings * 12)',
      format: 'years',
      decimals: 1,
    },
    {
      key: 'savings25',
      label: '25-year net savings',
      formula: 'growth(monthlySavings * 12, increase, 25) - netCost',
      format: 'currency',
    },
  ],
  qualifyFormula: 'owner == 1 && roofAge < 20 && shade >= 0.85 && bill >= 75',
  qualifiedMessage: 'Your home looks like a good fit for solar.',
  notQualifiedMessage:
    'Solar may still work for you, but something here needs a closer look, like the roof, shade or ownership. We will talk it through, no pressure.',
}

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return value === '' || value === null || value === undefined || !Number.isFinite(parsed) ? fallback : parsed
}

const YES_NO_OPTIONS = [
  { label: 'Yes', value: 1 },
  { label: 'No', value: 0 },
]

/*
 * Pick-one answers use their number when they have one, else their own text,
 * so formulas can say roofType == "Metal". Yes / No questions are 1 and 0.
 */
/*
 * In Studio's preview, Sanity hides edit markers inside every string. Anything
 * the form compares or computes with (types, keys, formulas, answer values) is
 * cleaned of them; labels keep them so click-to-edit still works.
 */
const clean = (value) => (typeof value === 'string' ? stegaClean(value) : value)

function normalizeInput(raw) {
  const input = {
    ...raw,
    key: clean(raw.key),
    kind: clean(raw.kind) || 'number',
    prefix: clean(raw.prefix),
    suffix: clean(raw.suffix),
  }
  if (input.kind === 'yesno') {
    return { ...input, options: YES_NO_OPTIONS, defaultValue: toNumber(input.defaultValue, 1) === 0 ? 0 : 1 }
  }
  if (input.kind === 'select') {
    const options = (input.options || [])
      .filter((option) => option?.label)
      .map((option) => ({
        label: option.label,
        value:
          typeof option.value === 'number' && Number.isFinite(option.value)
            ? option.value
            : clean(option.label),
      }))
    const fallback = options[0]?.value ?? ''
    const listed = options.find((option) => String(option.value) === String(input.defaultValue))
    return { ...input, options, defaultValue: listed ? listed.value : fallback }
  }
  return { ...input, defaultValue: toNumber(input.defaultValue, 0) }
}

/**
 * The section's model, filled in from DEFAULT_MODEL only where the section is
 * empty. Questions show as soon as an editor adds them; the built-in math only
 * runs while the section has no questions and no results of its own, since its
 * formulas name the built-in questions.
 */
export function resolveModel(section) {
  const inputs = (section?.fitInputs || []).filter((input) => input?.key)
  const outputs = (section?.fitOutputs || [])
    .filter((output) => output?.key && output?.formula)
    .map((output) => ({
      ...output,
      key: clean(output.key),
      formula: clean(output.formula),
      format: clean(output.format),
    }))

  if (!inputs.length && !outputs.length) {
    return DEFAULT_MODEL
  }

  const constants = (section?.fitConstants || [])
    .filter((constant) => constant?.key)
    .map((constant) => ({ ...constant, key: clean(constant.key) }))

  return {
    inputs: (inputs.length ? inputs : DEFAULT_MODEL.inputs).map(normalizeInput),
    constants: constants.length
      ? constants.map((constant) => ({ ...constant, value: toNumber(constant.value) }))
      : DEFAULT_MODEL.constants,
    // No built-in results here: they name the built-in questions, not these.
    outputs,
    qualifyFormula: clean(section?.qualifyFormula) || '',
    qualifiedMessage: section?.qualifiedMessage || DEFAULT_MODEL.qualifiedMessage,
    notQualifiedMessage: section?.notQualifiedMessage || DEFAULT_MODEL.notQualifiedMessage,
  }
}

export function defaultValues(model) {
  return Object.fromEntries(model.inputs.map((input) => [input.key, input.defaultValue]))
}

/** Clamps an answer to its input's range, and to a listed option for selects. */
function cleanValue(input, raw) {
  if (input.kind === 'select' || input.kind === 'yesno') {
    // Form fields send text, so match on text and keep the option's own value.
    const match = input.options.find((option) => String(option.value) === String(raw))
    return match ? match.value : input.defaultValue
  }
  let value = toNumber(raw, input.defaultValue)
  if (typeof input.min === 'number') {
    value = Math.max(input.min, value)
  }
  if (typeof input.max === 'number') {
    value = Math.min(input.max, value)
  }
  return value
}

/**
 * Runs every formula in order; each can use the inputs, the constants and any
 * output above it. A broken formula yields an `error` on that output instead of
 * stopping the rest.
 */
export function computeModel(model, rawValues = {}) {
  const values = Object.fromEntries(
    model.inputs.map((input) => [input.key, cleanValue(input, rawValues[input.key])]),
  )
  const scope = {
    ...Object.fromEntries(model.constants.map((constant) => [constant.key, constant.value])),
    ...values,
  }

  const outputs = model.outputs.map((output) => {
    try {
      const value = evaluateFormula(output.formula, scope)
      scope[output.key] = value
      return { ...output, value, error: null }
    } catch (error) {
      scope[output.key] = 0
      return {
        ...output,
        value: null,
        error: error instanceof FormulaError ? error.message : 'Formula failed',
      }
    }
  })

  let qualifies = null
  if (model.qualifyFormula) {
    try {
      qualifies = Boolean(evaluateFormula(model.qualifyFormula, scope))
    } catch {
      qualifies = null
    }
  }

  return { values, outputs, qualifies }
}

export function formatOutput(output) {
  if (output.value === null || output.value === undefined) {
    return '—'
  }
  if (typeof output.value === 'string') {
    return output.value
  }
  const decimals = typeof output.decimals === 'number' ? output.decimals : 0
  const number = output.value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  switch (output.format) {
    case 'currency': {
      return `${output.value < 0 ? '-' : ''}$${Math.abs(output.value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`
    }
    case 'kw': {
      return `${number} kW`
    }
    case 'years': {
      return `${number} yr`
    }
    case 'percent': {
      return `${(output.value * 100).toFixed(decimals)}%`
    }
    default: {
      return number
    }
  }
}
