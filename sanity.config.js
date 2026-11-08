import { vercelDeploy } from '@overpunch/deploy-vercel-from-sanity'
import { assist } from '@sanity/assist'
import { RocketIcon } from '@sanity/icons/Rocket'
import { createElement } from 'react'
import { defineConfig } from 'sanity'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { customColorPicker } from 'sanity-plugin-color-input'
import { instagramEmbed } from 'sanity-plugin-sgntech-instagram-embed'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import './src/sanity/studioPatches.css'

import { austinAssistFieldActions } from './src/sanity/assist/fieldActions'
import { isLinkField, PageLinkInput } from './src/sanity/components/page-link-input'
import { PreflightView } from './src/sanity/components/preflight-view'
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
  toolApiOrigin,
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

const PREFLIGHT_TYPES = new Set(['page', 'servicePage', 'locationPage', 'post', 'caseStudy'])

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
    // Adds the "Instagram post" block; it is allowed in the rich text field (portableTextSimple).
    instagramEmbed({ captionedByDefault: false, showEmbedPreview: true }),
    /* Deploy tab: start and watch Vercel deploys. Proxy mode, because the dataset is public:
     * the Vercel token and deploy hooks stay on the server (src/app/api/vercel-deploy),
     * and the Studio only holds the status key (public by design; it can read and cancel). */
    vercelDeploy({
      title: 'Deploy',
      name: 'vercel-deploy',
      mode: 'proxy',
      proxyUrl: `${toolApiOrigin}/api/vercel-deploy`,
      statusKey: process.env.SANITY_STUDIO_DEPLOY_STATUS_KEY,
    }),
    assist({ fieldActions: austinAssistFieldActions }),
    guideImageSyncPlugin(),
    /* The `color` field type (replaces @sanity/color-input). Swatches are the brand colors;
     * colors still save a `hex`, which is what the site reads (resolveSanityColorValue). */
    customColorPicker({
      colors: [
        '#de1017', // Texas Flag Red
        '#ea580c', // Sunset Orange
        '#ffd06b', // Golden Sun
        '#00bb7f', // Savings Green
        '#082f43', // Deep Sky
        '#040a17', // Night Sky
        '#0f172a', // Midnight Slate
        '#62748e', // Steel Muted
        '#f9f7f4', // Warm Paper
        '#f8fafc', // Cool Mist
        '#ffffff',
        '#000000',
      ],
    }),
    structureTool({
      structure: studioStructure,
      // A "Preflight" view beside the editor on page-like documents (links, SEO, brand voice).
      defaultDocumentNode: (S, { schemaType }) =>
        PREFLIGHT_TYPES.has(schemaType)
          ? S.document().views([
              S.view.form(),
              S.view.component(PreflightView).title('Preflight').icon(RocketIcon).id('preflight'),
            ])
          : S.document(),
    }),
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
  // The Deploy plugin adds its tool first, which would make Studio open on it; keep it last.
  tools: (prev) => [
    ...prev.filter((tool) => tool.name !== 'vercel-deploy'),
    contextChatTool(),
    aiDraftingTool(),
    pageSpeedTool(),
    videoTool(),
    ...prev.filter((tool) => tool.name === 'vercel-deploy'),
  ],
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
