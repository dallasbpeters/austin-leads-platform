'use client'

import { useCallback, useState } from 'react'

import { SparklesIcon } from '@sanity/icons/Sparkles'
import { Button, Card, Flex, Select, Spinner, Stack, Text, TextArea } from '@sanity/ui'
import { useClient } from 'sanity'

/*
 * Studio-side image generation, replacing `sanity-plugin-gemini-ai-images`
 * which has no Sanity 6 release. Written against @sanity/ui 4, where the
 * toast/tooltip/popover/code/menu helpers moved to subpath exports -- importing
 * them from the package root is what breaks the original plugin.
 */

const ASPECT_RATIOS = ['1:1', '16:9', '4:3', '3:4', '9:16']
const SANITY_API_VERSION = '2024-08-01'

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
 * @param {string} prompt - The prompt used to generate the image.
 * @returns {string} A slug-like filename without extension.
 */
const toFilename = (prompt) =>
  prompt
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 60) || 'generated-image'

/**
 * Prompt-to-image panel. Generates via the project's own API route, uploads
 * the result to Sanity, and hands the stored asset back to the caller.
 *
 * @param {{ apiEndpoint: string, apiKey?: string, onImageGenerated: (asset: object) => void }} props - Endpoint config and result handler.
 * @returns {JSX.Element} The generator panel.
 */
export function ImageGeneratorContent({ apiEndpoint, apiKey, onImageGenerated }) {
  const client = useClient({ apiVersion: SANITY_API_VERSION })
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[1])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const generate = useCallback(async () => {
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt || isGenerating) {
      return
    }

    setError('')
    setIsGenerating(true)

    try {
      const response = await fetch(apiEndpoint, {
        body: JSON.stringify({ aspectRatio, prompt: trimmedPrompt }),
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        },
        method: 'POST',
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || `Generation failed (${response.status})`)
      }

      /* Upload before handing back: callers expect a stored Sanity asset with
       * a permanent URL, not a data URI that vanishes on reload. */
      const asset = await client.assets.upload('image', toBlob(payload.imageData, payload.mimeType), {
        filename: `${toFilename(trimmedPrompt)}.png`,
      })

      onImageGenerated(asset)
    } catch (generationError) {
      setError(generationError?.message || 'Image generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [apiEndpoint, apiKey, aspectRatio, client, isGenerating, onImageGenerated, prompt])

  return (
    <Stack space={3}>
      <Stack space={2}>
        <Text size={1} weight="medium">
          Prompt
        </Text>
        <TextArea
          onChange={(event) => setPrompt(event.currentTarget.value)}
          placeholder="Describe the image you want"
          rows={4}
          value={prompt}
        />
      </Stack>

      <Flex align="flex-end" gap={2}>
        <Stack flex={1} space={2}>
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
        <Button
          disabled={isGenerating || prompt.trim().length === 0}
          icon={isGenerating ? Spinner : SparklesIcon}
          onClick={generate}
          text={isGenerating ? 'Generating…' : 'Generate'}
          tone="primary"
        />
      </Flex>

      {error ? (
        <Card padding={3} radius={2} shadow={1} tone="critical">
          <Text size={1}>{error}</Text>
        </Card>
      ) : null}
    </Stack>
  )
}
