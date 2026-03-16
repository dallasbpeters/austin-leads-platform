import { defineDocuments, defineLocations } from 'sanity/presentation'

const PAGE_DOCUMENT_FILTER = `_type in ["page", "servicePage", "locationPage", "post"]`
const INTERNAL_PATH_PREFIXES = ['api', '_next', 'studio']

function isIgnoredPresentationPath(pathParts) {
  if (!pathParts.length) {
    return false
  }

  return INTERNAL_PATH_PREFIXES.includes(pathParts[0])
}

function resolveFromAnyPath(params) {
  const rawPath = params?.path
  let pathParts = []

  if (Array.isArray(rawPath)) {
    pathParts = rawPath.filter(Boolean)
  } else if (typeof rawPath === 'string' && rawPath.length) {
    const normalizedPath = rawPath
      .replace(/^https?:\/\/[^/]+/i, '')
      .split('?')[0]
      .split('#')[0]
      .replace(/^\/+/, '')

    pathParts = normalizedPath.split('/').filter(Boolean)
  }

  if (isIgnoredPresentationPath(pathParts)) {
    return null
  }

  const isPreviewPath = pathParts[0] === 'preview'
  const slugParts = isPreviewPath ? pathParts.slice(2) : pathParts
  const slug = slugParts.join('/')

  if (!slug) {
    return {
      filter: `${PAGE_DOCUMENT_FILTER} && (pageType == "home" || slug.current == "/")`,
      params: {},
    }
  }

  return {
    filter: `${PAGE_DOCUMENT_FILTER} && slug.current == $slug`,
    params: { slug },
  }
}

export const presentationDocuments = defineDocuments([
  {
    route: '/',
    resolve: resolveFromAnyPath,
  },
  {
    route: '/:path*',
    resolve: resolveFromAnyPath,
  },
])

function hrefForDoc(doc) {
  if (!doc?.slug) return null
  if (doc.pageType === 'home' || doc.slug === '/') return '/'
  return doc.slug.startsWith('/') ? doc.slug : `/${doc.slug}`
}

export const presentationLocations = {
  page: defineLocations({
    select: { title: 'title', slug: 'slug.current', pageType: 'pageType' },
    resolve: (doc) => {
      const href = hrefForDoc(doc)
      if (!href) return null
      return {
        locations: [{ title: doc.title || 'Untitled page', href }],
      }
    },
  }),
  servicePage: defineLocations({
    select: { title: 'title', slug: 'slug.current', pageType: 'pageType' },
    resolve: (doc) => {
      const href = hrefForDoc(doc)
      if (!href) return null
      return {
        locations: [
          { title: doc.title || 'Untitled service page', href },
          { title: 'Services', href: '/services' },
        ],
      }
    },
  }),
  locationPage: defineLocations({
    select: { title: 'title', slug: 'slug.current', pageType: 'pageType' },
    resolve: (doc) => {
      const href = hrefForDoc(doc)
      if (!href) return null
      return {
        locations: [{ title: doc.title || 'Untitled location page', href }],
      }
    },
  }),
  post: defineLocations({
    select: { title: 'title', slug: 'slug.current', pageType: 'pageType' },
    resolve: (doc) => {
      const href = hrefForDoc(doc)
      if (!href) return null
      return {
        locations: [
          { title: doc.title || 'Untitled post', href },
          { title: 'Guides', href: '/guides' },
        ],
      }
    },
  }),
}
