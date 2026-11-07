'use client'

import { Autocomplete, Box, Card, Flex, Stack, Text } from '@sanity/ui'
import { useEffect, useMemo, useState } from 'react'
import { set, useClient, useFormValue } from 'sanity'

/*
 * Link fields stay plain strings (so outside URLs, tel: links and #anchors
 * still work), with a page picker under the text box. Picking a page writes
 * its path, so nobody has to remember a slug.
 */

// Same documents the Presentation tool treats as pages, plus case studies.
const PAGES_QUERY = `*[
  _type in ["page", "servicePage", "locationPage", "post", "caseStudy"]
  && defined(slug.current)
  && !(_id in path("drafts.**"))
  && (!defined($siteId) || site._ref == $siteId)
]{
  _id,
  _type,
  title,
  pageType,
  "slug": slug.current
} | order(title asc)`

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
  const [pages, setPages] = useState([])

  useEffect(() => {
    let cancelled = false
    client
      .fetch(PAGES_QUERY, { siteId })
      .then((docs) => {
        if (!cancelled) {
          setPages(docs)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPages([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [client, siteId])

  const options = useMemo(() => {
    const seen = new Set()
    return pages
      .map((doc) => ({
        value: pathForDoc(doc),
        title: doc.title || doc.slug,
        type: TYPE_LABELS[doc._type] || 'Page',
      }))
      .filter((option) => {
        if (seen.has(option.value)) {
          return false
        }
        seen.add(option.value)
        return true
      })
  }, [pages])

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
          return option.title.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle)
        }}
        renderOption={(option) => (
          <Card as="button" padding={2}>
            <Flex align="center" gap={3}>
              <Box flex={1}>
                <Text size={1} weight="medium" textOverflow="ellipsis">
                  {option.title}
                </Text>
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
