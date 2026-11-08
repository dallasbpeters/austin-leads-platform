import { describe, expect, it } from 'vitest'

import { evaluateFormula, FormulaError } from '@/lib/solar-fit/formula'
import {
  computeModel,
  DEFAULT_MODEL,
  defaultValues,
  formatOutput,
  inputsUsedBy,
  resolveModel,
} from '@/lib/solar-fit/model'

describe(evaluateFormula, () => {
  it('follows arithmetic precedence and parentheses', () => {
    expect(evaluateFormula('2 + 3 * 4', {})).toBe(14)
    expect(evaluateFormula('(2 + 3) * 4', {})).toBe(20)
    expect(evaluateFormula('2 ^ 3 ^ 2', {})).toBe(512)
    expect(evaluateFormula('-bill + 10', { bill: 4 })).toBe(6)
  })

  it('reads named values, functions, comparisons and ternaries', () => {
    const scope = { kw: 8, owner: 1, score: 700 }
    expect(evaluateFormula('kw >= 10 ? 2.45 : kw >= 7 ? 2.6 : 2.95', scope)).toBe(2.6)
    expect(evaluateFormula('owner == 1 && score >= 650', scope)).toBe(1)
    expect(evaluateFormula('!owner || score < 600', scope)).toBe(0)
    expect(evaluateFormula('max(0, min(5, kw))', scope)).toBe(5)
    expect(evaluateFormula('round(10 / 3, 2)', scope)).toBe(3.33)
  })

  it('compares text answers without caring about case', () => {
    const scope = { north: 'Yes', roof: 'Metal shingle' }
    expect(evaluateFormula('north == "yes" ? 0.8 : 1', scope)).toBe(0.8)
    expect(evaluateFormula("roof != 'Tile'", scope)).toBe(1)
    expect(evaluateFormula('roof == "Tile" ? "Check the tiles" : "Standard install"', scope)).toBe(
      'Standard install',
    )
  })

  it('computes a standard loan payment', () => {
    // $20,000 at 6% for 10 years is about $222.04 a month.
    expect(evaluateFormula('payment(20000, 0.06, 10)', {})).toBeCloseTo(222.04, 2)
    expect(evaluateFormula('payment(12000, 0, 1)', {})).toBe(1000)
  })

  it('returns 0 instead of Infinity on division by zero', () => {
    expect(evaluateFormula('5 / 0', {})).toBe(0)
  })

  it('rejects anything that is not math', () => {
    expect(() => evaluateFormula('constructor', {})).toThrow(FormulaError)
    expect(() => evaluateFormula('alert(1)', {})).toThrow(FormulaError)
    expect(() => evaluateFormula('process.exit()', {})).toThrow(FormulaError)
    expect(() => evaluateFormula('a; b', { a: 1, b: 2 })).toThrow(FormulaError)
    expect(() => evaluateFormula('"unclosed', {})).toThrow(FormulaError)
    expect(() => evaluateFormula('2 +', {})).toThrow(FormulaError)
  })
})

describe(computeModel, () => {
  it('runs the default model with no formula errors', () => {
    const result = computeModel(DEFAULT_MODEL, defaultValues(DEFAULT_MODEL))
    expect(result.outputs.every((output) => output.error === null)).toBe(true)
    expect(result.qualifies).toBe(true)
    const byKey = Object.fromEntries(result.outputs.map((output) => [output.key, output.value]))
    expect(byKey.systemKw).toBeGreaterThan(5)
    expect(byKey.monthlySavings).toBeLessThanOrEqual(200)
  })

  it('clamps numbers and ignores options that are not listed', () => {
    const { values } = computeModel(DEFAULT_MODEL, { bill: 999_999, owner: 7 })
    expect(values.bill).toBe(1500)
    expect(values.owner).toBe(1)
  })

  it('marks a broken formula without stopping the others', () => {
    const model = {
      ...DEFAULT_MODEL,
      outputs: [
        { key: 'broken', label: 'Broken', formula: 'nope * 2' },
        { key: 'fine', label: 'Fine', formula: 'bill * 2' },
      ],
    }
    const { outputs } = computeModel(model, { bill: 100 })
    expect(outputs[0].error).toMatch(/Unknown value "nope"/u)
    expect(outputs[1].value).toBe(200)
  })

  it("shows an editor's questions before any results exist", () => {
    const model = resolveModel({
      fitInputs: [
        { key: 'north', label: 'Faces north?', kind: 'select', options: [{ label: 'Yes', value: 1 }] },
      ],
      fitOutputs: [],
    })
    expect(model.inputs.map((input) => input.key)).toEqual(['north'])
    expect(model.outputs).toEqual([])
    expect(computeModel(model, {}).values).toEqual({ north: 1 })
  })

  it('treats Yes / No as 1 and 0 and pick-one answers without a number as their text', () => {
    const model = resolveModel({
      fitInputs: [
        { key: 'north', label: 'Faces north?', kind: 'yesno' },
        {
          key: 'roof',
          label: 'Roof type',
          kind: 'select',
          options: [{ label: 'Shingle' }, { label: 'Metal' }],
        },
      ],
      fitOutputs: [
        { key: 'factor', label: 'Factor', formula: 'north ? 0.8 : 1', format: 'number', decimals: 1 },
        {
          key: 'note',
          label: 'Note',
          formula: 'roof == "metal" ? "Metal is great" : "Standard"',
          format: 'text',
        },
      ],
    })
    // Form fields send strings; the model maps them back to each option's value.
    const result = computeModel(model, { north: '0', roof: 'Metal' })
    expect(result.values).toEqual({ north: 0, roof: 'Metal' })
    expect(result.outputs.map((output) => formatOutput(output))).toEqual(['1.0', 'Metal is great'])
  })

  it('falls back to the default model when the section is empty', () => {
    expect(resolveModel(null)).toBe(DEFAULT_MODEL)
    expect(resolveModel({ fitInputs: [], fitOutputs: [] })).toBe(DEFAULT_MODEL)
  })
})

describe(formatOutput, () => {
  it('formats each kind of result', () => {
    expect(formatOutput({ value: 1234.5, format: 'currency' })).toBe('$1,235')
    expect(formatOutput({ value: -50, format: 'currency' })).toBe('-$50')
    expect(formatOutput({ value: 9.64, format: 'kw', decimals: 1 })).toBe('9.6 kW')
    expect(formatOutput({ value: 12.34, format: 'years', decimals: 1 })).toBe('12.3 yr')
    expect(formatOutput({ value: null, format: 'currency' })).toBe('—')
  })
})

describe(inputsUsedBy, () => {
  const model = {
    inputs: [{ key: 'bill' }, { key: 'apr' }, { key: 'roofType' }],
    outputs: [
      { key: 'systemKw', formula: '(bill / rate) * 12' },
      { key: 'payment', formula: 'payment(systemKw * 1000, apr, termYears)' },
      { key: 'metal', formula: 'roofType == "bill" ? 1 : 0' },
    ],
  }

  it('lists the questions a formula reads, through other outputs', () => {
    const used = inputsUsedBy(model)
    expect([...used.get('systemKw')]).toStrictEqual(['bill'])
    expect([...used.get('payment')].toSorted()).toStrictEqual(['apr', 'bill'])
  })

  it('ignores words inside quoted text', () => {
    expect([...inputsUsedBy(model).get('metal')]).toStrictEqual(['roofType'])
  })

  it('reads any formula, such as the fit check', () => {
    expect([...inputsUsedBy(model, 'apr > 0 && systemKw > 1')].toSorted()).toStrictEqual(['apr', 'bill'])
  })
})
