/** Platform console roles stored on `platform_users.role`. */
export const PLATFORM_ROLES = ['admin', 'quotes']

/** Paths a `quotes` user may open in the admin console. */
export const QUOTES_ALLOWED_PATH_PREFIXES = [
  '/crm',
  '/quotes',
  '/christmas/invoices',
  '/christmas/mockup',
  '/reels',
]

/** API prefixes a `quotes` user may call. */
export const QUOTES_ALLOWED_API_PREFIXES = [
  '/api/crm',
  '/api/quotes',
  '/api/auth',
  '/api/christmas/invoices',
  '/api/christmas/invoice-settings',
  '/api/reels',
]

export function normalizePlatformRole(role) {
  const value = String(role ?? 'admin').toLowerCase()
  return PLATFORM_ROLES.includes(value) ? value : 'admin'
}

export function isQuotesRole(role) {
  return normalizePlatformRole(role) === 'quotes'
}

export function isFullAdminRole(role) {
  return normalizePlatformRole(role) === 'admin'
}

export function defaultAdminHomePath(role) {
  return isQuotesRole(role) ? '/quotes' : '/dashboard'
}

export function canQuotesRoleAccessPath(pathname) {
  if (!pathname) {
    return false
  }
  if (pathname.startsWith('/api/')) {
    return QUOTES_ALLOWED_API_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  }
  return QUOTES_ALLOWED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}
