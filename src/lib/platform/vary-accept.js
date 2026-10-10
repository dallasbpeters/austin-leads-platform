/*
 * Keeps `Accept` in `Vary` on the designed public pages.
 *
 * A public page URL has three bodies chosen from the `Accept` header (see
 * `src/proxy.js`). The Markdown and lightweight HTML route handlers write
 * `Vary: Accept` themselves. The designed App Router page cannot: Next.js
 * writes its own `Vary` (`RSC, Next-Router-State-Tree, …`) from inside the
 * render, and on Vercel the function's own headers win over the proxy's
 * response headers and over `next.config` `headers()` (both are routing-layer
 * headers, and `@vercel/next` does not mark them `important`). The only
 * `Vary` that survives there is the one the function itself writes, so this
 * hooks `ServerResponse.setHeader`, which is where Next appends its `Vary`,
 * and adds `Accept` on the responses the proxy marked as designed pages.
 *
 * @see https://github.com/vercel/next.js/issues/48480 (custom `Vary` vs. the
 *   App Router `Vary`; self-hosted Next now appends, Vercel still replaces)
 */
import http from 'node:http'

/** Request header the proxy adds when it rewrites a public URL to the designed page. */
export const PUBLIC_REPRESENTATION_HEADER = 'x-public-representation'
export const DESIGNED_PAGE_REPRESENTATION = 'page'

const INSTALLED = Symbol.for('austin-leads.vary-accept-hook')

function toValues(value) {
  return Array.isArray(value) ? value : [value]
}

/**
 * @param {string | number | readonly string[]} value - Current `Vary` value(s).
 * @returns {boolean} Whether any token in the value already names `Accept`.
 */
export function varyIncludesAccept(value) {
  return toValues(value).some((entry) =>
    String(entry)
      .split(',')
      .some((token) => token.trim().toLowerCase() === 'accept'),
  )
}

/**
 * Add `Accept` to a `Vary` value, keeping every token Next.js wrote.
 *
 * @param {string | number | readonly string[]} value - Current `Vary` value(s).
 * @returns {string | string[]} The value with `Accept` present exactly once.
 */
export function withAcceptInVary(value) {
  if (varyIncludesAccept(value)) {
    return Array.isArray(value) ? [...value] : String(value)
  }
  if (Array.isArray(value)) {
    return [...value.map(String), 'Accept']
  }
  const current = String(value).trim()
  return current ? `${current}, Accept` : 'Accept'
}

/**
 * @param {import('node:http').IncomingMessage | undefined} req
 * @returns {boolean} Whether the proxy marked this request as the designed page.
 */
export function isDesignedPageRequest(req) {
  const marker = req?.headers?.[PUBLIC_REPRESENTATION_HEADER]
  return (Array.isArray(marker) ? marker[0] : marker) === DESIGNED_PAGE_REPRESENTATION
}

/** @returns {boolean} Whether this process already carries the hook. */
export function isVaryAcceptHookInstalled() {
  return http.ServerResponse.prototype[INSTALLED] === true
}

/**
 * Install the hook once per process. Safe to call repeatedly.
 *
 * @returns {boolean} `true` when this call installed the hook.
 */
export function installVaryAcceptHook() {
  const proto = http.ServerResponse.prototype
  if (proto[INSTALLED]) {
    return false
  }
  const originalSetHeader = proto.setHeader
  proto.setHeader = function setHeader(name, value) {
    if (typeof name === 'string' && name.toLowerCase() === 'vary' && isDesignedPageRequest(this.req)) {
      return originalSetHeader.call(this, name, withAcceptInVary(value))
    }
    return originalSetHeader.call(this, name, value)
  }
  proto[INSTALLED] = true
  return true
}
