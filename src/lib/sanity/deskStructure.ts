// deskStructure.ts
import { Preflight, DeadLinks } from '@planetary/sanity-plugin-preflight'
import { RocketIcon } from '@sanity/icons'

export const getDefaultDocumentNode = (S, { schemaType }) => {
  // Only show the Preflight plugin on selected document types
  if (['article', 'page', 'post', 'servicePage', 'locationPage'].includes(schemaType)) {
    return S.document().views([
      // Include the default content editor
      S.view.form(),

      // Add Preflight plugin
      S.view
        .component(
          Preflight({
            plugins: [DeadLinks()],
          }),
        )
        .title('Preflight')
        .icon(RocketIcon),
    ])
  }

  // Otherwise render the default content editor
  return S.document().views([S.view.form()])
}
