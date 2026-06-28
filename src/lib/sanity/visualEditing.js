import { createDataAttribute } from 'next-sanity'

import { canonicalStudioUrl, dataset, projectId } from '@/sanity/env'

function escapePathSegment(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

export function getSanityEditAttributes({ documentId, documentType, path }) {
  if (!documentId || !documentType || !path) {
    return {}
  }

  return {
    'data-sanity': String(
      createDataAttribute({
        baseUrl: canonicalStudioUrl,
        dataset,
        id: documentId,
        path,
        projectId,
        type: documentType,
      }),
    ),
  }
}

export function getSanityPageEditAttributes(page, path = 'title') {
  return getSanityEditAttributes({
    documentId: page?.id,
    documentType: page?._type,
    path,
  })
}

export function getSanitySectionEditAttributes(page, section, fallbackPath = 'sections') {
  if (section?._key) {
    return getSanityPageEditAttributes(page, `sections[_key=="${escapePathSegment(section._key)}"]`)
  }

  return getSanityPageEditAttributes(page, fallbackPath)
}
