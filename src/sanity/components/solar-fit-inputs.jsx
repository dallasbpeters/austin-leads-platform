'use client'

import { Box, Button, Card, Flex, Stack, Text, TextArea } from '@sanity/ui'
import { useEffect, useMemo, useRef } from 'react'
import { set, unset, useFormValue } from 'sanity'

import {
  computeModel,
  DEFAULT_MODEL,
  defaultValues,
  formatOutput,
  resolveModel,
} from '../../lib/solar-fit/model'

/*
 * Studio helpers that make the Solar Fit Form plug and play:
 *   - SolarFitSectionInput: a "Start from a template" button above the section.
 *   - FormulaKeyInput: fills each key from its label, so editors never invent names.
 *   - FormulaInput: clickable values and functions above the formula box, and the
 *     live answer (or a plain-words problem) under it, using the same math as the site.
 */

const randomKey = () => Math.random().toString(36).slice(2, 12)

/** "Monthly savings" -> "monthlySavings". */
export function toFormulaKey(label) {
  const words = String(label || '')
    .normalize('NFKD')
    .replaceAll(/[^A-Za-z0-9 ]+/gu, ' ')
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
  const key = words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('')
  return /^[0-9]/u.test(key) ? `n${key}` : key
}

/* The starter template: the site's built-in model, in Sanity's shape. */
function templatePatches() {
  const inputs = DEFAULT_MODEL.inputs.map(({ options, ...input }) => ({
    _type: 'solarFitInput',
    _key: randomKey(),
    ...input,
    ...(options
      ? {
          options: options.map((option) => ({ _type: 'solarFitOption', _key: randomKey(), ...option })),
        }
      : {}),
  }))
  const constants = DEFAULT_MODEL.constants.map((constant) => ({
    _type: 'solarFitConstant',
    _key: randomKey(),
    ...constant,
  }))
  const outputs = DEFAULT_MODEL.outputs.map((output) => ({
    _type: 'solarFitOutput',
    _key: randomKey(),
    ...output,
  }))
  return [
    set(inputs, ['fitInputs']),
    set(constants, ['fitConstants']),
    set(outputs, ['fitOutputs']),
    set(DEFAULT_MODEL.qualifyFormula, ['qualifyFormula']),
    set(DEFAULT_MODEL.qualifiedMessage, ['qualifiedMessage']),
    set(DEFAULT_MODEL.notQualifiedMessage, ['notQualifiedMessage']),
  ]
}

export function SolarFitSectionInput(props) {
  const { value, onChange } = props
  const hasModel = Boolean(
    value?.fitInputs?.length || value?.fitOutputs?.length || value?.fitConstants?.length,
  )

  const loadTemplate = () => {
    if (
      hasModel &&
      !window.confirm('Replace the questions, constants and results with the starter template?')
    ) {
      return
    }
    onChange(templatePatches())
  }

  return (
    <Stack gap={4}>
      <Card padding={3} radius={2} tone="primary" border>
        <Flex align="center" gap={3} wrap="wrap">
          <Box flex={1}>
            <Text size={1}>
              {hasModel
                ? 'Change any number below, or start over from the solar template.'
                : 'Start from a working solar template, then change the numbers.'}
            </Text>
          </Box>
          <Button
            text={hasModel ? 'Reset to template' : 'Start from template'}
            mode={hasModel ? 'ghost' : 'default'}
            tone="primary"
            fontSize={1}
            onClick={loadTemplate}
          />
        </Flex>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  )
}

/** Key fields fill themselves from the label beside them, until an editor types their own. */
export function FormulaKeyInput(props) {
  const { value, onChange, path } = props
  const label = useFormValue([...path.slice(0, -1), 'label'])
  const lastAuto = useRef(toFormulaKey(label))

  useEffect(() => {
    const next = toFormulaKey(label)
    // Follow the label only while the key is empty or still the one we made.
    if (next && (!value || value === lastAuto.current) && next !== value) {
      onChange(set(next))
    }
    lastAuto.current = next
  }, [label, value, onChange])

  return props.renderDefault(props)
}

/*
 * Button templates: "%" is replaced by the selected text, or by the
 * placeholder when nothing is selected, so selecting "consumption" and clicking
 * "Smaller of" gives min(consumption, b).
 */
const FUNCTION_HELP = [
  {
    insert: 'payment(%, apr, years)',
    placeholder: 'amount',
    label: 'Loan payment',
    hint: 'Monthly payment on a loan',
  },
  { insert: 'max(%, b)', placeholder: 'a', label: 'Larger of', hint: 'The bigger of two numbers' },
  { insert: 'min(%, b)', placeholder: 'a', label: 'Smaller of', hint: 'The smaller of two numbers' },
  { insert: 'round(%, 2)', placeholder: 'value', label: 'Round', hint: 'Round to some decimal places' },
  {
    insert: 'growth(%, rate, years)',
    placeholder: 'yearly',
    label: 'Grows yearly',
    hint: 'Total of a yearly amount that grows',
  },
  { insert: '% ? yes : no', placeholder: 'a >= b', label: 'If… then… else', hint: 'Pick one of two values' },
]

const OPERATOR_HELP = [
  { insert: ' + ', label: '+ plus' },
  { insert: ' - ', label: '− minus' },
  { insert: ' * ', label: '× times' },
  { insert: ' / ', label: '÷ divided by' },
  { insert: '(%)', placeholder: '', label: '( ) group' },
  { insert: ' >= ', label: '≥ at least' },
  { insert: ' <= ', label: '≤ at most' },
  { insert: ' == ', label: '= equals' },
  { insert: ' && ', label: 'and' },
  { insert: ' || ', label: 'or' },
]

/** Turns an engine message into plain words. */
function explain(message) {
  const unknown = /^Unknown value "(.+)"$/u.exec(message || '')
  if (unknown) {
    return `"${unknown[1]}" is not a question, constant or result above this one.`
  }
  const unknownFunction = /^Unknown function "(.+)"$/u.exec(message || '')
  if (unknownFunction) {
    return `"${unknownFunction[1]}" is not one of the functions listed above.`
  }
  const unexpected = /^Unexpected "(.+)"$/u.exec(message || '')
  if (unexpected) {
    return `Something is missing before "${unexpected[1]}". Join the parts with an operator such as + − × ÷ (for example consumption * rate).`
  }
  const expected = /^Expected "(.+)"$/u.exec(message || '')
  if (expected) {
    return `A "${expected[1]}" is missing. Check that every ( has a matching ).`
  }
  if (message === 'Formula ended too early') {
    return 'The formula stops too soon. Add a value after the last operator.'
  }
  return message
}

function NameButtons({ title, items, onInsert }) {
  if (!items.length) {
    return null
  }
  return (
    <Stack gap={2}>
      <Text size={0} muted weight="medium">
        {title}
      </Text>
      <Flex gap={1} wrap="wrap">
        {items.map((item) => (
          <Button
            key={item.label}
            text={item.label}
            title={item.hint || item.insert}
            mode="ghost"
            fontSize={1}
            padding={2}
            onClick={() => onInsert(item)}
          />
        ))}
      </Flex>
    </Stack>
  )
}

/**
 * The formula box for a result (or the "Qualifies when" rule): buttons that add
 * names and functions at the cursor, and the live answer underneath.
 */
export function FormulaInput(props) {
  const { value, onChange, path, id, readOnly } = props
  const textRef = useRef(null)

  // The section is everything before ".fitOutputs[...]" (results) or before the field (qualify rule).
  const outputsIndex = path.indexOf('fitOutputs')
  const isQualify = outputsIndex === -1
  const sectionPath = isQualify ? path.slice(0, -1) : path.slice(0, outputsIndex)
  const section = useFormValue(sectionPath)
  const outputKey = isQualify ? null : path[outputsIndex + 1]?._key

  const { questions, constants, results, answer } = useMemo(() => {
    const outputs = section?.fitOutputs || []
    const ownIndex = isQualify ? outputs.length : outputs.findIndex((output) => output._key === outputKey)
    const model = resolveModel(section)
    const computed = computeModel(model, defaultValues(model))

    let current = null
    if (isQualify) {
      current = value
        ? {
            text: computed.qualifies
              ? 'Fits (with the starting answers)'
              : 'Needs a closer look (with the starting answers)',
          }
        : null
    } else {
      const own = computed.outputs.find((output) => output._key === outputKey)
      if (own?.error) {
        current = { error: explain(own.error) }
      } else if (own && value) {
        current = {
          text: `= ${formatOutput({ ...own, format: own.format === 'hidden' ? 'number' : own.format })}`,
        }
      }
    }

    return {
      questions: (section?.fitInputs || [])
        .filter((input) => input?.key)
        .map((input) => ({ insert: input.key, label: input.label || input.key, hint: input.key })),
      constants: (section?.fitConstants || [])
        .filter((constant) => constant?.key)
        .map((constant) => ({
          insert: constant.key,
          label: `${constant.label || constant.key} (${constant.value})`,
          hint: constant.key,
        })),
      results: outputs
        .slice(0, ownIndex === -1 ? 0 : ownIndex)
        .filter((output) => output?.key)
        .map((output) => ({ insert: output.key, label: output.label || output.key, hint: output.key })),
      answer: current,
    }
  }, [section, outputKey, isQualify, value])

  const insert = (item) => {
    const element = textRef.current
    const current = value || ''
    const start = element ? element.selectionStart : current.length
    const end = element ? element.selectionEnd : current.length
    const selected = current.slice(start, end)
    const text = item.insert.includes('%')
      ? item.insert.replace('%', selected || item.placeholder || '')
      : item.insert
    const before = current.slice(0, start)
    // Names and functions get a space after the previous text; operators bring their own.
    const spacer = before && !/[\s(]$/u.test(before) && !text.startsWith(' ') ? ' ' : ''
    const next = `${before}${spacer}${text}${current.slice(end)}`
    onChange(set(next))
    requestAnimationFrame(() => {
      if (element) {
        const caret = before.length + spacer.length + text.length
        element.focus()
        element.setSelectionRange(caret, caret)
      }
    })
  }

  return (
    <Stack gap={3}>
      {readOnly ? null : (
        <Card padding={3} radius={2} tone="transparent" border>
          <Stack gap={3}>
            <Text size={1} muted>
              Click to add to the formula:
            </Text>
            <NameButtons title="Questions" items={questions} onInsert={insert} />
            <NameButtons title="Constants" items={constants} onInsert={insert} />
            <NameButtons
              title={isQualify ? 'Results' : 'Results above this one'}
              items={results}
              onInsert={insert}
            />
            <NameButtons title="Math" items={OPERATOR_HELP} onInsert={insert} />
            <NameButtons
              title="Functions (select part of the formula first to wrap it)"
              items={FUNCTION_HELP}
              onInsert={insert}
            />
          </Stack>
        </Card>
      )}
      <TextArea
        ref={textRef}
        id={id}
        rows={2}
        value={value || ''}
        readOnly={readOnly}
        placeholder={isQualify ? 'e.g. north == 0 && bill >= 75' : 'e.g. consumption * rate'}
        onChange={(event) => onChange(event.currentTarget.value ? set(event.currentTarget.value) : unset())}
        style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
      />
      {answer?.error ? (
        <Card padding={2} radius={2} tone="critical">
          <Text size={1}>{answer.error}</Text>
        </Card>
      ) : null}
      {answer?.text ? (
        <Card padding={2} radius={2} tone="positive">
          <Text size={1}>{answer.text}</Text>
        </Card>
      ) : null}
    </Stack>
  )
}
