import { agentContextPlugin } from '@sanity/agent-context/studio'
import { assist } from '@sanity/assist'
import { defineConfig } from 'sanity'
import { colorInput } from '@sanity/color-input'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { austinAssistFieldActions } from './src/sanity/assist/fieldActions'
import { studioStructure } from './src/sanity/studioStructure'

import {
  dataset,
  frontendOriginAllowlist,
  isSanityConfigured,
  localFrontendUrl,
  projectId,
  studioPreviewOrigin,
  studioUrl,
} from './src/sanity/env'
import { SiteSwitcherNavigator } from './src/sanity/components/SiteSwitcherNavigator'
import { guideImageSyncPlugin } from './src/sanity/plugins/guideImageSyncPlugin'
import { aiDraftingTool } from './src/sanity/tools/aiDraftingTool'
import { pageSpeedTool } from './src/sanity/tools/pageSpeedTool'
import { schemaTypes } from './src/sanity/schemaTypes'
import { presentationDocuments, presentationLocations } from './src/sanity/presentation'

const previewModeRoutes = {
  enable: '/api/draft-mode/enable',
  disable: '/api/draft-mode/disable',
}

const studioAppId = (process.env.SANITY_STUDIO_APP_ID || '').trim()

export default defineConfig({
  name: 'default',
  title: 'Austin Leads Studio',
  projectId: projectId || 'missing-project-id',
  dataset,
  basePath: studioUrl,
  ...(studioAppId ? { appId: studioAppId } : {}),
  plugins: [
    agentContextPlugin(),
    assist({ fieldActions: austinAssistFieldActions }),
    guideImageSyncPlugin(),
    colorInput(),
    structureTool({ structure: studioStructure }),
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
