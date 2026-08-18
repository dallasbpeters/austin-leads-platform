'use client'

import { SparklesIcon } from '@sanity/icons/Sparkles'
import { Box } from '@sanity/ui'
import { definePlugin } from 'sanity'

import { ImageGeneratorContent } from './image-generator'

/*
 * Local replacement for `sanity-plugin-gemini-ai-images`. That package is
 * pinned to `sanity ^3 || ^4` and `@sanity/ui ^2 || ^3` and has no Sanity 6
 * release, so the studio could not build against it.
 *
 * Only the surface this project actually used is reproduced: the "Generate
 * with AI" asset source on image fields, and the panel the AI Drafting tool
 * embeds directly. The upstream standalone "AI Image Studio" tool was already
 * switched off here, so it is not carried over.
 */

/**
 * Wraps the generator as an image asset source, so it appears alongside
 * Unsplash in the select-image dialog.
 *
 * @param {{ apiEndpoint: string, apiKey?: string }} options - Endpoint config.
 * @returns {(props: { onSelect: (assets: Array<object>) => void }) => JSX.Element} The asset source component.
 */
const createAssetSourceComponent = ({ apiEndpoint, apiKey }) =>
  function GeminiAssetSource({ onSelect }) {
    return (
      <Box padding={4}>
        <ImageGeneratorContent
          apiEndpoint={apiEndpoint}
          apiKey={apiKey}
          onImageGenerated={(asset) => onSelect([{ kind: 'assetDocumentId', value: asset._id }])}
        />
      </Box>
    )
  }

/**
 * Adds Gemini image generation to every image field in the studio.
 *
 * @param {{ apiEndpoint: string, apiKey?: string }} options - Endpoint config.
 * @returns {import('sanity').Plugin} The configured plugin.
 */
export const geminiImages = definePlugin(({ apiEndpoint, apiKey }) => ({
  form: {
    image: {
      assetSources: (previousAssetSources) => [
        ...previousAssetSources,
        {
          component: createAssetSourceComponent({ apiEndpoint, apiKey }),
          icon: SparklesIcon,
          name: 'gemini-images',
          title: 'Generate with AI',
        },
      ],
    },
  },
  name: 'gemini-images',
}))

export { ImageGeneratorContent }
