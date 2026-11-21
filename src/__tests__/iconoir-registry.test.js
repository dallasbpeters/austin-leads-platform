/**
 * The static icon registry must stay small.
 *
 * Each Iconoir icon is a client module, and Next runs every client module that
 * a page's Server Components import at startup. With all icons in the registry,
 * that startup work made taps wait on phones (INP). The registry holds only the
 * icons the CMS uses, and any other Iconoir name loads on demand.
 */
import * as regularIcons from 'iconoir-react/regular'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import IconoirLazyIcon from '@/components/iconoir-lazy-icon'
import { iconoirRegistry } from '@/components/iconoir-registry'
import { iconoirIconNames } from '@/lib/iconoir-icon-names'
import { legacyIconNameMap, resolveIconoirIcon, serviceIconNameMap } from '@/lib/resolve-icon'

const ROOT = path.resolve(import.meta.dirname, '../..')

function studioIconoirOptions() {
  const source = readFileSync(path.join(ROOT, 'src/sanity/schemaTypes/page-type.js'), 'utf8')
  const block = source.split('const publicSiteIconoirOptions = [')[1].split(']')[0]
  return [...block.matchAll(/value: '([^']+)'/g)].map((match) => match[1])
}

describe('iconoir registry', () => {
  it('lists every regular Iconoir icon name', () => {
    const exported = Object.keys(regularIcons).filter(
      (name) => /^[A-Z]/.test(name) && name !== 'IconoirContext' && name !== 'IconoirProvider',
    )

    expect(iconoirIconNames.toSorted()).toStrictEqual(exported.toSorted())
  })

  it('statically registers a small set of icons', () => {
    expect(Object.keys(iconoirRegistry).length).toBeLessThan(300)
  })

  it('statically registers every Studio dropdown icon and alias target', () => {
    const names = [
      ...studioIconoirOptions(),
      ...Object.values(serviceIconNameMap),
      ...Object.values(legacyIconNameMap),
    ]

    expect(names.length).toBeGreaterThan(100)
    expect(names.filter((name) => !iconoirRegistry[name])).toStrictEqual([])
  })

  it('resolves a registered icon to its static component', () => {
    expect(resolveIconoirIcon('sun-light')).toBe(iconoirRegistry.SunLight)
    expect(resolveIconoirIcon('shingles')).toBe(iconoirRegistry.HomeShield)
  })

  it('resolves any other Iconoir name to one stable lazy component', () => {
    const Icon = resolveIconoirIcon('Windows')
    const element = Icon({ width: 18 })

    expect(iconoirRegistry.Windows).toBeUndefined()
    expect(resolveIconoirIcon('windows-logo')).toBeNull()
    expect(resolveIconoirIcon('Windows')).toBe(Icon)
    expect(element.type).toBe(IconoirLazyIcon)
    expect(element.props).toStrictEqual({ width: 18, name: 'Windows' })
  })

  it('resolves an unknown name to null', () => {
    expect(resolveIconoirIcon('not-an-icon')).toBeNull()
  })
})
