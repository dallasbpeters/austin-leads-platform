import { deskTool } from "sanity/desk";
import { defineConfig } from "sanity";

import { dataset, isSanityConfigured, projectId, studioUrl } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Austin Leads Studio",
  projectId: projectId || "missing-project-id",
  dataset,
  basePath: studioUrl,
  plugins: [deskTool()],
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
});
