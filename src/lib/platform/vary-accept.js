/*
 * Keeps `Accept` in `Vary` on the designed public pages.
 *
 * A public page URL has three bodies chosen from the `Accept` header (see
 * `src/proxy.js`). The Markdown and lightweight HTML route handlers write
 * `Vary: Accept` themselves. The designed App Router page cannot: every
 * compiled app page (Next's `app-page-runtime` template) ends its header
 * setup with `res.setHeader('Vary', routeModule.getVaryHeader(…))`, which
 * replaces whatever the proxy, `next.config` `headers()` or the server wrote
 * before it. Self-hosted Next re-applies the `headers()` rule afterwards; on
 * Vercel the function's own `Vary` is final. So the one boundary that holds
 * everywhere is `AppPageRouteModule#getVaryHeader`: this wraps it on the
 * compiled runtime every app page bundle shares and appends `Accept` when the
 * route lives under the tenant pages, which covers the designed 200, the
 * designed 404 (rendered by the tenant catch-all) and the RSC responses.
 *
 * The runtime is loaded lazily, only from the Node startup hook
 * (`src/instrumentation.js`), and outside webpack: Next bundles its own
 * server files when user code imports them, which would patch a second copy
 * of the class. The native `import()` resolves `next` from the compiled file,
 * locally and on Vercel, and shares Node's CommonJS cache with the page
 * bundles. `module.compiled` picks the same runtime variant the bundles
 * require for a webpack build (`next build --webpack`).
 *
 * @see https://github.com/vercel/next.js/issues/48480 (custom `Vary` vs. the
 *   App Router `Vary`)
 */

/** Route prefix every designed public page lives under; `TENANT_PREFIX` in `src/proxy.js`. */
export const DESIGNED_PAGE_PATH_PREFIX = '/tenant/'

/** Next's selector for the app-page runtime; the same module every app page bundle requires. */
const APP_PAGE_MODULE = 'next/dist/server/route-modules/app-page/module.compiled.js'

const WRAPPED = Symbol.for('austin-leads.vary-accept-hook')

/**
 * @param {string | null | undefined} pathname - Route (`/tenant/[site]/about`) or resolved path.
 * @returns {boolean} Whether the path belongs to a designed public page.
 */
export function isDesignedPagePath(pathname) {
  return typeof pathname === 'string' && pathname.startsWith(DESIGNED_PAGE_PATH_PREFIX)
}

/**
 * @param {string | null | undefined} value - A `Vary` header value.
 * @returns {boolean} Whether any token in the value already names `Accept`.
 */
export function varyIncludesAccept(value) {
  return (
    typeof value === 'string' && value.split(',').some((token) => token.trim().toLowerCase() === 'accept')
  )
}

/**
 * @param {string} value - A `Vary` header value.
 * @returns {string} The value with `Accept` present exactly once and every other token kept.
 */
export function withAcceptInVary(value) {
  if (varyIncludesAccept(value)) {
    return value
  }
  const current = String(value ?? '').trim()
  return current ? `${current}, Accept` : 'Accept'
}

/**
 * Wrap `AppPageRouteModule#getVaryHeader` so designed pages also vary on `Accept`.
 *
 * @param {(resolvedPathname: string, interceptionRoutePatterns: RegExp[]) => string} original
 * @returns {typeof original} The wrapped method.
 */
export function wrapGetVaryHeader(original) {
  return function getVaryHeader(resolvedPathname, interceptionRoutePatterns) {
    const vary = original.call(this, resolvedPathname, interceptionRoutePatterns)
    if (isDesignedPagePath(this?.definition?.pathname) || isDesignedPagePath(resolvedPathname)) {
      return withAcceptInVary(vary)
    }
    return vary
  }
}

/** @returns {Promise<{ prototype: { getVaryHeader?: Function } }>} The shared `AppPageRouteModule` class. */
async function loadAppPageRouteModule() {
  const loaded = await import(/* webpackIgnore: true */ APP_PAGE_MODULE)
  // A CommonJS module seen through a native import nests its exports under `default`.
  return loaded.AppPageRouteModule ?? loaded.default?.AppPageRouteModule
}

/** @returns {Promise<boolean>} Whether this process already carries the hook. */
export async function isVaryAcceptHookInstalled() {
  const AppPageRouteModule = await loadAppPageRouteModule()
  return AppPageRouteModule?.prototype.getVaryHeader?.[WRAPPED] === true
}

/**
 * Install the hook once per process. Safe to call repeatedly.
 *
 * @returns {Promise<boolean>} `true` when this call installed the hook.
 */
export async function installVaryAcceptHook() {
  const AppPageRouteModule = await loadAppPageRouteModule()
  const proto = AppPageRouteModule?.prototype
  const original = proto?.getVaryHeader
  if (typeof original !== 'function') {
    console.warn(
      '[vary-accept] AppPageRouteModule#getVaryHeader not found; designed pages will not vary on Accept.',
    )
    return false
  }
  if (original[WRAPPED]) {
    return false
  }
  const wrapped = wrapGetVaryHeader(original)
  wrapped[WRAPPED] = true
  proto.getVaryHeader = wrapped
  return true
}
