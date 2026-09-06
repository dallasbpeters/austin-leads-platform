/*
 * Reports, for every page section type, which schema fields the renderer code
 * reads and which fields hold data in the published dataset.
 *
 *   node --env-file=.env --env-file-if-exists=.env.local scripts/schema-usage-dump.mjs > usage.json
 *   node scripts/audit-schema-fields.mjs usage.json > docs/schema-field-audit.md
 *
 * Code usage is a text heuristic: a field counts as used when the renderer, its
 * one-hop local imports, or the shared content helpers reference it as a
 * property or destructure it. Treat "unused" as a candidate list, not a verdict.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const schema = readFileSync(path.join(ROOT, 'src/sanity/schemaTypes/page-type.js'), 'utf8').split('\n')
const usage = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const registrySource = readFileSync(path.join(ROOT, 'src/components/platform/sections/index.js'), 'utf8')

const SHARED_FIELDS = new Set(['type', 'sectionBackgroundColor', 'sectionBackgroundImage', 'cloudVisibility'])
const SHARED_CODE = [
  'src/lib/platform/content.js',
  'src/lib/platform/section-helpers.js',
  'src/components/platform/public-site.jsx',
  'src/components/platform/sections/section-surface.jsx',
]
  .map((f) => path.join(ROOT, f))
  .filter(existsSync)
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n')

/* ---- schema parsing ---- */
const blocks = {}
let current = null
for (let i = 0; i < schema.length; i += 1) {
  const line = schema[i]
  const top = line.match(/^  name: '([A-Za-z]+)',$/)
  if (top) {
    current = top[1]
    blocks[current] = { start: i, fields: [], itemTypes: new Set(), shortType: null }
    continue
  }
  if (!current) continue
  if (/^(const|export const|function) /.test(line)) {
    current = null
    continue
  }
  const b = blocks[current]
  const field = line.match(/^      name: '([A-Za-z]+)',?$/)
  if (field) {
    const typeLine = schema.slice(i, i + 6).find((l) => /^      type: '/.test(l))
    b.fields.push({ name: field[1], type: typeLine ? typeLine.match(/type: '([A-Za-z]+)'/)[1] : '?' })
  }
  const inlineField = line.match(/^    \{ name: '([A-Za-z]+)', title: '[^']*', type: '([A-Za-z]+)'/)
  if (inlineField) b.fields.push({ name: inlineField[1], type: inlineField[2] })
  const of = line.match(/of: \[\{ type: '([A-Za-z]+)' \}/)
  if (of && of[1] !== 'string') b.itemTypes.add(of[1])
  const st = line.match(/^    type: '([A-Za-z]+)',$/)
  if (st && !b.shortType && /initialValue/.test(schema[i - 1] || '')) b.shortType = st[1]
}

/* ---- renderer resolution ---- */
const importPaths = Object.fromEntries(
  [
    ...registrySource.matchAll(
      /(?:import \{ (\w+) \}|const (\w+) = dynamic\(\(\) => import\(|import (\w+) )[^'\n]*'([^']+)'/g,
    ),
  ].map((m) => [m[1] || m[2] || m[3], m[4]]),
)
const registry = Object.fromEntries(
  [...registrySource.matchAll(/^\s{2}(\w+): (\w+),$/gm)].map((m) => [m[1], m[2]]),
)
const resolveFile = (spec, fromDir) => {
  const base = spec.startsWith('@/') ? path.join(ROOT, 'src', spec.slice(2)) : path.resolve(fromDir, spec)
  for (const ext of ['', '.jsx', '.js', '.tsx', '.ts', '/index.js', '/index.jsx'])
    if (existsSync(base + ext) && !base.endsWith('/')) {
      try {
        readFileSync(base + ext)
        return base + ext
      } catch {}
    }
  return null
}
const rendererText = (shortType) => {
  const comp = registry[shortType]
  const spec = importPaths[comp]
  const file = spec && resolveFile(spec, path.join(ROOT, 'src/components/platform/sections'))
  if (!file) return { files: [], text: '' }
  const files = [file]
  let text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(/from '(\.[^']+|@\/components\/[^']+|@\/lib\/platform\/[^']+)'/g)) {
    const f = resolveFile(m[1], path.dirname(file))
    if (f && !files.includes(f)) {
      files.push(f)
      text += '\n' + readFileSync(f, 'utf8')
    }
  }
  return { files: files.map((f) => path.relative(ROOT, f)), text }
}
const usedInCode = (text, name) =>
  new RegExp(`[.?]${name}\\b|\\{[^}]*\\b${name}\\b[^}]*\\}\\s*=|\\[['"]${name}['"]\\]`).test(text)

/* ---- report ---- */
const out = [
  '# Schema field audit',
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} from ${usage.docs} published pages.`,
  '',
  'Code = the renderer (plus its local imports and the shared content helpers) references the field. Data = how many published sections hold a value. **Unused** = no code, no data. **Data only** = content exists but nothing renders it.',
  '',
]
const totals = { fields: 0, unused: 0, dataOnly: 0 }
for (const [name, b] of Object.entries(blocks)
  .filter(([n]) => n.endsWith('Section'))
  .sort()) {
  const short = b.shortType || name.replace(/Section$/, '')
  const { files, text } = rendererText(short)
  const count = usage.sectionCount[name] || 0
  out.push(
    `## ${name} (${short}) · ${count} in data`,
    '',
    files.length ? `Renderer: ${files.map((f) => `\`${f}\``).join(', ')}` : '**No renderer registered.**',
    '',
    '| Field | Type | Renderer | Helpers | Data | Verdict |',
    '|---|---|---|---|---|---|',
  )
  const row = (f, prefix, dataCount) => {
    const inRenderer = usedInCode(text, f.name)
    const inHelpers = usedInCode(SHARED_CODE, f.name)
    const inCode = inRenderer || inHelpers
    const shared = SHARED_FIELDS.has(f.name) && !prefix
    const verdict = shared
      ? 'shared wrapper'
      : inRenderer && dataCount
        ? 'keep'
        : inRenderer
          ? 'keep (no data yet)'
          : inHelpers
            ? dataCount
              ? 'helpers only'
              : '**helpers only, no data**'
            : dataCount
              ? '**data only**'
              : '**unused**'
    if (!shared) {
      totals.fields += 1
      if (verdict === '**unused**') totals.unused += 1
      if (verdict === '**data only**') totals.dataOnly += 1
    }
    out.push(
      `| ${prefix}${f.name} | ${f.type} | ${inRenderer ? 'yes' : 'no'} | ${inHelpers ? 'yes' : 'no'} | ${dataCount || 0} | ${verdict} |`,
    )
  }
  for (const f of b.fields) row(f, '', usage.sectionFields[name]?.[f.name] || 0)
  for (const it of b.itemTypes) {
    const itemBlock = blocks[it]
    if (!itemBlock) continue
    const arrayField = b.fields.find((f) => f.type === 'array')?.name || 'items'
    for (const f of itemBlock.fields)
      row(
        f,
        `${arrayField}[].`,
        Object.entries(usage.itemFields[name] || {})
          .filter(([k]) => k.endsWith(`.${f.name}`))
          .reduce((a, [, v]) => a + v, 0),
      )
  }
  out.push('')
}
out.push(
  `## Totals`,
  '',
  `${totals.fields} fields checked. ${totals.unused} unused. ${totals.dataOnly} data only.`,
  '',
)
process.stdout.write(out.join('\n'))
