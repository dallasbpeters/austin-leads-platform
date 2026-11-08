'use client'

import { Badge, Box, Button, Card, Flex, Heading, Stack, Text, TextArea, TextInput } from '@sanity/ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PatchEvent, pathToString, set, useClient } from 'sanity'
import { useDocumentPane, usePaneRouter } from 'sanity/structure'

import {
  brandChecks,
  collectLinks,
  describePath,
  imageChecks,
  isKnownPath,
  linkKind,
  seoChecks,
  suggestHref,
} from '../../lib/preflight/checks'
import { toolApiOrigin } from '../env'
import { BUILT_IN_ROUTES, pathForDoc } from './page-link-input'

/*
 * The "Preflight" view beside each page (studioStructure → defaultDocumentNode):
 * links, SEO and brand-voice checks on the version being edited, before it is
 * published. The checks are in src/lib/preflight/checks.js; outside links are
 * fetched by /api/preflight/links, since most sites refuse Studio's requests.
 *
 * Each problem can be fixed from here: "Go to field" opens the editor on it, and
 * common ones get a one-click change or a box to type the fix in (finding.fix).
 * Changes go into the draft like any edit, so Undo and publishing work as usual.
 */

const PAGES_QUERY = `*[
  _type in ["page", "servicePage", "locationPage", "post", "caseStudy"]
  && defined(slug.current)
  && (!defined($siteId) || site._ref == $siteId)
]{ _type, pageType, "slug": slug.current }`

const TONE = { error: 'critical', warning: 'caution', ok: 'positive' }
const LABEL = { error: 'Fix', warning: 'Check', ok: 'OK' }

/**
 * The schema type at a path in the document, following array items by their
 * _type, so a fix can see which fields an image type has (alt or altText).
 */
function typeAt(schemaType, document, path) {
  let type = schemaType
  let value = document
  for (const step of path) {
    if (typeof step === 'string') {
      type = type?.fields?.find((field) => field.name === step)?.type
      value = value?.[step]
    } else {
      const item = Array.isArray(value)
        ? typeof step === 'number'
          ? value[step]
          : value.find((entry) => entry?._key === step._key)
        : undefined
      type = type?.of?.find((member) => member.name === item?._type) || type?.of?.[0]
      value = item
    }
  }
  return type
}

/** The value at a path in the document, following array items by _key. */
function valueAt(document, path) {
  let value = document
  for (const step of path) {
    value = Array.isArray(value)
      ? typeof step === 'number'
        ? value[step]
        : value.find((item) => item?._key === step?._key)
      : value?.[step]
  }
  return value
}

/**
 * A small preview URL for an image asset, built from its id
 * ("image-<hash>-<width>x<height>-<ext>"), so you can see what you are describing.
 */
const thumbnailUrl = (image, { projectId, dataset }) => {
  const match = /^image-(\w+)-(\d+x\d+)-(\w+)$/u.exec(image?.asset?._ref || '')
  return match
    ? `https://cdn.sanity.io/images/${projectId}/${dataset}/${match[1]}-${match[2]}.${match[3]}?w=480&fit=max&auto=format`
    : null
}

const altPathFor = (schemaType, document, imagePath) => {
  const fields = typeAt(schemaType, document, imagePath)?.fields || []
  const name = fields.find((field) => field.name === 'alt' || field.name === 'altText')?.name
  return name ? [...imagePath, name] : null
}

/** A box to type the fix in, with a live character count when the field has a target length. */
const TextFix = ({ fix, onSave }) => {
  const [value, setValue] = useState(fix.value || '')
  const length = value.trim().length
  const inRange = (!fix.min || length >= fix.min) && (!fix.max || length <= fix.max)
  const Input = fix.multiline ? TextArea : TextInput
  return (
    <Stack gap={2}>
      <Input
        fontSize={1}
        rows={fix.multiline ? 3 : undefined}
        value={value}
        placeholder={fix.label}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <Flex align="center" gap={3}>
        {fix.min || fix.max ? (
          <Text
            size={0}
            muted={inRange}
            style={inRange ? undefined : { color: 'var(--card-badge-caution-fg-color)' }}
          >
            {length} characters{fix.min && fix.max ? ` (aim for ${fix.min}–${fix.max})` : ''}
          </Text>
        ) : null}
        <Box flex={1} />
        <Button
          text={`Save ${fix.label.toLowerCase()}`}
          tone="primary"
          fontSize={1}
          padding={2}
          disabled={!length}
          onClick={() => onSave(value.trim())}
        />
      </Flex>
    </Stack>
  )
}

const Finding = ({ finding, document, schemaType, onPatch, onGoTo, clientConfig }) => {
  const fix = finding.fix
  const altPath = fix?.type === 'alt' ? altPathFor(schemaType, document, fix.path) : null
  const preview = fix?.type === 'alt' ? thumbnailUrl(valueAt(document, fix.path), clientConfig) : null
  return (
    <Card padding={3} radius={2} tone={finding.level === 'ok' ? 'default' : TONE[finding.level]} border>
      <Flex gap={3} align="flex-start">
        <Box style={{ flex: 'none', width: '3.25rem' }}>
          <Badge tone={TONE[finding.level]} fontSize={0}>
            {LABEL[finding.level]}
          </Badge>
        </Box>
        <Stack gap={3} flex={1}>
          <Stack gap={2}>
            <Text size={1}>{finding.message}</Text>
            {finding.path?.length ? (
              <Text size={0} muted>
                {describePath(finding.path, document)}
              </Text>
            ) : null}
          </Stack>
          {/* Keyed by field and value, so a box starts over when its problem changes. */}
          {fix?.type === 'text' ? (
            <TextFix
              key={`${pathToString(fix.path)}:${fix.value}`}
              fix={fix}
              onSave={(value) => onPatch(fix.path, value)}
            />
          ) : null}
          {preview ? (
            <Card radius={2} overflow="hidden" border tone="transparent" style={{ maxWidth: '20rem' }}>
              {/* oxlint-disable-next-line next/no-img-element -- Studio is not a Next page; Sanity's CDN sizes it */}
              <img
                src={preview}
                alt=""
                loading="lazy"
                style={{ display: 'block', width: '100%', maxHeight: '12rem', objectFit: 'contain' }}
              />
            </Card>
          ) : null}
          {altPath ? (
            <TextFix key={pathToString(altPath)} fix={fix} onSave={(value) => onPatch(altPath, value)} />
          ) : null}
          {finding.level !== 'ok' && (fix?.type === 'set' || finding.path?.length) ? (
            <Flex gap={2} wrap="wrap">
              {fix?.type === 'set' ? (
                <Button
                  text={fix.label}
                  tone="primary"
                  fontSize={1}
                  padding={2}
                  onClick={() => onPatch(fix.path, fix.value)}
                />
              ) : null}
              {finding.path?.length ? (
                <Button
                  text="Go to field"
                  mode="ghost"
                  fontSize={1}
                  padding={2}
                  onClick={() => onGoTo(finding.path)}
                />
              ) : null}
            </Flex>
          ) : null}
        </Stack>
      </Flex>
    </Card>
  )
}

const Group = ({ title, findings, ...actions }) => {
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
        <Finding key={index} finding={finding} {...actions} />
      ))}
    </Stack>
  )
}

export const PreflightView = ({ document: documentState, schemaType }) => {
  const document = documentState?.displayed
  const { onChange, onFocus, onPathOpen } = useDocumentPane()
  const { params, setParams } = usePaneRouter()

  // A fix is an ordinary edit: it lands in the draft, and Undo takes it back.
  const onPatch = useCallback((path, value) => onChange(PatchEvent.from(set(value, path))), [onChange])
  // Back to the editor, opened and focused on the field: one change of the pane's address, so neither undoes the other.
  const onGoTo = useCallback(
    (path) => {
      onPathOpen(path)
      onFocus(path)
      setParams({ ...params, view: undefined, path: pathToString(path) })
    },
    [params, setParams, onPathOpen, onFocus],
  )
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
        const suggestion = suggestHref(link.href, knownPaths)
        findings.push({
          group: 'Links',
          level: 'error',
          message: `"${link.href}" is not a full address. Start it with / for a page here, or https:// for another site.`,
          path: link.path,
          fix: suggestion
            ? { type: 'set', path: link.path, value: suggestion, label: `Change to ${suggestion}` }
            : undefined,
        })
      } else if (kind === 'internal' && knownPaths && !isKnownPath(link.href, knownPaths)) {
        const suggestion = suggestHref(link.href, knownPaths)
        findings.push({
          group: 'Links',
          level: 'error',
          message: suggestion
            ? `No page at ${link.href}. Did you mean ${suggestion}?`
            : `No page at ${link.href}.`,
          path: link.path,
          fix: suggestion
            ? { type: 'set', path: link.path, value: suggestion, label: `Change to ${suggestion}` }
            : undefined,
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
  const actions = { document, schemaType, onPatch, onGoTo, clientConfig: client.config() }

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
        <Group title="Links" findings={linkFindings} {...actions} />
        <Group title="Search (SEO)" findings={seo} {...actions} />
        <Group title="Brand voice" findings={brand} {...actions} />
      </Stack>
    </Box>
  )
}
