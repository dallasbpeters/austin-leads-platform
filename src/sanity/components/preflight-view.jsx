'use client'

import { Badge, Box, Button, Card, Flex, Heading, Stack, Text } from '@sanity/ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClient } from 'sanity'

import {
  brandChecks,
  collectLinks,
  describePath,
  imageChecks,
  isKnownPath,
  linkKind,
  seoChecks,
} from '../../lib/preflight/checks'
import { toolApiOrigin } from '../env'
import { BUILT_IN_ROUTES, pathForDoc } from './page-link-input'

/*
 * The "Preflight" view beside each page (studioStructure → defaultDocumentNode):
 * links, SEO and brand-voice checks on the version being edited, before it is
 * published. The checks are in src/lib/preflight/checks.js; outside links are
 * fetched by /api/preflight/links, since most sites refuse Studio's requests.
 */

const PAGES_QUERY = `*[
  _type in ["page", "servicePage", "locationPage", "post", "caseStudy"]
  && defined(slug.current)
  && (!defined($siteId) || site._ref == $siteId)
]{ _type, pageType, "slug": slug.current }`

const TONE = { error: 'critical', warning: 'caution', ok: 'positive' }
const LABEL = { error: 'Fix', warning: 'Check', ok: 'OK' }

const Finding = ({ finding, document }) => (
  <Card padding={3} radius={2} tone={finding.level === 'ok' ? 'default' : TONE[finding.level]} border>
    <Flex gap={3} align="flex-start">
      <Box style={{ flex: 'none', width: '3.25rem' }}>
        <Badge tone={TONE[finding.level]} fontSize={0}>
          {LABEL[finding.level]}
        </Badge>
      </Box>
      <Stack gap={2} flex={1}>
        <Text size={1}>{finding.message}</Text>
        {finding.path?.length ? (
          <Text size={0} muted>
            {describePath(finding.path, document)}
          </Text>
        ) : null}
      </Stack>
    </Flex>
  </Card>
)

const Group = ({ title, findings, document }) => {
  const problems = findings.filter((finding) => finding.level !== 'ok').length
  return (
    <Stack gap={2}>
      <Flex align="center" gap={2}>
        <Heading size={1}>{title}</Heading>
        <Badge tone={problems ? 'caution' : 'positive'} fontSize={0}>
          {problems ? `${problems} to check` : 'All good'}
        </Badge>
      </Flex>
      {findings.map((finding, index) => (
        // Findings have no id; the list is rebuilt whole on every run.
        // oxlint-disable-next-line react/no-array-index-key
        <Finding key={index} finding={finding} document={document} />
      ))}
    </Stack>
  )
}

export const PreflightView = ({ document: documentState }) => {
  const document = documentState?.displayed
  const client = useClient({ apiVersion: '2025-02-19' })
  const [knownPaths, setKnownPaths] = useState(null)
  const [external, setExternal] = useState({ state: 'idle', results: [] })

  const links = useMemo(() => (document ? collectLinks(document) : []), [document])
  const externalUrls = useMemo(
    () => [...new Set(links.filter((link) => linkKind(link.href) === 'external').map((link) => link.href))],
    [links],
  )

  // The site's own pages, so internal links can be checked without a request each.
  const siteId = document?.site?._ref || null
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const pages = await client.fetch(PAGES_QUERY, { siteId })
        if (!cancelled) {
          setKnownPaths(
            new Set([
              ...pages.map(pathForDoc),
              ...BUILT_IN_ROUTES.map((route) => route.value).filter((value) => value.startsWith('/')),
            ]),
          )
        }
      } catch {
        // Without the page list, internal links are left unchecked rather than all flagged.
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [client, siteId])

  const checkExternal = useCallback(async () => {
    if (!externalUrls.length) {
      setExternal({ state: 'done', results: [] })
      return
    }
    setExternal({ state: 'checking', results: [] })
    try {
      const response = await fetch(`${toolApiOrigin}/api/preflight/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${client.config().token}` },
        body: JSON.stringify({ urls: externalUrls }),
      })
      const body = await response.json()
      if (!response.ok) {
        throw new Error(body.error || `Link check failed (${response.status})`)
      }
      setExternal({ state: 'done', results: body.results || [] })
    } catch (error) {
      setExternal({
        state: 'error',
        results: [],
        message: error instanceof Error ? error.message : 'Link check failed',
      })
    }
  }, [client, externalUrls])

  // Outside links are checked once when the view opens, then on "Check links again", not on every keystroke.
  const checkedOnOpen = useRef(false)
  useEffect(() => {
    if (!checkedOnOpen.current) {
      checkedOnOpen.current = true
      checkExternal()
    }
  }, [checkExternal])

  const linkFindings = useMemo(() => {
    const findings = []
    for (const link of links) {
      const kind = linkKind(link.href)
      if (kind === 'invalid') {
        findings.push({
          group: 'Links',
          level: 'error',
          message: `"${link.href}" is not a full address. Start it with / for a page here, or https:// for another site.`,
          path: link.path,
        })
      } else if (kind === 'internal' && knownPaths && !isKnownPath(link.href, knownPaths)) {
        findings.push({
          group: 'Links',
          level: 'error',
          message: `No page at ${link.href}.`,
          path: link.path,
        })
      } else if (kind === 'external') {
        const result = external.results.find((item) => item.url === link.href)
        if (result && !result.ok) {
          findings.push({
            group: 'Links',
            level: result.status === 0 || result.status >= 500 ? 'warning' : 'error',
            message: result.status
              ? `${link.href} answers ${result.status}.`
              : `${link.href} did not answer (${result.error || 'no response'}).`,
            path: link.path,
          })
        }
      }
    }
    if (!findings.length) {
      findings.push({
        group: 'Links',
        level: 'ok',
        message:
          external.state === 'checking'
            ? `Checking ${externalUrls.length} outside links…`
            : `${links.length} ${links.length === 1 ? 'link' : 'links'} checked; none are broken.`,
      })
    }
    return findings
  }, [links, knownPaths, external, externalUrls.length])

  if (!document) {
    return (
      <Box padding={5}>
        <Text muted>Nothing to check yet.</Text>
      </Box>
    )
  }

  const seo = [...seoChecks(document), ...imageChecks(document)]
  const brand = brandChecks(document)
  const blocking = [...linkFindings, ...seo, ...brand].filter((finding) => finding.level === 'error').length

  return (
    <Box padding={4} style={{ maxWidth: '48rem' }}>
      <Stack gap={5}>
        <Card padding={4} radius={3} tone={blocking ? 'critical' : 'positive'} border>
          <Flex align="center" gap={3} wrap="wrap">
            <Stack gap={2} flex={1}>
              <Heading size={2}>
                {blocking ? `${blocking} to fix before publishing` : 'Ready to publish'}
              </Heading>
              <Text size={1} muted>
                Checks the version you are editing: links, search basics and the brand voice.
              </Text>
            </Stack>
            <Button
              text={external.state === 'checking' ? 'Checking links…' : 'Check links again'}
              mode="ghost"
              disabled={external.state === 'checking'}
              onClick={checkExternal}
            />
          </Flex>
        </Card>
        {external.state === 'error' ? (
          <Card padding={3} radius={2} tone="caution" border>
            <Text size={1}>Outside links were not checked: {external.message}</Text>
          </Card>
        ) : null}
        <Group title="Links" findings={linkFindings} document={document} />
        <Group title="Search (SEO)" findings={seo} document={document} />
        <Group title="Brand voice" findings={brand} document={document} />
      </Stack>
    </Box>
  )
}
