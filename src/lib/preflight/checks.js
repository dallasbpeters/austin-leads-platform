/*
 * Preflight checks for a Sanity page document, run in Studio before publishing
 * (src/sanity/components/preflight-view.jsx). Pure functions over the document,
 * so they are easy to test; the link reachability check is the only part that
 * needs the network, and it lives in the view and /api/preflight/links.
 *
 * Each finding: { level: 'error' | 'warning' | 'ok', group, message, path?, fix? }.
 * `fix` tells the Preflight view how to repair it in place: { type: 'text', path,
 * label, value, min?, max?, multiline? } for a field to type in, or { type: 'set',
 * path, value, label } for a one-click change. Every finding with a path can also
 * jump to its field.
 */

const LINK_KEY = /^(href|url|link|\w+Href|\w+Url)$/u

/* Brand rules (CLAUDE.md, voice guide): the federal solar tax credit expired 31 Dec 2025, and no hype words. */
const TAX_CREDIT =
  /\b(federal (solar )?tax credit|investment tax credit|\bITC\b|solar tax credit|30% (federal )?(tax )?credit)/iu
const HYPE_WORDS = /\b(revolutionary|unbeatable|limited[- ]time|game[- ]chang\w*|best[- ]in[- ]class)\b/iu

/** Walks every value in a document, calling visit(value, path) for each object and string. */
function walk(value, visit, path = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, [...path, item?._key ? { _key: item._key } : index]))
    return
  }
  if (value && typeof value === 'object') {
    visit(value, path)
    for (const [key, child] of Object.entries(value)) {
      if (!key.startsWith('_') || key === '_type') {
        walk(child, visit, [...path, key])
      }
    }
    return
  }
  if (typeof value === 'string') {
    visit(value, path)
  }
}

/** A readable trail for a path, e.g. "sections › Hero section › heroCards › 2". */
export function describePath(path, document) {
  const labels = []
  let node = document
  for (const step of path) {
    if (node === null || node === undefined) {
      break
    }
    if (typeof step === 'object' && Array.isArray(node)) {
      const index = node.findIndex((item) => item?._key === step._key)
      node = node[index]
      const label = node?.title || node?.label || node?.eyebrow || node?._type || `item ${index + 1}`
      labels.push(String(label).slice(0, 40))
    } else {
      node = node[step]
      if (typeof step === 'number') {
        labels.push(`item ${step + 1}`)
      } else if (!['children', 'markDefs'].includes(step)) {
        labels.push(step)
      }
    }
  }
  return labels.join(' › ')
}

/** Every link in the document: link fields, link annotations in rich text, and CTA hrefs. */
export function collectLinks(document) {
  const links = []
  walk(document, (value, path) => {
    if (typeof value !== 'string') {
      if (value._type === 'link' && typeof value.href === 'string') {
        links.push({ href: value.href.trim(), path: [...path, 'href'] })
      }
      return
    }
    const key = path.at(-1)
    if (typeof key === 'string' && LINK_KEY.test(key) && value.trim() && path.at(-2) !== 'asset') {
      // Annotation hrefs are picked up above with their object; skip the duplicate here.
      if (key === 'href' && path.includes('markDefs')) {
        return
      }
      links.push({ href: value.trim(), path })
    }
  })
  return links
}

/** What kind of link this is, for deciding how to check it. */
export function linkKind(href) {
  if (/^https?:\/\//iu.test(href)) {
    return 'external'
  }
  if (/^(mailto|tel|sms):/iu.test(href)) {
    return 'contact'
  }
  if (href.startsWith('#')) {
    return 'anchor'
  }
  if (href.startsWith('/')) {
    return 'internal'
  }
  return 'invalid'
}

/** Internal paths that resolve: the site's pages, built-in routes, and their sub-pages. */
export function isKnownPath(href, knownPaths) {
  const path = href.split(/[?#]/u)[0].replace(/\/$/u, '') || '/'
  return knownPaths.has(path)
}

/** A web address from a title: "Solar in Round Rock!" -> "solar-in-round-rock". */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replaceAll(/[\u0300-\u036F]/gu, '')
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/^-+|-+$/gu, '')
    .slice(0, 80)
}

const editDistance = (a, b) => {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[b.length]
}

/**
 * The likely intended address for a broken link, or null. "www.x.com" gets
 * https://, a bare "guides/x" gets its leading slash, and a missing page is
 * matched to the closest real one (same last part, or a small typo).
 */
export function suggestHref(href, knownPaths) {
  const value = String(href || '').trim()
  if (/^www\./iu.test(value) || /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/iu.test(value)) {
    return `https://${value}`
  }
  const path = value.split(/[?#]/u)[0].replace(/\/$/u, '')
  const withSlash = path.startsWith('/') ? path : `/${path}`
  if (!knownPaths?.size) {
    return path.startsWith('/') ? null : withSlash
  }
  if (knownPaths.has(withSlash)) {
    return withSlash
  }
  const last = withSlash.split('/').pop()
  let best = null
  let bestScore = Infinity
  for (const known of knownPaths) {
    const score = known.split('/').pop() === last ? 0 : editDistance(known, withSlash)
    if (score < bestScore) {
      best = known
      bestScore = score
    }
  }
  return bestScore <= Math.max(3, Math.floor(withSlash.length / 5)) ? best : null
}

/** Sections whose title becomes the page's h1 when they come first (see public-site.jsx). */
const OPENING_H1_SECTIONS = new Set(['installProcessSection'])

/** SEO and structure checks. */
export function seoChecks(document) {
  const findings = []
  const add = (level, message, path, fix) => findings.push({ group: 'SEO', level, message, path, fix })
  const titleFix = (value) => ({
    type: 'text',
    path: ['seo', 'title'],
    label: 'Search title',
    value,
    min: 30,
    max: 60,
  })
  const descriptionFix = (value) => ({
    type: 'text',
    path: ['seo', 'description'],
    label: 'Search description',
    value,
    min: 70,
    max: 160,
    multiline: true,
  })
  const title = (document.seo?.title || document.title || '').trim()
  const description = (document.seo?.description || document.description || '').trim()

  if (title) {
    if (title.length < 30 || title.length > 60) {
      add(
        'warning',
        `Search title is ${title.length} characters. Aim for 30–60 so Google shows it whole.`,
        ['seo', 'title'],
        titleFix(title),
      )
    } else {
      add('ok', `Search title length is good (${title.length} characters).`)
    }
  } else {
    add('error', 'No title. Google needs one to list the page.', ['title'], titleFix(''))
  }

  if (description) {
    if (description.length < 70 || description.length > 160) {
      add(
        'warning',
        `Search description is ${description.length} characters. Aim for 70–160.`,
        ['seo', 'description'],
        descriptionFix(description),
      )
    } else {
      add('ok', `Search description length is good (${description.length} characters).`)
    }
  } else {
    add(
      'warning',
      'No search description. Google will pick text from the page instead.',
      ['seo', 'description'],
      descriptionFix(''),
    )
  }

  const isHome = document.pageType === 'home' || document.slug?.current === '/'
  if (!isHome && document._type !== 'site' && !document.slug?.current) {
    const suggested = slugify(document.title || title)
    add(
      'error',
      'No slug (web address). The page cannot be reached.',
      ['slug'],
      suggested
        ? {
            type: 'set',
            path: ['slug'],
            value: { _type: 'slug', current: suggested },
            label: `Use "${suggested}"`,
          }
        : undefined,
    )
  }

  if (document.seo?.noIndex) {
    add('warning', '"No index" is on: Google will not list this page.', ['seo', 'noIndex'], {
      type: 'set',
      path: ['seo', 'noIndex'],
      value: false,
      label: 'Turn "No index" off',
    })
  }

  const sections = Array.isArray(document.sections) ? document.sections : []
  if (sections.length) {
    const hero = sections.find((section) => section?._type === 'heroSection')
    // Sections that render their title as the page's h1 when they open the page.
    const opensWithHeading = OPENING_H1_SECTIONS.has(sections[0]?._type) && Boolean(sections[0]?.title)
    if (!hero && !opensWithHeading) {
      add('warning', 'No hero section, so the page has no main heading (H1).', ['sections'])
    } else if (hero && !(hero.title || hero.titlePrimary)) {
      add('warning', 'The hero has no headline, so the page has no main heading (H1).', [
        'sections',
        { _key: hero._key },
      ])
    }
  }
  return findings
}

/** The object a path points into, e.g. the card that holds a logo. */
function parentAt(document, path) {
  let node = document
  for (const step of path.slice(0, -1)) {
    node = Array.isArray(node)
      ? typeof step === 'number'
        ? node[step]
        : node.find((item) => item?._key === step?._key)
      : node?.[step]
  }
  return node
}

/**
 * Images with no alt text, which screen readers and Google both rely on. A logo
 * on a card with a title is fine: the site names it "Logo of {title}".
 */
export function imageChecks(document) {
  const findings = []
  walk(document, (value, path) => {
    if (typeof value === 'string' || typeof value?.asset?._ref !== 'string') {
      return
    }
    if (!value.asset._ref.startsWith('image-')) {
      return
    }
    const alt = value.alt || value.altText || value.caption
    if (path.at(-1) === 'logo' && parentAt(document, path)?.title) {
      return
    }
    if (!alt?.trim?.()) {
      // The view picks alt or altText, whichever this image type has.
      findings.push({
        group: 'SEO',
        level: 'warning',
        message: 'Image has no alt text.',
        path,
        fix: { type: 'alt', path, label: 'Alt text', value: '' },
      })
    }
  })
  return findings
}

/** Brand voice checks over every bit of text in the document. */
export function brandChecks(document) {
  const findings = []
  walk(document, (value, path) => {
    if (typeof value !== 'string' || path.at(-1) === '_type' || linkKind(value) !== 'invalid') {
      return
    }
    const credit = TAX_CREDIT.exec(value)
    if (credit) {
      findings.push({
        group: 'Brand',
        level: 'error',
        message: `Mentions "${credit[0]}". The federal solar tax credit expired December 31, 2025; do not reference it.`,
        path,
      })
    }
    const hype = HYPE_WORDS.exec(value)
    if (hype) {
      findings.push({
        group: 'Brand',
        level: 'warning',
        message: `Hype word "${hype[0]}". The voice guide asks for plain, honest words.`,
        path,
      })
    }
  })
  if (!findings.length) {
    findings.push({ group: 'Brand', level: 'ok', message: 'No expired tax credit mentions or hype words.' })
  }
  return findings
}
