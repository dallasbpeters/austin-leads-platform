/**
 * PDF routes need pdfkit's font files in their Vercel bundle.
 *
 * pdfkit (pulled in by @react-pdf/renderer) loads fonts through package "imports",
 * like require('#standard-fonts/Helvetica'). Next's file tracer can't follow that,
 * so unless next.config.mjs lists the files in outputFileTracingIncludes, the
 * deployed route fails with:
 *   Cannot find module '.../pdfkit/js/standard-fonts/Helvetica.cjs'
 *
 * This test runs without a build. scripts/check-pdf-trace.mjs checks the real
 * build output after `next build`.
 */
import { globSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import nextConfig from '../../next.config.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')
const APP_DIR = path.join(ROOT, 'src/app')
const PDF_MODULES = /lib\/quotes\/pdf|lib\/christmas\/invoice-pdf|@react-pdf\/renderer/
const REQUIRED_FILE = 'pdfkit/js/standard-fonts/Helvetica.cjs'

/** API route files that make PDFs, as Next route paths such as /api/quotes/[id]/pdf. */
function pdfRoutes() {
  return readdirSync(APP_DIR, { recursive: true })
    .filter((file) => /(^|\/)route\.(js|jsx|ts|tsx)$/.test(file))
    .filter((file) => PDF_MODULES.test(readFileSync(path.join(APP_DIR, file), 'utf8')))
    .map((file) =>
      `/${path.dirname(file)}`
        .split('/')
        .filter((part) => !/^\(.*\)$/.test(part)) // route groups like (site) are not in the path
        .join('/'),
    )
}

/** Every file the config adds to a route's bundle. */
function includedFiles(route) {
  const includes = nextConfig.outputFileTracingIncludes || {}
  return Object.entries(includes)
    .filter(([pattern]) => path.matchesGlob(route, pattern))
    .flatMap(([, globs]) => globs)
    .flatMap((glob) => globSync(glob, { cwd: ROOT }))
}

describe('PDF routes bundle pdfkit fonts', () => {
  const routes = pdfRoutes()

  it('finds the PDF routes', () => {
    expect(routes).toContain('/api/quotes/[id]/pdf')
    expect(routes).toContain('/api/christmas/invoices/[id]/pdf')
  })

  it.each(routes)('%s includes the Helvetica font file', (route) => {
    const files = includedFiles(route)
    expect(files.some((file) => file.endsWith(REQUIRED_FILE))).toBe(true)
  })
})
