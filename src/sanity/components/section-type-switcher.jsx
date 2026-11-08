import { Box, Button, Card, Dialog, Flex, Select, Stack, Text } from '@sanity/ui'
import { useMemo, useState } from 'react'
import { set, useFormValue, useSchema } from 'sanity'

import { convertSection, filledFields } from '../../lib/sanity/convert-section'

/*
 * "Change type" at the top of every page section: pick another section type
 * and the content moves across (src/lib/sanity/convert-section.js). A dialog
 * lists what will not carry across first; Studio's Undo brings the old section back.
 */

/** True for one section inside a document's `sections` list. */
export function isPageSection(props) {
  const { path, schemaType } = props
  return (
    schemaType?.jsonType === 'object' &&
    path?.length === 2 &&
    path[0] === 'sections' &&
    typeof path[1] === 'object' &&
    Boolean(path[1]?._key)
  )
}

export const initialValueOf = (type) => {
  try {
    const initial = typeof type.initialValue === 'function' ? type.initialValue() : type.initialValue
    // An async initial value is skipped; the section's own `type` is derived instead.
    return initial && typeof initial === 'object' && typeof initial.then !== 'function' ? initial : {}
  } catch {
    return {}
  }
}

const titleOf = (type) => type?.title || type?.name

export const SectionTypeSwitcher = (props) => {
  const { value, schemaType, onChange } = props
  const schema = useSchema()
  const documentType = useFormValue(['_type'])
  const [target, setTarget] = useState(null)

  // The section types this document's `sections` list allows.
  const choices = useMemo(() => {
    const sectionsField = schema.get(documentType)?.fields?.find((field) => field.name === 'sections')
    return (sectionsField?.type?.of || [])
      .filter((type) => type.name !== schemaType.name)
      .toSorted((a, b) => titleOf(a).localeCompare(titleOf(b)))
  }, [schema, documentType, schemaType.name])

  const preview = useMemo(
    () => (target && value ? convertSection(value, target, initialValueOf(target)) : null),
    [target, value],
  )

  if (!choices.length || !value || props.readOnly) {
    return props.renderDefault(props)
  }

  // Fields dropped whole; a list that lost some items still moves across.
  const droppedFields = new Set(
    (preview?.dropped || []).filter((entry) => !entry.where && !entry.lost).map((entry) => entry.field),
  )
  const moved = preview ? filledFields(value).filter((name) => !droppedFields.has(name)) : []

  // Labels as the editor sees them ("Section background color", not sectionBackgroundColor).
  // A dropped field is named by the old section; the list it sat in is named by the new one.
  const titleIn = (type, name) => type?.fields?.find((member) => member.name === name)?.type?.title || name
  const topTitle = (name) => titleIn(schemaType, name)
  const describe = (entry) => {
    if (entry.lost) {
      return `${entry.lost} of ${entry.of} items in ${titleIn(target, entry.field)}`
    }
    return entry.where ? `${entry.field} (in ${titleIn(target, entry.where)})` : topTitle(entry.field)
  }

  const close = () => setTarget(null)
  const convert = () => {
    onChange(set(preview.value))
    close()
  }

  return (
    <Stack gap={4}>
      <Card padding={3} radius={2} tone="transparent" border>
        <Flex align="center" gap={3} wrap="wrap">
          <Box flex={1}>
            <Text size={1} muted>
              {titleOf(schemaType)}
            </Text>
          </Box>
          <Box className="section-type-switcher__select">
            <Select
              fontSize={1}
              padding={2}
              value=""
              aria-label="Change section type"
              onChange={(event) =>
                setTarget(choices.find((type) => type.name === event.currentTarget.value) || null)
              }
            >
              <option value="" disabled>
                Change type…
              </option>
              {choices.map((type) => (
                <option key={type.name} value={type.name}>
                  {titleOf(type)}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>
      </Card>

      {props.renderDefault(props)}

      {preview ? (
        <Dialog
          id="section-type-switcher"
          header={`Change to ${titleOf(target)}?`}
          onClose={close}
          width={1}
          footer={
            <Flex gap={2} justify="flex-end" padding={3}>
              <Button mode="bleed" text="Cancel" onClick={close} />
              <Button tone="primary" text={`Change to ${titleOf(target)}`} onClick={convert} />
            </Flex>
          }
        >
          <Stack gap={4} padding={4}>
            <Stack gap={2}>
              <Text size={1} weight="semibold">
                Moves across
              </Text>
              <Text size={1} muted>
                {moved.length ? moved.map(topTitle).join(', ') : 'Nothing; the new section starts empty.'}
              </Text>
            </Stack>
            {preview.dropped.length ? (
              <Card padding={3} radius={2} tone="caution" border>
                <Stack gap={2}>
                  <Text size={1} weight="semibold">
                    Will not carry across
                  </Text>
                  <Text size={1}>{preview.dropped.map(describe).join(', ')}</Text>
                </Stack>
              </Card>
            ) : null}
            <Text size={1} muted>
              Changed your mind afterwards? Use Undo in the document menu to get the old section back.
            </Text>
          </Stack>
        </Dialog>
      ) : null}
    </Stack>
  )
}
