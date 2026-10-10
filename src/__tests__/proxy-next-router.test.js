import { AsyncLocalStorage } from 'node:async_hooks'

import { beforeAll, describe, expect, it, vi } from 'vitest'

/*
 * Runs `src/proxy.js` through the same adapter Next.js uses for middleware,
 * self-hosted and on Vercel, so the request the proxy sees is the request it
 * really gets: the `RSC` / `Next-Router-*` headers and the `_rsc` query are
 * stripped before the proxy runs.
 */
vi.mock(import('next-auth/jwt'), () => ({ getToken: async () => null }))
vi.mock(import('@/sanity/client'), () => ({ getSanityServerClient: () => null }))

/** The adapter expects the global the edge runtime and Vercel's launcher provide. */
let adapter

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const HOST = 'texassolarandroofingpros.com'

async function runProxy(url, headers) {
  const { proxy } = await import('@/proxy')
  const { response } = await adapter({
    handler: proxy,
    page: '/proxy',
    request: {
      url,
      method: 'GET',
      headers: { host: HOST, ...headers },
      nextConfig: {},
    },
  })
  const rewrite = response.headers.get('x-middleware-rewrite')
  return { response, rewritePath: rewrite ? new URL(rewrite).pathname : null, rewrite }
}

describe('proxy behind the Next.js middleware adapter', () => {
  beforeAll(async () => {
    globalThis.AsyncLocalStorage ??= AsyncLocalStorage
    ;({ adapter } = await import('next/dist/server/web/adapter.js'))
  })

  it('strips the RSC headers and the _rsc query before the proxy runs', async () => {
    const seen = {}
    await adapter({
      handler: (request) => {
        seen.rsc = request.headers.get('rsc')
        seen.prefetch = request.headers.get('next-router-prefetch')
        seen.nextUrl = request.headers.get('next-url')
        seen.search = request.nextUrl.search
        return null
      },
      page: '/proxy',
      request: {
        url: `https://${HOST}/about?_rsc=abc12`,
        method: 'GET',
        headers: { host: HOST, rsc: '1', 'next-router-prefetch': '1', 'next-url': '/' },
        nextConfig: {},
      },
    })
    expect(seen).toStrictEqual({ rsc: null, prefetch: null, nextUrl: '/', search: '' })
  })

  it.each([
    ['navigation', { rsc: '1', 'next-router-state-tree': '%5B%22%22%5D', 'next-url': '/' }],
    ['prefetch', { rsc: '1', 'next-router-prefetch': '1', 'next-url': '/' }],
    ['segment prefetch', { rsc: '1', 'next-router-segment-prefetch': '/_tree', 'next-url': '/about' }],
  ])('sends a Next.js router %s to the designed page, with the _rsc query kept', async (_label, flight) => {
    const { rewritePath, rewrite } = await runProxy(`https://${HOST}/about?_rsc=abc12`, {
      ...flight,
      'user-agent': CHROME_UA,
      accept: '*/*',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'sec-fetch-site': 'same-origin',
    })
    expect(rewritePath).toBe('/tenant/texas-solar-and-roofing-pros/about')
    expect(new URL(rewrite).searchParams.get('_rsc')).toBe('abc12')
  })

  it('still sends a browser navigation to the designed page and curl to lightweight HTML', async () => {
    const navigation = await runProxy(`https://${HOST}/about`, {
      'user-agent': CHROME_UA,
      accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-dest': 'document',
    })
    expect(navigation.rewritePath).toBe('/tenant/texas-solar-and-roofing-pros/about')

    const curl = await runProxy(`https://${HOST}/about`, { 'user-agent': 'curl/8.4.0', accept: '*/*' })
    expect(curl.rewritePath).toBe('/agent/html/texas-solar-and-roofing-pros/about')
    expect(curl.response.headers.get('vary')).toBe('Accept')

    const markdown = await runProxy(`https://${HOST}/about`, { accept: 'text/markdown' })
    expect(markdown.rewritePath).toBe('/agent/markdown/texas-solar-and-roofing-pros/about')
  })
})
