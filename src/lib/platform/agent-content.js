/*
 * Agent-facing representations of the public site.
 *
 * Browsers keep the designed Next.js pages. Everything here serves clients that
 * read the raw response instead of rendering it: language-model agents asking
 * for `text/markdown`, and non-browser HTTP clients that ask for HTML but never
 * run JavaScript. Both representations are built from the same tenant page
 * content the designed page renders, so the facts never drift.
 *
 * Nothing in this module touches request scope (no `next/headers`), so it can
 * run inside the proxy, inside route handlers, and under plain unit tests.
 */
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { cleanRuntimeString } from '@/lib/sanity/stega'

export const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8'
export const HTML_CONTENT_TYPE = 'text/html; charset=utf-8'

/** Recovery links every Markdown or lightweight 404 must point at. */
export const NOT_FOUND_RECOVERY_PATHS = ['/', '/llms.txt', '/sitemap.xml']

/** Machine-readable resources linked from every agent representation. */
export const AGENT_RESOURCE_LINKS = [
  { href: '/llms.txt', label: 'llms.txt — structured site index for language models' },
  { href: '/developers', label: 'Developer resources — how to read this site programmatically' },
  { href: '/sitemap.xml', label: 'sitemap.xml — every public URL' },
  { href: '/robots.txt', label: 'robots.txt — crawl rules' },
  { href: '/ai.txt', label: 'ai.txt — AI crawler policy' },
  { href: '/contact', label: 'Contact — phone, email, address, and response times' },
]

/* ─── Accept negotiation ─────────────────────────────────────────────────── */

/**
 * Parse an `Accept` header into media ranges with quality values.
 * Malformed parts are kept with sane defaults rather than thrown on.
 *
 * @param {string | null | undefined} header
 * @returns {{ type: string, subtype: string, q: number, index: number }[]}
 */
export function parseAcceptHeader(header) {
  return String(header || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => {
      const [media, ...params] = part.split(';').map((piece) => piece.trim())
      const [rawType = '*', rawSubtype = '*'] = media.toLowerCase().split('/')
      let q = 1
      for (const param of params) {
        const [key, value] = param.split('=')
        if (key?.trim().toLowerCase() === 'q') {
          const parsed = Number.parseFloat(value)
          q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0
        }
      }
      return { type: rawType || '*', subtype: rawSubtype || '*', q, index }
    })
}

function findExactMediaRange(ranges, type, subtype) {
  return ranges.find((range) => range.type === type && range.subtype === subtype) ?? null
}

/**
 * Whether the client prefers Markdown over HTML.
 *
 * Follows the Accept-Markdown convention: `text/markdown` must be listed
 * explicitly (wildcards never opt a client in), and it wins when its quality
 * beats an explicit `text/html`. On an exact tie the range listed first wins,
 * which keeps `Accept: text/markdown, text/html` on Markdown while browsers,
 * which never list `text/markdown`, are unaffected.
 *
 * @param {string | null | undefined} acceptHeader
 * @returns {boolean}
 */
export function prefersMarkdown(acceptHeader) {
  const ranges = parseAcceptHeader(acceptHeader)
  const markdown = findExactMediaRange(ranges, 'text', 'markdown')
  if (!markdown || markdown.q <= 0) {
    return false
  }
  const html = findExactMediaRange(ranges, 'text', 'html')
  if (!html || html.q <= 0) {
    return true
  }
  if (markdown.q === html.q) {
    return markdown.index < html.index
  }
  return markdown.q > html.q
}

const BROWSER_FETCH_DESTINATIONS = new Set(['document', 'iframe', 'frame', 'embed', 'object'])

/**
 * Whether the request is a real browser navigation, which must keep the
 * designed page. Modern browsers send `Sec-Fetch-Mode: navigate`; older ones
 * are recognised by a `Mozilla/` user agent that explicitly accepts HTML.
 * Search and social crawlers that imitate browsers (Googlebot, Bingbot,
 * LinkedInBot) fall under the same rule, so they keep seeing the same page
 * as visitors.
 *
 * @param {(name: string) => string | null | undefined} getHeader
 * @returns {boolean}
 */
export function isBrowserNavigation(getHeader) {
  if ((getHeader('sec-fetch-mode') || '').toLowerCase() === 'navigate') {
    return true
  }
  if (BROWSER_FETCH_DESTINATIONS.has((getHeader('sec-fetch-dest') || '').toLowerCase())) {
    return true
  }
  const userAgent = getHeader('user-agent') || ''
  const accept = (getHeader('accept') || '').toLowerCase()
  return userAgent.includes('Mozilla/') && accept.includes('text/html')
}

const AGENT_SAFE_METHODS = new Set(['GET', 'HEAD'])

/**
 * Decide which representation a public page request receives.
 *
 * - `markdown`: the client prefers `text/markdown`.
 * - `page`: a browser navigation, a React Server Component fetch, a prefetch,
 *   a server action, or any non-GET request. Always the designed Next.js page.
 * - `lightweight-html`: every other reader (curl, fetch, agent SDKs) that asked
 *   for HTML or accepted anything.
 *
 * @param {{ method?: string, getHeader: (name: string) => string | null | undefined }} request
 * @returns {'markdown' | 'lightweight-html' | 'page'}
 */
export function resolvePublicRepresentation({ method = 'GET', getHeader }) {
  if (!AGENT_SAFE_METHODS.has(String(method).toUpperCase())) {
    return 'page'
  }
  if (getHeader('rsc') || getHeader('next-router-prefetch') || getHeader('next-action')) {
    return 'page'
  }
  if (prefersMarkdown(getHeader('accept'))) {
    return 'markdown'
  }
  if (isBrowserNavigation(getHeader)) {
    return 'page'
  }
  return 'lightweight-html'
}

/* ─── Text helpers ───────────────────────────────────────────────────────── */

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** @param {unknown} value */
export function escapeHtml(value) {
  return String(value ?? '').replaceAll(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

/**
 * Escape text for Markdown so content can never inject headings, links, or raw
 * HTML into the document structure.
 *
 * @param {unknown} value
 */
export function escapeMarkdown(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll(/[*_`[\]|]/g, (char) => `\\${char}`)
    .replaceAll(/^(\s*)([#+-])/gm, '$1\\$2')
    .replaceAll(/^(\s*\d+)\./gm, '$1\\.')
}

function toText(value) {
  if (value === null || value === undefined) {
    return ''
  }
  if (Array.isArray(value)) {
    return cleanRuntimeString(portableTextToPlainText(value)).trim()
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return cleanRuntimeString(String(value)).trim()
  }
  return ''
}

function toParagraphs(value) {
  return toText(value)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replaceAll(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
}

function isSafeHref(href) {
  const value = toText(href)
  if (!value) {
    return false
  }
  return value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://')
}

/** Anchors on the designed page point at the consultation form; agents need a real page. */
const ANCHOR_HREF_REPLACEMENTS = {
  '#consultation': '/contact',
  '#estimate': '/contact',
  '#contact': '/contact',
}

function normalizeHref(href) {
  const value = toText(href)
  if (!value) {
    return ''
  }
  if (ANCHOR_HREF_REPLACEMENTS[value]) {
    return ANCHOR_HREF_REPLACEMENTS[value]
  }
  return isSafeHref(value) ? value : ''
}

/* ─── Outline model ──────────────────────────────────────────────────────── */

/**
 * A representation-neutral outline. Block shapes:
 * - `{ type: 'heading', level: 2, text }`
 * - `{ type: 'paragraph', text }`
 * - `{ type: 'quote', text }`
 * - `{ type: 'list', ordered, items: [{ label, text, href }] }`
 * - `{ type: 'qa', items: [{ question, answer }] }`
 */

const SKIPPED_SECTION_TYPES = new Set(['band', 'scrollText', 'logos', 'video', 'hyperframes', 'gallery'])

const ITEM_ARRAY_KEYS = ['items', 'roofingItems', 'secondaryItems', 'people', 'areas', 'metrics', 'actions']

function sectionType(section) {
  return cleanRuntimeString(section?.type) || String(section?._type || '').replace(/Section$/, '')
}

function itemToListEntry(item) {
  if (!item || typeof item !== 'object') {
    const text = toText(item)
    return text ? { label: '', text, href: '' } : null
  }
  const label =
    toText(item.title) ||
    toText(item.question) ||
    toText(item.name) ||
    toText(item.label) ||
    toText(item.displayName)
  const detail =
    toText(item.body) ||
    toText(item.answer) ||
    toText(item.blurb) ||
    toText(item.description) ||
    toText(item.value) ||
    toText(item.role)
  const text = detail.replaceAll(/\s*\n\s*/g, ' ')
  const href = normalizeHref(item.href || item.url || item.link)
  if (!label && !text) {
    return null
  }
  return { label, text, href }
}

function pushParagraphs(blocks, value) {
  for (const text of toParagraphs(value)) {
    blocks.push({ type: 'paragraph', text })
  }
}

function pushList(blocks, entries, ordered = false) {
  const items = entries.map(itemToListEntry).filter(Boolean)
  if (items.length > 0) {
    blocks.push({ type: 'list', ordered, items })
  }
}

function pushCallToAction(blocks, section) {
  const label = toText(section.ctaLabel)
  const href = normalizeHref(section.ctaHref) || '/contact'
  if (label) {
    blocks.push({ type: 'list', ordered: false, items: [{ label: '', text: label, href }] })
  }
}

function heroBlocks(section, h1) {
  const blocks = []
  const title = toText(section.title)
  if (title && title !== h1) {
    blocks.push({ type: 'paragraph', text: title })
  }
  pushParagraphs(blocks, section.body)
  pushList(blocks, Array.isArray(section.metrics) ? section.metrics : [])
  pushList(blocks, Array.isArray(section.actions) ? section.actions : [])
  return blocks
}

function faqBlocks(section) {
  const items = (Array.isArray(section.items) ? section.items : [])
    .map((item) => ({
      question: toText(item?.question || item?.title),
      answer: toText(item?.answer || item?.body),
    }))
    .filter((item) => item.question)
  return items.length > 0 ? [{ type: 'qa', items }] : []
}

function solarSwitchBlocks(section) {
  const text = [toText(section.leadingWords), toText(section.accentWord), toText(section.trailingText)]
    .filter(Boolean)
    .join(' ')
  return text ? [{ type: 'paragraph', text }] : []
}

function genericSectionBlocks(section, type) {
  const blocks = []
  if (type === 'quote') {
    for (const text of toParagraphs(section.body)) {
      blocks.push({ type: 'quote', text })
    }
  } else {
    pushParagraphs(blocks, section.subtitle)
    pushParagraphs(blocks, section.body)
    pushParagraphs(blocks, section.description)
  }
  for (const key of ITEM_ARRAY_KEYS) {
    if (Array.isArray(section[key])) {
      pushList(blocks, section[key], type === 'steps' || type === 'installProcess')
    }
  }
  pushCallToAction(blocks, section)
  return blocks
}

function sectionToBlocks(section, h1, seenHeadings) {
  const type = sectionType(section)
  if (!section || SKIPPED_SECTION_TYPES.has(type)) {
    return []
  }
  if (type === 'hero') {
    return heroBlocks(section, h1)
  }

  const blocks = []
  const title = toText(section.title)
  if (title && title !== h1 && !seenHeadings.has(title)) {
    seenHeadings.add(title)
    blocks.push({ type: 'heading', level: 2, text: title })
  }

  if (type === 'faq') {
    blocks.push(...faqBlocks(section))
  } else if (type === 'solarSwitch') {
    blocks.push(...solarSwitchBlocks(section))
  } else {
    blocks.push(...genericSectionBlocks(section, type))
  }

  // A heading with nothing under it reads as a broken page; drop it.
  if (blocks.length === 1 && blocks[0].type === 'heading') {
    seenHeadings.delete(title)
    return []
  }
  return blocks
}

function findHeroSection(sections) {
  return sections.find((section) => sectionType(section) === 'hero') ?? null
}

/**
 * Public identity used in Markdown, lightweight HTML, and JSON-LD. Fields are
 * optional; renderers skip what is missing.
 *
 * @typedef {object} OrganizationIdentity
 * @property {string} name - Legal or trading name.
 * @property {string} [description] - One or two plain sentences about the business.
 * @property {string} [phone] - Display phone number.
 * @property {string} [email] - Public email address.
 * @property {string[]} [serviceArea] - Cities or regions served.
 * @property {{ streetAddress?: string, addressLocality?: string, addressRegion?: string, postalCode?: string, addressCountry?: string }} [address] - Postal address parts.
 * @property {string[]} [sameAs] - Official profile URLs.
 */

/** @param {OrganizationIdentity['address']} address */
export function formatPostalAddress(address) {
  if (!address) {
    return ''
  }
  const locality = [toText(address.addressLocality), toText(address.addressRegion)].filter(Boolean).join(', ')
  const localityLine = [locality, toText(address.postalCode)].filter(Boolean).join(' ')
  return [toText(address.streetAddress), localityLine].filter(Boolean).join(', ')
}

/** `(512) 775-0561` → `tel:+15127750561`; numbers that already carry a country code are kept. */
function toTelHref(phone) {
  const digits = String(phone || '').replaceAll(/\D/g, '')
  if (!digits) {
    return ''
  }
  return digits.length === 10 ? `tel:+1${digits}` : `tel:+${digits}`
}

function contactBlocks(identity) {
  if (!identity) {
    return []
  }
  const items = []
  if (identity.phone) {
    items.push({
      label: 'Phone',
      text: identity.phone,
      href: toTelHref(identity.phone),
    })
  }
  if (identity.email) {
    items.push({ label: 'Email', text: identity.email, href: `mailto:${identity.email}` })
  }
  const address = formatPostalAddress(identity.address)
  if (address) {
    items.push({ label: 'Address', text: address, href: '' })
  }
  if (Array.isArray(identity.serviceArea) && identity.serviceArea.length > 0) {
    items.push({
      label: 'Service area',
      text: identity.serviceArea.map(toText).filter(Boolean).join(', '),
      href: '',
    })
  }
  if (items.length === 0) {
    return []
  }
  return [
    { type: 'heading', level: 2, text: `Contact ${identity.name}` },
    {
      type: 'paragraph',
      text: 'Free estimates, no pressure, and no commitment. Numbers on this site are Central Texas ranges; your roof, usage, utility, and insurance carrier change them.',
    },
    { type: 'list', ordered: false, items },
  ]
}

function resourceBlocks() {
  return [
    { type: 'heading', level: 2, text: 'Machine-readable resources' },
    {
      type: 'paragraph',
      text: 'Any public page on this site returns Markdown when the request prefers text/markdown (Accept: text/markdown). HTML clients that are not browsers receive this lightweight document; browsers receive the designed page.',
    },
    {
      type: 'list',
      ordered: false,
      items: AGENT_RESOURCE_LINKS.map((link) => ({ label: '', text: link.label, href: link.href })),
    },
  ]
}

/**
 * Build the representation-neutral outline for a page.
 *
 * @param {object} input
 * @param {{ name: string, primaryDomain: string }} input.site
 * @param {object} input.page - A fixture or Sanity page with `sections`.
 * @param {string} input.pathname - Request path, e.g. `/about`.
 * @param {{ label: string, href: string }[]} [input.navigation]
 * @param {OrganizationIdentity | null} [input.identity]
 * @param {string} [input.canonicalUrl]
 */
export function buildPageOutline({
  site,
  page,
  pathname,
  navigation = [],
  identity = null,
  canonicalUrl = '',
}) {
  const sections = Array.isArray(page?.sections) ? page.sections : []
  const hero = findHeroSection(sections)
  const pageTitle = toText(page?.title) || toText(site?.name)
  const h1 = toText(hero?.title) || pageTitle
  const seenHeadings = new Set()
  const blocks = sections.flatMap((section) => sectionToBlocks(section, h1, seenHeadings))

  return {
    kind: 'page',
    siteName: toText(site?.name),
    title: pageTitle,
    h1,
    description:
      toText(page?.seo?.description) || toText(page?.description) || toText(site?.seo?.description),
    pathname: pathname || '/',
    canonicalUrl,
    navigation: navigation
      .map((item) => ({ label: toText(item?.label), href: normalizeHref(item?.href) }))
      .filter((item) => item.label && item.href),
    blocks: [...blocks, ...contactBlocks(identity), ...resourceBlocks()],
  }
}

/**
 * Outline for a missing public path. Short, honest, and full of exits.
 *
 * @param {{ name: string }} site
 * @param {string} pathname
 * @param {OrganizationIdentity | null} [identity]
 */
export function buildNotFoundOutline(site, pathname, identity = null) {
  const siteName = toText(site?.name) || 'this site'
  const safePath = toText(pathname) || '/'
  return {
    kind: 'not-found',
    siteName,
    title: 'Page not found',
    h1: 'Page not found',
    description: `There is no public page at ${safePath} on ${siteName}.`,
    pathname: safePath,
    canonicalUrl: '',
    navigation: [],
    blocks: [
      {
        type: 'paragraph',
        text: `There is no public page at ${safePath} on ${siteName}. The address may have changed, or the page may never have existed. Nothing else on the site is affected.`,
      },
      { type: 'heading', level: 2, text: 'Where to go next' },
      {
        type: 'list',
        ordered: false,
        items: [
          { label: '', text: 'Homepage — start over from the front door', href: '/' },
          { label: '', text: 'llms.txt — a structured index of every useful page', href: '/llms.txt' },
          { label: '', text: 'sitemap.xml — every public URL', href: '/sitemap.xml' },
          { label: '', text: 'Services — roofing, solar, and home-energy work', href: '/services' },
          { label: '', text: 'Guides — long-form answers for Texas homeowners', href: '/guides' },
          { label: '', text: 'Contact — phone, email, and a free estimate', href: '/contact' },
        ],
      },
      ...contactBlocks(identity),
    ],
  }
}

/* ─── Renderers ──────────────────────────────────────────────────────────── */

function absoluteUrl(href, origin) {
  if (!href) {
    return ''
  }
  if (href.startsWith('/') && origin) {
    return `${origin}${href}`
  }
  return href
}

function markdownListItem(item, origin) {
  const label = item.label ? `**${escapeMarkdown(item.label)}**` : ''
  const text = item.text ? escapeMarkdown(item.text) : ''
  const body = [label, text].filter(Boolean).join(label && text ? ' — ' : '')
  if (item.href) {
    const url = absoluteUrl(item.href, origin)
    return item.label ? `${label} — [${text || url}](${url})` : `[${text || url}](${url})`
  }
  return body
}

const MARKDOWN_BLOCK_RENDERERS = {
  heading: (block) => `${'#'.repeat(block.level)} ${escapeMarkdown(block.text)}`,
  paragraph: (block) => escapeMarkdown(block.text),
  quote: (block) => `> ${escapeMarkdown(block.text)}`,
  list: (block, origin) =>
    block.items
      .map((item, index) => `${block.ordered ? `${index + 1}.` : '-'} ${markdownListItem(item, origin)}`)
      .join('\n'),
  qa: (block) =>
    block.items
      .map((item) =>
        item.answer
          ? `**${escapeMarkdown(item.question)}**\n\n${escapeMarkdown(item.answer)}`
          : `**${escapeMarkdown(item.question)}**`,
      )
      .join('\n\n'),
}

function markdownBlock(block, origin) {
  const render = MARKDOWN_BLOCK_RENDERERS[block.type]
  return render ? render(block, origin) : ''
}

/**
 * Render an outline as a Markdown document.
 *
 * @param {ReturnType<typeof buildPageOutline>} outline
 * @param {{ origin?: string }} [options] - Absolute origin for relative links.
 */
export function renderOutlineMarkdown(outline, { origin = '' } = {}) {
  const lines = [`# ${escapeMarkdown(outline.h1)}`]
  if (outline.description) {
    lines.push(`> ${escapeMarkdown(outline.description)}`)
  }
  const meta = []
  if (outline.canonicalUrl) {
    meta.push(`Source: ${outline.canonicalUrl}`)
  }
  if (outline.siteName) {
    meta.push(`Site: ${escapeMarkdown(outline.siteName)}`)
  }
  if (meta.length > 0) {
    lines.push(meta.join('  \n'))
  }
  if (outline.navigation.length > 0) {
    lines.push(
      `Pages: ${outline.navigation.map((item) => `[${escapeMarkdown(item.label)}](${absoluteUrl(item.href, origin)})`).join(' · ')}`,
    )
  }
  for (const block of outline.blocks) {
    const rendered = markdownBlock(block, origin)
    if (rendered) {
      lines.push(rendered)
    }
  }
  return `${lines.join('\n\n')}\n`
}

const LIGHTWEIGHT_STYLES =
  'body{max-width:44rem;margin:2rem auto;padding:0 1rem;font:16px/1.6 system-ui,sans-serif;color:#0f172a;background:#fff}' +
  'nav a{margin-right:.75rem}h1{font-size:2rem;line-height:1.2}h2{margin-top:2rem}blockquote{margin:1rem 0;padding-left:1rem;border-left:3px solid #ea580c}' +
  'footer{margin-top:3rem;color:#62748e;font-size:.875rem}'

function htmlListItem(item, origin) {
  const label = item.label ? `<strong>${escapeHtml(item.label)}</strong>` : ''
  const text = escapeHtml(item.text)
  const linked = item.href
    ? `<a href="${escapeHtml(absoluteUrl(item.href, origin))}">${text || escapeHtml(item.href)}</a>`
    : text
  return `<li>${[label, linked].filter(Boolean).join(label && linked ? ' — ' : '')}</li>`
}

const HTML_BLOCK_RENDERERS = {
  heading: (block) => `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`,
  paragraph: (block) => `<p>${escapeHtml(block.text)}</p>`,
  quote: (block) => `<blockquote><p>${escapeHtml(block.text)}</p></blockquote>`,
  list: (block, origin) => {
    const tag = block.ordered ? 'ol' : 'ul'
    return `<${tag}>${block.items.map((item) => htmlListItem(item, origin)).join('')}</${tag}>`
  },
  qa: (block) =>
    `<dl>${block.items.map((item) => `<dt><strong>${escapeHtml(item.question)}</strong></dt><dd>${escapeHtml(item.answer)}</dd>`).join('')}</dl>`,
}

function htmlBlock(block, origin) {
  const render = HTML_BLOCK_RENDERERS[block.type]
  return render ? render(block, origin) : ''
}

/**
 * Render an outline as a complete, dependency-free HTML document: one H1,
 * sequential headings, no scripts other than JSON-LD, no hydration payload.
 *
 * @param {ReturnType<typeof buildPageOutline>} outline
 * @param {object} [options]
 * @param {string} [options.origin]
 * @param {object | null} [options.jsonLd]
 * @param {{ ogImage?: string, robots?: string, siteName?: string }} [options.meta]
 */
export function renderOutlineHtml(outline, { origin = '', jsonLd = null, meta = {} } = {}) {
  const title =
    outline.siteName && outline.title !== outline.siteName && outline.pathname !== '/'
      ? `${outline.title} | ${outline.siteName}`
      : outline.title
  const canonical = outline.canonicalUrl || absoluteUrl(outline.pathname, origin)
  const head = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    outline.description ? `<meta name="description" content="${escapeHtml(outline.description)}">` : '',
    `<meta name="robots" content="${escapeHtml(meta.robots || 'index, follow')}">`,
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : '',
    canonical
      ? `<link rel="alternate" type="text/markdown" href="${escapeHtml(canonical)}" title="Markdown">`
      : '',
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeHtml(outline.title)}">`,
    outline.description
      ? `<meta property="og:description" content="${escapeHtml(outline.description)}">`
      : '',
    canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}">` : '',
    meta.siteName || outline.siteName
      ? `<meta property="og:site_name" content="${escapeHtml(meta.siteName || outline.siteName)}">`
      : '',
    meta.ogImage ? `<meta property="og:image" content="${escapeHtml(meta.ogImage)}">` : '',
    `<meta name="twitter:card" content="${meta.ogImage ? 'summary_large_image' : 'summary'}">`,
    `<style>${LIGHTWEIGHT_STYLES}</style>`,
    jsonLd
      ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll('<', '\\u003c')}</script>`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  const nav =
    outline.navigation.length > 0
      ? `<nav aria-label="Main">${outline.navigation.map((item) => `<a href="${escapeHtml(absoluteUrl(item.href, origin))}">${escapeHtml(item.label)}</a>`).join('')}</nav>`
      : ''
  const header = `<header><p><a href="${escapeHtml(absoluteUrl('/', origin))}">${escapeHtml(outline.siteName || 'Home')}</a></p>${nav}</header>`
  const body = outline.blocks
    .map((block) => htmlBlock(block, origin))
    .filter(Boolean)
    .join('\n')
  const lead = outline.description ? `<p>${escapeHtml(outline.description)}</p>` : ''
  const footer = `<footer><p>${escapeHtml(outline.siteName || '')}. This is the lightweight text version of <a href="${escapeHtml(canonical || absoluteUrl('/', origin))}">${escapeHtml(canonical || 'this page')}</a>.</p></footer>`

  return `<!doctype html>\n<html lang="en">\n<head>\n${head}\n</head>\n<body>\n${header}\n<main id="main-content"><article>\n<h1>${escapeHtml(outline.h1)}</h1>\n${lead}\n${body}\n</article></main>\n${footer}\n</body>\n</html>\n`
}

/**
 * Share of visible text in an HTML document, 0–1. Used by tests and the
 * verification script; a designed Next.js page scores well under 0.05.
 *
 * @param {string} html
 */
export function measureHtmlContentRatio(html) {
  const source = String(html || '')
  if (!source) {
    return 0
  }
  const text = source
    .replaceAll(/<script[\s\S]*?<\/script>/gi, '')
    .replaceAll(/<style[\s\S]*?<\/style>/gi, '')
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
  return text.length / source.length
}

/**
 * Visible text of an HTML document with scripts, styles, and tags removed.
 *
 * @param {string} html
 */
export function extractHtmlText(html) {
  return String(html || '')
    .replaceAll(/<script[\s\S]*?<\/script>/gi, '')
    .replaceAll(/<style[\s\S]*?<\/style>/gi, '')
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
}
