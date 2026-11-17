/**
 * The `shaders` library (WebGPU) must stay out of the startup bundle.
 *
 * Next runs every client module that a page's Server Components import when the
 * page starts, rendered or not. A static import of the shader hero put the
 * library on every public page, and its startup work made taps wait on phones
 * (INP). Only a 'use client' module with a dynamic import() splits it out.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '../..')
const SRC_DIR = path.join(ROOT, 'src')
const SHADER_DIR = 'components/shaders/'
const LAZY_WRAPPER = 'components/hero-pixel-reveal.jsx'
const SHADER_IMPORT =
  /from\s+['"](?:shaders\/react|[^'"]*\/shaders\/[^'"]+)['"]|import\(\s*['"](?:shaders\/react|[^'"]*\/shaders\/[^'"]+)['"]/

function shaderImporters() {
  return readdirSync(SRC_DIR, { recursive: true })
    .filter((file) => /\.(js|jsx|ts|tsx)$/.test(file))
    .filter((file) => !file.startsWith(SHADER_DIR) && !file.startsWith('__tests__/'))
    .filter((file) => SHADER_IMPORT.test(readFileSync(path.join(SRC_DIR, file), 'utf8')))
}

describe('shader hero code split', () => {
  it('imports the shader components only from the lazy wrapper', () => {
    expect(shaderImporters()).toStrictEqual([LAZY_WRAPPER])
  })

  it('loads them with a dynamic import() behind a client boundary', () => {
    const source = readFileSync(path.join(SRC_DIR, LAZY_WRAPPER), 'utf8')

    expect(source.startsWith("'use client'")).toBeTruthy()
    expect(source).toMatch(/dynamic\(\(\) => import\('\.\/shaders\/PixelReveal1'\)\)/)
    expect(source).not.toMatch(/^import .*shaders/m)
  })
})
