import './src/sanity/studioPatches.css'
import { agentContextPlugin } from '@sanity/agent-context/studio'
import { assist } from '@sanity/assist'
import { colorInput } from '@sanity/color-input'
import { defineConfig } from 'sanity'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { geminiAIImages } from 'sanity-plugin-gemini-ai-images'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'

import { austinAssistFieldActions } from './src/sanity/assist/fieldActions'
import { SiteSwitcherNavigator } from './src/sanity/components/site-switcher-navigator'
import {
  dataset,
  frontendOriginAllowlist,
  geminiImageApiEndpoint,
  geminiPluginApiKey,
  isSanityConfigured,
  localFrontendUrl,
  projectId,
  studioDeploymentAppId,
  studioPreviewOrigin,
  studioUrl,
} from './src/sanity/env'
import { guideImageSyncPlugin } from './src/sanity/plugins/guideImageSyncPlugin'
import { presentationDocuments, presentationLocations } from './src/sanity/presentation'
import { schemaTypes } from './src/sanity/schemaTypes'
import { studioStructure } from './src/sanity/studioStructure'
import { aiDraftingTool } from './src/sanity/tools/aiDraftingTool'
import { pageSpeedTool } from './src/sanity/tools/pageSpeedTool'

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
  ...(studioDeploymentAppId ? { appId: studioDeploymentAppId } : {}),
  // Content Releases is Enterprise-only and defaults on in recent Studio; UI can try to
  // encode `{ tool, structure }` routes and crash with "Unable to find matching route for state".
  releases: { enabled: false },
  plugins: [
    agentContextPlugin(),
    assist({ fieldActions: austinAssistFieldActions }),
    guideImageSyncPlugin(),
    colorInput(),
    structureTool({ structure: studioStructure }),
    unsplashImageAsset(),
    // Adds "Generate with AI" alongside Unsplash on every image field. The standalone
    // "AI Image Studio" tool stays off — the AI Drafting tool already embeds the suite.
    geminiAIImages({
      apiEndpoint: geminiImageApiEndpoint,
      apiKey: geminiPluginApiKey,
    }),
    presentationTool({
      previewUrl: {
        initial: studioPreviewOrigin,
        previewMode: previewModeRoutes,
      },
      resolve: {
        mainDocuments: presentationDocuments,
        locations: presentationLocations,
      },
      components: {
        unstable_navigator: {
          component: SiteSwitcherNavigator,
          minWidth: 200,
          maxWidth: 280,
        },
      },
      // All tenant previews are served through studioPreviewOrigin via ?__site=<slug>,
      // so only the primary origin and localhost need to be listed here.
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
