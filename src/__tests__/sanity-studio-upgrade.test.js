// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Sanity Studio 6.9.2–6.14.0 could drop Portable Text edits: a block removal was
// rewritten to a whole-field unset (sanity-io/sanity#14747, fixed in 6.14.1 through
// the 8.1.5 Portable Text editor). These checks pin the Studio outside that range
// and prove the Studio config plus its Portable Text inputs still load.

const require = createRequire(import.meta.url)

const parseVersion = (version) => version.split('.').map((part) => Number.parseInt(part, 10))

const isAtLeast = (version, minimum) => {
  const actual = parseVersion(version)
  const wanted = parseVersion(minimum)
  for (let index = 0; index < wanted.length; index += 1) {
    if (actual[index] > wanted[index]) {
      return true
    }
    if (actual[index] < wanted[index]) {
      return false
    }
  }
  return true
}

const findPackageJson = (entryFile, name) => {
  let dir = dirname(entryFile)
  while (dir !== dirname(dir)) {
    const candidate = join(dir, 'package.json')
    try {
      const pkg = require(candidate)
      if (pkg.name === name) {
        return pkg
      }
    } catch {
      // Keep walking up until the package root is found.
    }
    dir = dirname(dir)
  }
  throw new Error(`package.json for ${name} not found above ${entryFile}`)
}

const sanityPkg = require('sanity/package.json')
const sanityRequire = createRequire(require.resolve('sanity/package.json'))
const editorPkg = findPackageJson(sanityRequire.resolve('@portabletext/editor'), '@portabletext/editor')

describe('Sanity Studio upgrade', () => {
  it('runs a Studio release outside the Portable Text data-loss range', () => {
    expect(isAtLeast(sanityPkg.version, '6.14.1')).toBeTruthy()
  })

  it('resolves the fixed @portabletext/editor through sanity', () => {
    expect(isAtLeast(editorPkg.version, '8.1.5')).toBeTruthy()
  })

  it('loads the Studio config with its Portable Text schema types', async () => {
    const [{ default: config }, sanity] = await Promise.all([
      import('../../sanity.config.js'),
      import('sanity'),
    ])

    expect(config.name).toBe('default')
    expect(config.plugins.length).toBeGreaterThan(0)
    expect(sanity.PortableTextInput).toBeTypeOf('function')

    const blockFields = config.schema.types.filter(
      (type) => type.type === 'array' && type.of?.some((member) => member.type === 'block'),
    )
    expect(blockFields.map((type) => type.name)).toContain('portableTextSimple')
  })
})
