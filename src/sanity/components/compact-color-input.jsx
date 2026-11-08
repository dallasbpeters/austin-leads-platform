import { ChevronDownIcon } from '@sanity/icons/ChevronDown'
import { ChevronUpIcon } from '@sanity/icons/ChevronUp'
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { useState } from 'react'
import { unset } from 'sanity'

/*
 * Every `color` field (sanity-plugin-color-input) starts closed: one row with
 * the current swatch and hex. "Change" opens the full picker below it; "Clear"
 * empties the field, so the page falls back to its default color.
 */

/** True for a `color` field, or a type built on `color`. */
export function isColorField(props) {
  for (let type = props.schemaType; type; type = type.type) {
    if (type.name === 'color' && type.jsonType === 'object') {
      return true
    }
  }
  return false
}

const swatchBackground = (value) =>
  value?.isGradient && value?.css ? value.css : value?.hex || 'transparent'

export const CompactColorInput = (props) => {
  const { value, onChange, readOnly } = props
  const [open, setOpen] = useState(false)
  const label = value?.hex
    ? value.isGradient && value.hex2
      ? `${value.hex.toUpperCase()} → ${value.hex2.toUpperCase()}`
      : value.hex.toUpperCase()
    : 'No color'

  return (
    <Stack gap={3}>
      <Card padding={2} radius={2} border>
        <Flex align="center" gap={3}>
          <span
            aria-hidden
            className={`compact-color__swatch${value?.hex ? '' : ' compact-color__swatch--empty'}`}
            style={{ '--compact-color-swatch': swatchBackground(value) }}
          />
          <Box flex={1}>
            <Text size={1} muted={!value?.hex} className="compact-color__value">
              {label}
            </Text>
          </Box>
          {value?.hex && !readOnly ? (
            <Button
              mode="bleed"
              tone="critical"
              fontSize={1}
              padding={2}
              text="Clear"
              onClick={() => {
                onChange(unset())
                setOpen(false)
              }}
            />
          ) : null}
          <Button
            mode="ghost"
            fontSize={1}
            padding={2}
            text={open ? 'Done' : 'Change'}
            iconRight={open ? ChevronUpIcon : ChevronDownIcon}
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
          />
        </Flex>
      </Card>
      {open ? props.renderDefault(props) : null}
    </Stack>
  )
}
