import { assist } from '@sanity/assist'
import { colorInput } from '@sanity/color-input'
import { contextPlugin } from '@sanity/context/studio'
import { createElement } from 'react'
import { defineConfig } from 'sanity'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { instagramEmbed } from 'sanity-plugin-sgntech-instagram-embed'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import './src/sanity/studioPatches.css'

import { austinAssistFieldActions } from './src/sanity/assist/fieldActions'
import { isLinkField, PageLinkInput } from './src/sanity/components/page-link-input'
import { removeBackgroundAssetSource } from './src/sanity/components/remove-background-source'
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
import { geminiImages } from './src/sanity/plugins/gemini-images'
import { guideImageSyncPlugin } from './src/sanity/plugins/guideImageSyncPlugin'
import { presentationDocuments, presentationLocations } from './src/sanity/presentation'
import { schemaTypes } from './src/sanity/schemaTypes'
import { studioStructure } from './src/sanity/studioStructure'
import { aiDraftingTool } from './src/sanity/tools/aiDraftingTool'
import { contextChatTool } from './src/sanity/tools/contextChatTool'
import { pageSpeedTool } from './src/sanity/tools/pageSpeedTool'
import { videoTool } from './src/sanity/tools/videoTool'

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
    /* Renamed in @sanity/context v2. The plugin itself is deprecated: endpoint
     * config and Insights now live in the Context app (Sanity Dashboard ->
     * Apps -> Sanity Labs). Kept registered because the dataset still holds a
     * `sanity.agentContext` document; drop it once that is migrated. The
     * "Agent Insights" tab is off: it only showed a notice that Insights moved. */
    contextPlugin({ insights: { enabled: false } }),
    // Adds the "Instagram post" block; it is allowed in the rich text field (portableTextSimple).
    instagramEmbed({ captionedByDefault: false, showEmbedPreview: true }),
    assist({ fieldActions: austinAssistFieldActions }),
    guideImageSyncPlugin(),
    colorInput(),
    structureTool({ structure: studioStructure }),
    unsplashImageAsset(),
    // Adds "Generate with AI" alongside Unsplash on every image field. The standalone
    // "AI Image Studio" tool stays off — the AI Drafting tool already embeds the suite.
    geminiImages({
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
    // Lets the Presentation navigator create a case study with its `site` already
    // set. `site` is required, and a case study without one is invisible on every
    // page — the same trap that hid reviews.
    templates: (prev) => [
      ...prev,
      {
        id: 'caseStudy-by-site',
        title: 'Case study for a site',
        schemaType: 'caseStudy',
        parameters: [{ name: 'siteId', type: 'string' }],
        value: ({ siteId } = {}) => ({
          ...(siteId ? { site: { _type: 'reference', _ref: siteId } } : {}),
          publishedAt: new Date().toISOString(),
        }),
      },
    ],
  },
  tools: (prev) => [...prev, contextChatTool(), aiDraftingTool(), pageSpeedTool(), videoTool()],
  studio: {
    components: {
      layout: (props) => props.renderDefault(props),
    },
  },
  form: {
    // Every link field (`href`, `ctaHref`, …) gets a page picker under its text box.
    components: {
      input: (props) =>
        isLinkField(props) ? createElement(PageLinkInput, props) : props.renderDefault(props),
    },
    file: {
      assetSources: isSanityConfigured() ? undefined : [],
    },
    // "Remove background" joins Upload, Unsplash, etc. in every image field's Select menu.
    image: {
      assetSources: (prev) => (isSanityConfigured() ? [...prev, removeBackgroundAssetSource] : prev),
    },
  },
})
