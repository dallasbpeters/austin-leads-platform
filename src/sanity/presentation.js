import { defineDocuments, defineLocations } from 'sanity/presentation'

const PAGE_TYPES = ['page', 'servicePage', 'locationPage', 'post']
const SINGLE_SLUG_PAGE_TYPES = ['page', 'locationPage', 'post']

const SINGLE_PAGE_ROUTES = [
  '/about',
  '/roofing',
  '/solar',
  '/hail-damage',
  '/services',
  '/guides',
  '/privacy-policy',
  '/terms',
  '/insurance-basics',
]

export const presentationDocuments = defineDocuments([
  {
    route: '/',
    filter: `_type in $types && pageType == "home"`,
    params: { types: PAGE_TYPES },
  },
  ...SINGLE_PAGE_ROUTES.map((route) => ({
    route,
    filter: `_type in $types && slug.current == $slug`,
    params: {
      types: SINGLE_SLUG_PAGE_TYPES,
      slug: route.slice(1),
    },
  })),
  {
    route: '/services/:serviceSlug',
    filter: `_type == "servicePage" && slug.current == ("services/" + $serviceSlug)`,
  },
  {
    route: '/guides/:guideSlug',
    filter: `_type in ["post", "page"] && slug.current == ("guides/" + $guideSlug)`,
  },
  {
    route: '/:slug',
    resolve: (params) => ({
      filter: `_type in ["page", "locationPage", "post"] && slug.current == $slug`,
      params: { slug: params.slug },
    }),
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
