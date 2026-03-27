const DESK_SINGLETON_SCHEMA_TYPES = new Set(['aiContext'])

/** Sanity desk: singleton shortcuts + default type lists (singletons de-duplicated). */
export const studioStructure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('AI context')
        .child(S.document().schemaType('aiContext').documentId('aiContext').title('AI context')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !DESK_SINGLETON_SCHEMA_TYPES.has(item.getId())),
    ])
