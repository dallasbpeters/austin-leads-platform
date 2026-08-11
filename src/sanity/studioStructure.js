const DESK_SINGLETON_SCHEMA_TYPES = new Set(['aiContext'])

const SITE_SETTINGS_ITEMS = [
  {
    title: 'Texas Solar & Roofing Pros',
    slug: 'texas-solar-and-roofing-pros',
  },
  {
    title: 'Texas Christmas Lights',
    slug: 'txchristmaslights',
  },
]

const buildSiteCaseStudiesItem = (S, site) =>
  S.listItem()
    .title(site.title)
    .child(
      S.documentList()
        .title(`${site.title} Case Studies`)
        .filter('_type == "caseStudy" && site->slug.current == $siteSlug')
        .params({ siteSlug: site.slug })
        .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
    )

const buildSiteSettingsItem = (S, site) =>
  S.listItem()
    .title(site.title)
    .schemaType('site')
    .child(
      S.documentTypeList('site')
        .title(site.title)
        .filter('_type == "site" && slug.current == $siteSlug')
        .params({ siteSlug: site.slug }),
    )

const buildSitePagesItem = (S, site) =>
  S.listItem()
    .title(site.title)
    .child(
      S.documentList()
        .title(`${site.title} Pages`)
        .filter('_type in ["page", "servicePage", "locationPage"] && site->slug.current == $siteSlug')
        .params({ siteSlug: site.slug })
        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }]),
    )

const buildSitePostsItem = (S, site) =>
  S.listItem()
    .title(site.title)
    .child(
      S.documentList()
        .title(`${site.title} Posts`)
        .filter('_type == "post" && site->slug.current == $siteSlug')
        .params({ siteSlug: site.slug })
        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }]),
    )

/** Sanity desk: singleton shortcuts + default type lists (singletons de-duplicated). */
export const studioStructure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('AI context')
        .child(S.document().schemaType('aiContext').documentId('aiContext').title('AI context')),
      S.listItem()
        .title('Site settings')
        .child(
          S.list()
            .title('Site settings')
            .items(SITE_SETTINGS_ITEMS.map((site) => buildSiteSettingsItem(S, site))),
        ),
      S.listItem()
        .title('Pages')
        .child(
          S.list()
            .title('Pages')
            .items(SITE_SETTINGS_ITEMS.map((site) => buildSitePagesItem(S, site))),
        ),
      S.listItem()
        .title('Case studies')
        .child(
          S.list()
            .title('Case Studies')
            .items(SITE_SETTINGS_ITEMS.map((site) => buildSiteCaseStudiesItem(S, site))),
        ),

      S.listItem()
        .title('Posts')
        .child(
          S.list()
            .title('Posts')
            .items(SITE_SETTINGS_ITEMS.map((site) => buildSitePostsItem(S, site))),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !DESK_SINGLETON_SCHEMA_TYPES.has(item.getId())),
    ])
