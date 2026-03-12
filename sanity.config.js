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
        previewMode: {
          enable: `${frontendUrl}/api/draft-mode/enable`,
          disable: `${frontendUrl}/api/draft-mode/disable`,
        },
        // Keep the legacy key alongside previewMode for hosted Studio compatibility.
        draftMode: {
          enable: `${frontendUrl}/api/draft-mode/enable`,
          disable: `${frontendUrl}/api/draft-mode/disable`,
        },
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
