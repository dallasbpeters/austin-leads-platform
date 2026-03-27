import { agentContextPlugin } from '@sanity/agent-context/studio'
import { defineConfig } from 'sanity'
import { colorInput } from '@sanity/color-input'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { geminiAIImages } from 'sanity-plugin-gemini-ai-images'

import {
  dataset,
  frontendOriginAllowlist,
  isSanityConfigured,
  localFrontendUrl,
  projectId,
  studioPreviewOrigin,
  studioUrl,
} from './src/sanity/env'
import { guideImageSyncPlugin } from './src/sanity/plugins/guideImageSyncPlugin'
import { aiDraftingTool } from './src/sanity/tools/aiDraftingTool'
import { pageSpeedTool } from './src/sanity/tools/pageSpeedTool'
import { schemaTypes } from './src/sanity/schemaTypes'
import { presentationDocuments, presentationLocations } from './src/sanity/presentation'

const previewModeRoutes = {
  enable: '/api/draft-mode/enable',
  disable: '/api/draft-mode/disable',
}

export default defineConfig({
  name: 'default',
  title: 'Austin Leads Studio',
  projectId: projectId || 'missing-project-id',
  dataset,
  basePath: studioUrl,
  plugins: [
    agentContextPlugin(),
    guideImageSyncPlugin(),
    colorInput(),
    geminiAIImages({
      apiEndpoint: `${studioPreviewOrigin}/api/gemini/generate-image`,
      enableStandaloneTool: true,
    }),
    structureTool(),
    presentationTool({
      previewUrl: {
        initial: studioPreviewOrigin,
        preview: '/',
        previewMode: previewModeRoutes,
        // Keep the legacy key alongside previewMode for hosted Studio compatibility.
        draftMode: previewModeRoutes,
      },
      resolve: {
        mainDocuments: presentationDocuments,
        locations: presentationLocations,
      },
      allowOrigins: [
        ...frontendOriginAllowlist,
        localFrontendUrl,
        'https://austin-leads-platform.vercel.app',
      ],
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  tools: (prev) => [...prev, aiDraftingTool(), pageSpeedTool()],
  studio: {
    components: {
      layout: (props) => props.renderDefault(props),
    },
  },
  form: {
    file: {
      assetSources: isSanityConfigured() ? undefined : [],
    },
  },
})
