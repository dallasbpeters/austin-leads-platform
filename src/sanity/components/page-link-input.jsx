'use client'

import { Box, Card, Flex, Stack, Text } from '@sanity/ui'
import { Autocomplete } from '@sanity/ui/autocomplete'
import { useEffect, useMemo, useState } from 'react'
import { set, useClient, useFormValue } from 'sanity'

/*
 * Link fields stay plain strings (so outside URLs, tel: links and #anchors
 * still work), with a page picker under the text box. Picking a page writes
 * its path, so nobody has to remember a slug.
 */

// Same documents the Presentation tool treats as pages, plus case studies. Drafts
// are included so a page can be linked before it is published. The site's menu
// comes along too: its labels become extra search words for the pages they point
// at, so "See if solar is right for you" finds the page titled "Austin Solar Cost Guide".
const PICKER_QUERY = `{
  "pages": *[
    _type in ["page", "servicePage", "locationPage", "post", "caseStudy"]
    && defined(slug.current)
    && (!defined($siteId) || site._ref == $siteId)
  ]{
    _id,
    _type,
    title,
    pageType,
    "slug": slug.current
  } | order(title asc),
  "nav": *[_type == "site" && _id == $siteId][0].navigation[]{
    label,
    href,
    "children": children[]{ label, href }
  }
}`

/* Routes built in code rather than as Sanity pages, so no document lists them. */
const BUILT_IN_ROUTES = [
  { value: '/projects', title: 'Projects' },
  { value: '/guides', title: 'Guides' },
  { value: '/services', title: 'Services' },
  { value: '/about', title: 'About' },
  { value: '/book', title: 'Book a service' },
  { value: '/service-request', title: 'Service request' },
  { value: '/hail-damage', title: 'Hail damage' },
  { value: '/roofing', title: 'Roofing' },
  { value: '/solar', title: 'Solar' },
  { value: '#consultation', title: 'Free estimate form (on the same page)' },
]

const TYPE_LABELS = {
  caseStudy: 'Project',
  locationPage: 'Location',
  page: 'Page',
  post: 'Guide',
  servicePage: 'Service',
}

/** Mirrors hrefForDoc in presentation.js, plus the /projects route for case studies. */
function pathForDoc(doc) {
  if (doc.pageType === 'home' || doc.slug === '/') {
    return '/'
  }
  if (doc._type === 'caseStudy') {
    return `/projects/${doc.slug}`
  }
  return doc.slug.startsWith('/') ? doc.slug : `/${doc.slug}`
}

/** The tenant this document belongs to: its own id on a site document, else its `site` reference. */
function useSiteId() {
  const type = useFormValue(['_type'])
  const id = useFormValue(['_id'])
  const site = useFormValue(['site'])

  if (type === 'site') {
    return typeof id === 'string' ? id.replace(/^drafts\./u, '') : null
  }
  return site?._ref || null
}

export function PageLinkInput(props) {
  const { onChange, value, id } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const siteId = useSiteId()
  const [data, setData] = useState({ pages: [], nav: [] })

  useEffect(() => {
    let cancelled = false
    client
      .fetch(PICKER_QUERY, { siteId })
      .then((result) => {
        if (!cancelled) {
          setData({ pages: result?.pages || [], nav: result?.nav || [] })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData({ pages: [], nav: [] })
        }
      })
    return () => {
      cancelled = true
    }
  }, [client, siteId])

  const options = useMemo(() => {
    // Menu labels by path, so a page can be found by what the menu calls it.
    const aliases = new Map()
    for (const item of data.nav) {
      for (const link of [item, ...(item?.children || [])]) {
        if (link?.href && link?.label) {
          aliases.set(link.href, [...(aliases.get(link.href) || []), link.label])
        }
      }
    }

    // A published page and its draft share a path; the published one wins.
    const byPath = new Map()
    for (const doc of data.pages) {
      const path = pathForDoc(doc)
      const isDraft = doc._id.startsWith('drafts.')
      const existing = byPath.get(path)
      if (existing && (isDraft || !existing.isDraft)) {
        continue
      }
      byPath.set(path, {
        value: path,
        title: doc.title || doc.slug,
        type: `${TYPE_LABELS[doc._type] || 'Page'}${isDraft ? ' (draft)' : ''}`,
        isDraft,
      })
    }
    for (const route of BUILT_IN_ROUTES) {
      if (!byPath.has(route.value)) {
        byPath.set(route.value, { ...route, type: 'Built-in' })
      }
    }

    return [...byPath.values()].map((option) => ({ ...option, aliases: aliases.get(option.value) || [] }))
  }, [data])

  const current = options.find((option) => option.value === value)

  return (
    <Stack space={2}>
      {props.renderDefault(props)}
      <Autocomplete
        id={`${id}-page-picker`}
        fontSize={1}
        padding={2}
        placeholder={current ? `Links to: ${current.title}` : 'Link to a page…'}
        openButton
        options={options}
        value=""
        filterOption={(query, option) => {
          const needle = query.toLowerCase()
          return [option.title, option.value, ...option.aliases].some((text) =>
            text.toLowerCase().includes(needle),
          )
        }}
        renderOption={(option) => (
          <Card as="button" padding={2}>
            <Flex align="center" gap={3}>
              <Box flex={1}>
                <Text size={1} weight="medium" textOverflow="ellipsis">
                  {option.title}
                </Text>
                {option.aliases.length ? (
                  <Box marginTop={1}>
                    <Text size={0} muted textOverflow="ellipsis">
                      In menu as “{option.aliases.join('”, “')}”
                    </Text>
                  </Box>
                ) : null}
              </Box>
              <Text size={0} muted>
                {option.type} · {option.value}
              </Text>
            </Flex>
          </Card>
        )}
        renderValue={() => ''}
        onChange={(path) => {
          if (path) {
            onChange(set(path))
          }
        }}
      />
    </Stack>
  )
}

/** Link fields: plain strings named `href` or ending in `Href` (ctaHref, buttonHref, …). */
export function isLinkField(props) {
  const type = props.schemaType
  const last = props.path?.at(-1)
  const isPlainString = type?.jsonType === 'string' && type?.name !== 'url' && !type?.options?.list
  return isPlainString && typeof last === 'string' && /^(href|\w+Href)$/u.test(last)
}
