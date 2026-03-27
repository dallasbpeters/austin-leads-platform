import { defineCliConfig } from 'sanity/cli'

import { dataset, projectId } from './src/sanity/env'

export default defineCliConfig({
  api: {
    projectId: projectId || 'missing-project-id',
    dataset,
  },
  deployment: {
    appId: 'jncwj3gejnhx6pspao78c6wp',
  },
})
