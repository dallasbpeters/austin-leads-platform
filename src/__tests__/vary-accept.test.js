import http from 'node:http'

import { beforeAll, describe, expect, it, vi } from 'vitest'

import {
  DESIGNED_PAGE_REPRESENTATION,
  installVaryAcceptHook,
  isDesignedPageRequest,
  isVaryAcceptHookInstalled,
  PUBLIC_REPRESENTATION_HEADER,
  varyIncludesAccept,
  withAcceptInVary,
} from '@/lib/platform/vary-accept'

/* The `Vary` Next.js writes on every App Router response, as an array because
 * `NodeNextResponse.appendHeader` passes one. */
const NEXT_VARY = 'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch'

vi.mock(import('@/sanity/write-token-health'), () => ({ checkSanityWriteToken: async () => null }))
vi.mock(import('@/lib/posthog-logs'), () => ({}))

/**
 * A real Node response, as the Next.js server and the Vercel launcher use.
 *
 * @param {Record<string, string>} headers - Request headers the proxy forwarded.
 */
function createResponse(headers = {}) {
  const req = new http.IncomingMessage(null)
  req.url = '/tenant/texas-solar-and-roofing-pros/about'
  req.headers = headers
  return new http.ServerResponse(req)
}

function flatten(value) {
  return (Array.isArray(value) ? value : [value]).join(', ')
}

describe(withAcceptInVary, () => {
  it('keeps every Next.js token and adds Accept once', () => {
    expect(withAcceptInVary([NEXT_VARY])).toStrictEqual([NEXT_VARY, 'Accept'])
    expect(withAcceptInVary(NEXT_VARY)).toBe(`${NEXT_VARY}, Accept`)
  })

  it('leaves a value that already varies on Accept alone', () => {
    expect(withAcceptInVary('Accept')).toBe('Accept')
    expect(withAcceptInVary(['accept', NEXT_VARY])).toStrictEqual(['accept', NEXT_VARY])
    expect(varyIncludesAccept(`${NEXT_VARY}, accept`)).toBeTruthy()
    expect(varyIncludesAccept(NEXT_VARY)).toBeFalsy()
  })

  it('handles an empty value', () => {
    expect(withAcceptInVary('')).toBe('Accept')
  })
})

describe(isDesignedPageRequest, () => {
  it('only matches the marker the proxy sets on designed pages', () => {
    expect(isDesignedPageRequest({ headers: { [PUBLIC_REPRESENTATION_HEADER]: 'page' } })).toBeTruthy()
    expect(isDesignedPageRequest({ headers: { [PUBLIC_REPRESENTATION_HEADER]: 'markdown' } })).toBeFalsy()
    expect(isDesignedPageRequest({ headers: {} })).toBeFalsy()
    expect(isDesignedPageRequest(null)).toBeFalsy()
  })
})

describe(installVaryAcceptHook, () => {
  beforeAll(async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    const { register } = await import('@/instrumentation')
    await register()
  })

  it('is installed by the startup hook, once', () => {
    expect(isVaryAcceptHookInstalled()).toBeTruthy()
    expect(installVaryAcceptHook()).toBeFalsy()
  })

  it('adds Accept to the Vary that Next.js writes on a designed page', () => {
    const res = createResponse({ [PUBLIC_REPRESENTATION_HEADER]: DESIGNED_PAGE_REPRESENTATION })
    res.setHeader('vary', [NEXT_VARY])
    const vary = flatten(res.getHeader('vary'))
    expect(vary).toContain('rsc')
    expect(vary).toContain('next-router-state-tree')
    expect(varyIncludesAccept(vary)).toBeTruthy()
  })

  it('also covers the designed 404 and keeps Accept unique across appends', () => {
    const res = createResponse({ [PUBLIC_REPRESENTATION_HEADER]: DESIGNED_PAGE_REPRESENTATION })
    res.statusCode = 404
    res.setHeader('vary', [NEXT_VARY])
    res.setHeader('vary', [...[res.getHeader('vary')].flat(), `${NEXT_VARY}, next-url`])
    const tokens = flatten(res.getHeader('vary'))
      .split(',')
      .map((token) => token.trim().toLowerCase())
    expect(tokens.filter((token) => token === 'accept')).toHaveLength(1)
    expect(tokens).toContain('next-url')
  })

  it('leaves responses the proxy did not mark alone', () => {
    const res = createResponse()
    res.setHeader('vary', [NEXT_VARY])
    expect(flatten(res.getHeader('vary'))).toBe(NEXT_VARY)

    const other = createResponse({ [PUBLIC_REPRESENTATION_HEADER]: DESIGNED_PAGE_REPRESENTATION })
    other.setHeader('content-type', 'text/html; charset=utf-8')
    expect(other.getHeader('content-type')).toBe('text/html; charset=utf-8')
    expect(other.getHeader('vary')).toBeUndefined()
  })
})
