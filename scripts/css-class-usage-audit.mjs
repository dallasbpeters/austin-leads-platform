#!/usr/bin/env node
/**
 * Lists CSS class tokens defined in src/styles/*.css that never appear as a
 * substring in scanned source files. False positives: dynamic class names,
 * CMS-authored HTML, string-split joins, and matches inside comments/strings.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const STYLES_DIR = path.join(ROOT, 'src/styles')

function walkFiles(dir, exts, out = []) {
  if (!fs.existsSync(dir)) {
    return out
  }
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(ent.name)) {
        continue
      }
      walkFiles(p, exts, out)
    } else if (exts.some((ext) => ent.name.endsWith(ext))) {
      out.push(p)
    }
  }
  return out
}

function stripCssComments(src) {
  return src.replaceAll(/\/\*[\s\S]*?\*\//g, '')
}

/** Pull `.ident` tokens from selectors (best-effort; skips `@`-rules bodies poorly). */
function extractClassTokens(cssText) {
  const tokens = new Set()
  const stripped = stripCssComments(cssText)
  // Ignore @keyframes blocks (identifiers inside aren't HTML classes)
  const noKeyframes = stripped.replaceAll(/@keyframes\s+[\s\S]*?\{(?:[^{}]|\{[^}]*\})*\}/g, '')
  const re = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g
  let m
  while ((m = re.exec(noKeyframes)) !== null) {
    tokens.add(m[1])
  }
  return tokens
}

function buildHaystack(files) {
  let blob = ''
  for (const f of files) {
    try {
      blob += fs.readFileSync(f, 'utf-8')
      blob += '\n'
    } catch {
      /* skip */
    }
  }
  return blob
}

const cssPaths = fs.existsSync(STYLES_DIR)
  ? fs
      .readdirSync(STYLES_DIR)
      .filter((n) => n.endsWith('.css'))
      .map((n) => path.join(STYLES_DIR, n))
  : []

/** token -> files that define a selector containing `.token` */
const definitionsByClass = new Map()

let cssBlob = ''
for (const p of cssPaths) {
  const text = fs.readFileSync(p, 'utf-8')
  cssBlob += text
  const stripped = stripCssComments(text)
  const noKeyframes = stripped.replaceAll(/@keyframes\s+[\s\S]*?\{(?:[^{}]|\{[^}]*\})*\}/g, '')
  const rel = path.relative(ROOT, p)
  const re = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g
  let m
  while ((m = re.exec(noKeyframes)) !== null) {
    const cls = m[1]
    if (!definitionsByClass.has(cls)) {
      definitionsByClass.set(cls, new Set())
    }
    definitionsByClass.get(cls).add(rel)
  }
}

const definedClasses = extractClassTokens(cssBlob)

const scanExtensions = ['.jsx', '.tsx', '.js', '.ts', '.mjs', '.html', '.md']
const srcFiles = walkFiles(path.join(ROOT, 'src'), scanExtensions)
const rootHtml = ['index.html', 'dashboard.html', 'publish.html']
  .map((n) => path.join(ROOT, n))
  .filter((p) => fs.existsSync(p))

const haystack = buildHaystack([...srcFiles, ...rootHtml])

/** Tokens that are substring noise from URLs, hex, etc. — keep conservative filter */
const skipTokens = new Set(['css', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'woff', 'woff2', 'ttf'])

const unused = []
for (const cls of [...definedClasses].toSorted()) {
  if (skipTokens.has(cls)) {
    continue
  }
  if (!haystack.includes(cls)) {
    unused.push(cls)
  }
}

const unusedWithSources = unused.map((cls) => ({
  class: cls,
  definedIn: [...(definitionsByClass.get(cls) ?? [])].toSorted(),
}))

console.log(
  JSON.stringify(
    {
      definedCount: definedClasses.size,
      unusedCount: unused.length,
      unusedWithSources,
    },
    null,
    2,
  ),
)
