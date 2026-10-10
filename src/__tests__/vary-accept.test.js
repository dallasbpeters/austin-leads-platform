import { AppPageRouteModule } from 'next/dist/server/route-modules/app-page/module.compiled.js'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import {
  installVaryAcceptHook,
  isDesignedPagePath,
  isVaryAcceptHookInstalled,
  varyIncludesAccept,
  withAcceptInVary,
  wrapGetVaryHeader,
} from '@/lib/platform/vary-accept'

vi.mock(import('@/sanity/write-token-health'), () => ({ checkSanityWriteToken: async () => null }))
vi.mock(import('@/lib/posthog-logs'), () => ({}))

/** The `Vary` Next.js writes on every App Router page response. */
const NEXT_VARY = 'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch'
const NO_INTERCEPTION = []

/**
 * A route module as each compiled page bundle builds it: the shared class
 * plus the page's own `definition`.
 *
 * @param {string} pathname - Route pathname, e.g. `/tenant/[site]/about`.
 */
function routeModuleFor(pathname) {
  return Object.assign(Object.create(AppPageRouteModule.prototype), { definition: { pathname } })
}

function tokensOf(vary) {
  return vary.split(',').map((token) => token.trim().toLowerCase())
}

describe(isDesignedPagePath, () => {
  it.each([
    ['/tenant/[site]/[[...slug]]', true],
    ['/tenant/[site]/about', true],
    ['/tenant/texas-solar-and-roofing-pros', true],
    ['/tenant/texas-solar-and-roofing-pros/no-such-page', true],
    ['/agent/html/[site]/[[...slug]]', false],
    ['/tenant', false],
    ['/dashboard', false],
    [null, false],
  ])('matches only the tenant routes the designed pages live under: %s', (pathname, expected) => {
    expect(isDesignedPagePath(pathname)).toBe(expected)
  })
})

describe(withAcceptInVary, () => {
  it.each([
    [NEXT_VARY, `${NEXT_VARY}, Accept`],
    [`${NEXT_VARY}, accept`, `${NEXT_VARY}, accept`],
    ['Accept', 'Accept'],
    ['', 'Accept'],
  ])('adds Accept once and keeps every other token: %j', (value, expected) => {
    expect(withAcceptInVary(value)).toBe(expected)
  })

  it.each([
    [`${NEXT_VARY}, accept`, true],
    [NEXT_VARY, false],
    ['Accept-Encoding', false],
    [null, false],
  ])('varyIncludesAccept(%j)', (value, expected) => {
    expect(varyIncludesAccept(value)).toBe(expected)
  })
})

describe(wrapGetVaryHeader, () => {
  it('runs the original with the same receiver and arguments', () => {
    const original = vi.fn(() => NEXT_VARY)
    const module = routeModuleFor('/dashboard')
    const vary = wrapGetVaryHeader(original).call(module, '/dashboard', NO_INTERCEPTION)
    expect(vary).toBe(NEXT_VARY)
    expect(original.mock.contexts).toStrictEqual([module])
    expect(original.mock.calls).toStrictEqual([['/dashboard', NO_INTERCEPTION]])
  })

  it('appends Accept from the route definition or the resolved path', () => {
    const wrapped = wrapGetVaryHeader(() => NEXT_VARY)
    expect(wrapped.call(routeModuleFor('/tenant/[site]/about'), '/tenant/x/about', NO_INTERCEPTION)).toBe(
      `${NEXT_VARY}, Accept`,
    )
    expect(wrapped.call({}, '/tenant/x/about', NO_INTERCEPTION)).toBe(`${NEXT_VARY}, Accept`)
    expect(wrapped.call(routeModuleFor('/api/health'), '/api/health', NO_INTERCEPTION)).toBe(NEXT_VARY)
  })
})

describe(installVaryAcceptHook, () => {
  beforeAll(async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    const { register } = await import('@/instrumentation')
    await register()
  })

  it('is installed by the startup hook on the shared app-page runtime, once', async () => {
    await expect(isVaryAcceptHookInstalled()).resolves.toBeTruthy()
    await expect(installVaryAcceptHook()).resolves.toBeFalsy()
  })

  it.each([
    ['a designed page', '/tenant/[site]/about', '/tenant/texas-solar-and-roofing-pros/about'],
    [
      'the designed 404',
      '/tenant/[site]/[[...slug]]',
      '/tenant/texas-solar-and-roofing-pros/no-such-page-xyz',
    ],
  ])('adds Accept to the Vary Next.js computes for %s', (_label, route, resolvedPathname) => {
    const tokens = tokensOf(routeModuleFor(route).getVaryHeader(resolvedPathname, NO_INTERCEPTION))
    expect(tokens).toStrictEqual([...NEXT_VARY.split(', '), 'accept'])
  })

  it('keeps Next-Url on interceptable paths', () => {
    const vary = routeModuleFor('/tenant/[site]/about').getVaryHeader('/tenant/x/about', [/^\/tenant\/.*/])
    expect(tokensOf(vary)).toStrictEqual([...NEXT_VARY.split(', '), 'next-url', 'accept'])
  })

  it('leaves every other page alone', () => {
    for (const route of ['/dashboard', '/agent/html/[site]/[[...slug]]', '/']) {
      expect(routeModuleFor(route).getVaryHeader(route, NO_INTERCEPTION)).toBe(NEXT_VARY)
    }
  })
})
