/**
 * After `next build`: fail if a PDF route's bundle is missing pdfkit's font file.
 *
 * Next writes the list of files each route ships with to `<route>.js.nft.json`.
 * Vercel deploys exactly those files, so if Helvetica.cjs is not listed, the
 * route throws "Cannot find module .../pdfkit/js/standard-fonts/Helvetica.cjs"
 * in production. See outputFileTracingIncludes in next.config.mjs.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SERVER_APP = path.join(ROOT, '.next/server/app')
const REQUIRED_FILE = 'pdfkit/js/standard-fonts/Helvetica.cjs'

const PDF_ROUTES = [
  'api/quotes/[id]/pdf',
  'api/quotes/[id]/send',
  'api/quotes/[id]/signature',
  'api/quotes/preview-pdf',
  'api/christmas/invoices/[id]/pdf',
  'api/christmas/invoices/[id]/send',
  'api/christmas/invoices/preview-pdf',
]

const failures = []

for (const route of PDF_ROUTES) {
  const traceFile = path.join(SERVER_APP, route, 'route.js.nft.json')
  if (!existsSync(traceFile)) {
    failures.push(`${route}: no trace file at ${path.relative(ROOT, traceFile)}`)
    continue
  }
  const { files } = JSON.parse(readFileSync(traceFile, 'utf8'))
  if (!files.some((file) => file.endsWith(REQUIRED_FILE))) {
    failures.push(`${route}: bundle is missing ${REQUIRED_FILE}`)
  }
}

if (failures.length > 0) {
  console.error('PDF routes would fail in production:')
  for (const failure of failures) {
    console.error(`  - ${failure}`)
  }
  console.error('Fix outputFileTracingIncludes in next.config.mjs.')
  process.exit(1)
}

console.log(`PDF trace check passed for ${PDF_ROUTES.length} routes.`)
