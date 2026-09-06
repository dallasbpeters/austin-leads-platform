'use client'
/* oxlint-disable next/no-img-element -- previews are data URIs and blob URLs inside the Studio */

import { useCallback, useMemo, useRef, useState } from 'react'

import { SparklesIcon } from '@sanity/icons/Sparkles'
import { Button, Card, Flex, Grid, Select, Spinner, Stack, Text, TextArea, TextInput } from '@sanity/ui'
import { useClient } from 'sanity'

/*
 * Studio-side image generation, replacing `sanity-plugin-gemini-ai-images`
 * which has no Sanity 6 release. Talks to the project's own route, which kept
 * the package's request shape: a single image, or a `series` of variations,
 * optionally guided by a reference image (`mode: 'edit'` + `baseImage`).
 *
 * Nothing is uploaded until the editor picks a result. That is the undo: close
 * the panel or generate again and no asset was ever created.
 */

const ASPECT_RATIOS = ['1:1', '16:9', '4:3', '3:4', '9:16']
const SANITY_API_VERSION = '2024-08-01'
const SERIES_SIZES = [2, 3, 4, 6]
const DEFAULT_VARIATIONS = [
  'wide establishing shot',
  'close-up on the main detail',
  'late afternoon golden light',
  'soft overcast daylight',
  'low angle from ground level',
  'high angle looking down',
]
const DEFAULT_CONSISTENCY = 'Same subject, same style, same color palette across every image.'

/**
 * Turns the base64 payload the route returns into a file the Sanity asset
 * pipeline will accept.
 *
 * @param {string} imageData - Base64-encoded image bytes.
 * @param {string} mimeType - The image's MIME type.
 * @returns {Blob} A blob ready to upload.
 */
const toBlob = (imageData, mimeType) => {
  const binary = atob(imageData)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.codePointAt(index)
  }

  return new Blob([bytes], { type: mimeType })
}

/**
 * Derives a readable filename from the prompt so generated assets are findable
 * in the media library later.
 *
 * @param {string} text - The prompt (and variation) used to generate the image.
 * @returns {string} A slug-like filename without extension.
 */
const toFilename = (text) =>
  text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 60) || 'generated-image'

/**
 * Reads a picked file and re-encodes it as PNG, because the route sends the
 * reference to Gemini tagged as image/png regardless of the original format.
 *
 * @param {File} file - The file the editor picked.
 * @returns {Promise<{ data: string, previewUrl: string, name: string }>} Base64 PNG bytes and a preview URL.
 */
const fileToPngReference = async (file) => {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d').drawImage(bitmap, 0, 0)
  bitmap.close()

  return {
    data: canvas.toDataURL('image/png').split(',')[1],
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  }
}

const toDataUri = (result) => `data:${result.mimeType};base64,${result.imageData}`

/**
 * Optional reference image: a file the editor picks, or a previous result.
 *
 * @param {{ reference: { previewUrl: string, name: string } | null, onPick: (event: Event) => void, onClear: () => void }} props - Current reference and handlers.
 * @returns {JSX.Element} The reference row.
 */
function ReferencePicker({ reference, onPick, onClear }) {
  const fileInputRef = useRef(null)

  return (
    <Stack space={2}>
      <Text size={1} weight="medium">
        Reference image (optional)
      </Text>
      <Flex align="center" gap={3}>
        {reference ? (
          <img
            alt=""
            src={reference.previewUrl}
            style={{ borderRadius: 6, height: 56, objectFit: 'cover', width: 56 }}
          />
        ) : null}
        <Text muted size={1} style={{ flex: 1 }}>
          {reference
            ? reference.name
            : 'Gemini keeps the same subject and changes only what the prompt asks.'}
        </Text>
        <input accept="image/*" hidden onChange={onPick} ref={fileInputRef} type="file" />
        <Button
          mode="ghost"
          onClick={() => fileInputRef.current?.click()}
          text={reference ? 'Replace' : 'Add reference'}
        />
        {reference ? <Button mode="bleed" onClick={onClear} text="Remove" tone="critical" /> : null}
      </Flex>
    </Stack>
  )
}

/**
 * Review step: every generated image, one selectable, with the upload action.
 *
 * @param {object} props - Results, selection state and handlers.
 * @returns {JSX.Element} The results grid.
 */
function ResultGrid({
  results,
  selectedIndex,
  aspectRatio,
  isSaving,
  onSelect,
  onUse,
  onUseAsReference,
  onDiscard,
}) {
  return (
    <Stack space={3}>
      <Text size={1} weight="medium">
        {results.length === 1 ? 'Result' : 'Pick one'}
      </Text>
      <Grid columns={results.length === 1 ? 1 : [1, 2, 3]} gap={3}>
        {results.map((result, index) => {
          const selected = index === selectedIndex
          return (
            <Card
              key={`${result.index}-${index}`}
              onClick={() => onSelect(index)}
              padding={1}
              radius={2}
              shadow={selected ? 2 : 1}
              style={{
                cursor: 'pointer',
                outline: selected ? '2px solid var(--card-focus-ring-color)' : 'none',
              }}
              tone={selected ? 'primary' : 'default'}
            >
              <Stack space={2}>
                <img
                  alt={result.variation || 'Generated image'}
                  src={toDataUri(result)}
                  style={{
                    borderRadius: 4,
                    display: 'block',
                    maxHeight: 260,
                    objectFit: 'contain',
                    width: '100%',
                  }}
                />
                <Flex align="center" gap={2} justify="space-between" paddingBottom={1} paddingX={1}>
                  <Text muted size={1}>
                    {result.variation || aspectRatio}
                  </Text>
                  <Button
                    fontSize={1}
                    mode="bleed"
                    onClick={(event) => {
                      event.stopPropagation()
                      onUseAsReference(result)
                    }}
                    padding={2}
                    text="Use as reference"
                  />
                </Flex>
              </Stack>
            </Card>
          )
        })}
      </Grid>
      <Flex gap={2} justify="flex-end">
        <Button mode="ghost" onClick={onDiscard} text="Discard" />
        <Button
          disabled={selectedIndex < 0 || isSaving}
          icon={isSaving ? Spinner : undefined}
          onClick={onUse}
          text={isSaving ? 'Saving…' : 'Use this image'}
          tone="positive"
        />
      </Flex>
    </Stack>
  )
}

/**
 * Prompt-to-image panel. Generates one image or a series via the project's own
 * API route, shows the results for review, and only uploads the one the editor
 * picks. The stored asset is handed back to the caller.
 *
 * @param {{ apiEndpoint: string, apiKey?: string, onImageGenerated: (asset: object) => void }} props - Endpoint config and result handler.
 * @returns {JSX.Element} The generator panel.
 */
export function ImageGeneratorContent({ apiEndpoint, apiKey, onImageGenerated }) {
  const client = useClient({ apiVersion: SANITY_API_VERSION })
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[1])
  const [seriesSize, setSeriesSize] = useState(1)
  const [consistencyPrompt, setConsistencyPrompt] = useState(DEFAULT_CONSISTENCY)
  const [variationsText, setVariationsText] = useState(DEFAULT_VARIATIONS.join('\n'))
  const [reference, setReference] = useState(null)
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')

  const isSeries = seriesSize > 1
  const variations = useMemo(
    () =>
      variationsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    [variationsText],
  )
  const canGenerate =
    prompt.trim().length > 0 && !isGenerating && !isSaving && (!isSeries || variations.length > 0)

  const pickReference = useCallback(async (event) => {
    const file = event.currentTarget.files?.[0]
    if (!file) {
      return
    }
    try {
      setReference(await fileToPngReference(file))
      setError('')
    } catch (readError) {
      setError(readError.message)
    }
  }, [])

  const useResultAsReference = useCallback((result) => {
    setReference({
      data: result.imageData,
      name: result.variation || 'generated image',
      previewUrl: toDataUri(result),
    })
  }, [])

  const generate = useCallback(async () => {
    if (!canGenerate) {
      return
    }

    setError('')
    setWarning('')
    setIsGenerating(true)

    const body = {
      aspectRatio,
      prompt: prompt.trim(),
      ...(reference ? { baseImage: reference.data, mode: 'edit' } : {}),
      ...(isSeries
        ? { series: { consistencyPrompt, quantity: seriesSize, variations: variations.slice(0, seriesSize) } }
        : {}),
    }

    try {
      const response = await fetch(apiEndpoint, {
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        },
        method: 'POST',
      })
      const payload = await response.json()

      if (!response.ok && response.status !== 207) {
        throw new Error(payload?.error || `Generation failed (${response.status})`)
      }

      const nextResults = payload.images ?? [{ ...payload, index: 0 }]
      setResults(nextResults)
      setSelectedIndex(nextResults.length === 1 ? 0 : -1)
      if (payload.warning) {
        setWarning(`${payload.warning}: ${payload.metadata?.failed ?? 0} of ${seriesSize} did not come back.`)
      }
    } catch (generationError) {
      setError(generationError?.message || 'Image generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [
    apiEndpoint,
    apiKey,
    aspectRatio,
    canGenerate,
    consistencyPrompt,
    isSeries,
    prompt,
    reference,
    seriesSize,
    variations,
  ])

  const useSelected = useCallback(async () => {
    const result = results[selectedIndex]
    if (!result || isSaving) {
      return
    }

    setIsSaving(true)
    setError('')

    try {
      /* Upload only now: callers expect a stored Sanity asset with a permanent
       * URL, and nothing should land in the media library until it is chosen. */
      const asset = await client.assets.upload('image', toBlob(result.imageData, result.mimeType), {
        filename: `${toFilename([prompt, result.variation].filter(Boolean).join(' '))}.png`,
      })
      onImageGenerated(asset)
    } catch (uploadError) {
      setError(uploadError?.message || 'Upload failed')
    } finally {
      setIsSaving(false)
    }
  }, [client, isSaving, onImageGenerated, prompt, results, selectedIndex])

  return (
    <Stack space={4}>
      <Stack space={2}>
        <Text size={1} weight="medium">
          Prompt
        </Text>
        <TextArea
          onChange={(event) => setPrompt(event.currentTarget.value)}
          placeholder="Describe the image you want"
          rows={3}
          value={prompt}
        />
      </Stack>

      <Grid columns={[1, 2]} gap={3}>
        <Stack space={2}>
          <Text size={1} weight="medium">
            Aspect ratio
          </Text>
          <Select onChange={(event) => setAspectRatio(event.currentTarget.value)} value={aspectRatio}>
            {ASPECT_RATIOS.map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio}
              </option>
            ))}
          </Select>
        </Stack>
        <Stack space={2}>
          <Text size={1} weight="medium">
            How many
          </Text>
          <Select onChange={(event) => setSeriesSize(Number(event.currentTarget.value))} value={seriesSize}>
            <option value={1}>One image</option>
            {SERIES_SIZES.map((size) => (
              <option key={size} value={size}>
                Series of {size}
              </option>
            ))}
          </Select>
        </Stack>
      </Grid>

      {isSeries ? (
        <Grid columns={[1, 2]} gap={3}>
          <Stack space={2}>
            <Text size={1} weight="medium">
              Keep the same
            </Text>
            <TextInput
              onChange={(event) => setConsistencyPrompt(event.currentTarget.value)}
              placeholder="What must stay identical across the set"
              value={consistencyPrompt}
            />
          </Stack>
          <Stack space={2}>
            <Text size={1} weight="medium">
              Change one per image (first {seriesSize} lines)
            </Text>
            <TextArea
              onChange={(event) => setVariationsText(event.currentTarget.value)}
              rows={Math.max(3, seriesSize)}
              value={variationsText}
            />
          </Stack>
        </Grid>
      ) : null}

      <ReferencePicker onClear={() => setReference(null)} onPick={pickReference} reference={reference} />

      <Flex gap={2} justify="flex-end">
        <Button
          disabled={!canGenerate}
          icon={isGenerating ? Spinner : SparklesIcon}
          onClick={generate}
          text={
            isGenerating
              ? isSeries
                ? `Generating ${seriesSize}…`
                : 'Generating…'
              : results.length
                ? 'Generate again'
                : 'Generate'
          }
          tone="primary"
        />
      </Flex>

      {results.length ? (
        <ResultGrid
          aspectRatio={aspectRatio}
          isSaving={isSaving}
          onDiscard={() => {
            setResults([])
            setSelectedIndex(-1)
          }}
          onSelect={setSelectedIndex}
          onUse={useSelected}
          onUseAsReference={useResultAsReference}
          results={results}
          selectedIndex={selectedIndex}
        />
      ) : null}

      {warning ? (
        <Card padding={3} radius={2} shadow={1} tone="caution">
          <Text size={1}>{warning}</Text>
        </Card>
      ) : null}

      {error ? (
        <Card padding={3} radius={2} shadow={1} tone="critical">
          <Text size={1}>{error}</Text>
        </Card>
      ) : null}
    </Stack>
  )
}
