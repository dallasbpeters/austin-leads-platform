/**
 * Client sections that most pages do not render must stay out of the startup
 * bundle. Next runs every client module that a page's Server Components import
 * at startup, also through `dynamic()`. Only a 'use client' module with a
 * dynamic import() splits them out.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SECTIONS_DIR = path.resolve(import.meta.dirname, '../components/platform/sections')
const LAZY_SECTIONS = ['energy-chart-section', 'calculator-section', 'article-section']

describe('client section code split', () => {
  it('loads the lazy sections only from the client wrapper', () => {
    const registry = readFileSync(path.join(SECTIONS_DIR, 'index.js'), 'utf8')
    const wrapper = readFileSync(path.join(SECTIONS_DIR, 'lazy-client-sections.jsx'), 'utf8')

    expect(wrapper.startsWith("'use client'")).toBeTruthy()
    for (const name of LAZY_SECTIONS) {
      expect(registry).not.toContain(`@/components/${name}'`)
      expect(wrapper).toContain(`dynamic(() => import('@/components/${name}'))`)
    }
  })
})
