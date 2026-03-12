import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { presentationTool } from 'sanity/presentation'

import {
  canonicalStudioUrl,
  dataset,
  frontendUrl,
  frontendOriginAllowlist,
  isSanityConfigured,
  localFrontendUrl,
  projectId,
  studioUrl,
} from './src/sanity/env'
import { schemaTypes } from './src/sanity/schemaTypes'

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
    deskTool(),
    presentationTool({
      previewUrl: {
        initial: frontendUrl,
        previewMode: previewModeRoutes,
        // Keep the legacy key alongside previewMode for hosted Studio compatibility.
        draftMode: previewModeRoutes,
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
