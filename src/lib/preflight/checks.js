/*
 * Preflight checks for a Sanity page document, run in Studio before publishing
 * (src/sanity/components/preflight-view.jsx). Pure functions over the document,
 * so they are easy to test; the link reachability check is the only part that
 * needs the network, and it lives in the view and /api/preflight/links.
 *
 * Each finding: { level: 'error' | 'warning' | 'ok', group, message, path? }
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

/** SEO and structure checks. */
export function seoChecks(document) {
  const findings = []
  const add = (level, message, path) => findings.push({ group: 'SEO', level, message, path })
  const title = (document.seo?.title || document.title || '').trim()
  const description = (document.seo?.description || document.description || '').trim()

  if (title) {
    if (title.length < 30 || title.length > 60) {
      add('warning', `Search title is ${title.length} characters. Aim for 30–60 so Google shows it whole.`, [
        'seo',
        'title',
      ])
    } else {
      add('ok', `Search title length is good (${title.length} characters).`)
    }
  } else {
    add('error', 'No title. Google needs one to list the page.', ['title'])
  }

  if (description) {
    if (description.length < 70 || description.length > 160) {
      add('warning', `Search description is ${description.length} characters. Aim for 70–160.`, [
        'seo',
        'description',
      ])
    } else {
      add('ok', `Search description length is good (${description.length} characters).`)
    }
  } else {
    add('warning', 'No search description. Google will pick text from the page instead.', [
      'seo',
      'description',
    ])
  }

  const isHome = document.pageType === 'home' || document.slug?.current === '/'
  if (!isHome && document._type !== 'site' && !document.slug?.current) {
    add('error', 'No slug (web address). The page cannot be reached.', ['slug'])
  }

  if (document.seo?.noIndex) {
    add('warning', '"No index" is on: Google will not list this page.', ['seo', 'noIndex'])
  }

  const sections = Array.isArray(document.sections) ? document.sections : []
  if (sections.length) {
    const hero = sections.find((section) => section?._type === 'heroSection')
    if (!hero) {
      add('warning', 'No hero section, so the page has no main heading (H1).', ['sections'])
    } else if (!(hero.title || hero.titlePrimary)) {
      add('warning', 'The hero has no headline, so the page has no main heading (H1).', [
        'sections',
        { _key: hero._key },
      ])
    }
  }
  return findings
}

/** Images with no alt text, which screen readers and Google both rely on. */
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
    if (!alt?.trim?.()) {
      findings.push({ group: 'SEO', level: 'warning', message: 'Image has no alt text.', path })
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
