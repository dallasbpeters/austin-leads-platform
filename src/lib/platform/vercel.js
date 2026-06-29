import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const API_BASE = 'https://api.vercel.com'

let linkedProjectConfig = null

const getLinkedProjectConfig = () => {
  if (linkedProjectConfig !== null) {
    return linkedProjectConfig
  }

  const configPath = path.join(process.cwd(), '.vercel', 'project.json')

  if (!existsSync(configPath)) {
    linkedProjectConfig = null
    return linkedProjectConfig
  }

  try {
    const parsed = JSON.parse(readFileSync(configPath, 'utf-8'))
    linkedProjectConfig = {
      projectId: parsed?.projectId || '',
      projectName: parsed?.projectName || '',
      orgId: parsed?.orgId || '',
    }
  } catch {
    linkedProjectConfig = null
  }

  return linkedProjectConfig
}

const getVercelConfig = () => {
  const linkedProject = getLinkedProjectConfig()
  const token = process.env.VERCEL_TOKEN
  const projectIdOrName =
    process.env.VERCEL_PROJECT_ID ||
    process.env.VERCEL_PROJECT_NAME ||
    linkedProject?.projectId ||
    linkedProject?.projectName
  const teamId = process.env.VERCEL_TEAM_ID || linkedProject?.orgId
  const slug = process.env.VERCEL_TEAM_SLUG

  return {
    token,
    projectIdOrName,
    teamId,
    slug,
    enabled: Boolean(token && projectIdOrName),
  }
}

const buildUrl = (pathname) => {
  const config = getVercelConfig()
  const url = new URL(pathname, API_BASE)

  if (config.teamId) {
    url.searchParams.set('teamId', config.teamId)
  }

  if (config.slug) {
    url.searchParams.set('slug', config.slug)
  }

  return url
}

const vercelRequest = async (pathname, init = {}) => {
  const config = getVercelConfig()

  if (!config.enabled) {
    return null
  }

  const response = await fetch(buildUrl(pathname), {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(json.error?.message || 'Vercel request failed.')
    error.status = response.status
    error.details = json
    throw error
  }

  return json
}

const mapVerificationStatus = (record) => {
  if (record.redirect) {
    return 'redirect-only'
  }

  if (record.verified) {
    return 'active'
  }

  return 'pending'
}

export const isVercelConfigured = () => {
  return getVercelConfig().enabled
}

const mapProjectDomain = (payload) => {
  return {
    domain: payload.name,
    apexName: payload.apexName,
    projectId: payload.projectId,
    redirectTarget: payload.redirect ?? null,
    verified: payload.verified,
    verificationStatus: mapVerificationStatus(payload),
    dnsInstructions: payload.verification ?? [],
    gitBranch: payload.gitBranch ?? null,
    updatedAt: payload.updatedAt ?? null,
    createdAt: payload.createdAt ?? null,
    mode: 'vercel',
  }
}

export const listProjectDomainsOnVercel = async () => {
  const config = getVercelConfig()

  if (!config.enabled) {
    return []
  }

  const payload = await vercelRequest(
    `/v9/projects/${config.projectIdOrName}/domains?limit=100&redirects=true`,
    {
      method: 'GET',
    },
  )

  return Array.isArray(payload?.domains) ? payload.domains.map(mapProjectDomain) : []
}

export const addDomainToVercel = async ({ domain, redirectTarget = null }) => {
  const config = getVercelConfig()

  if (!config.enabled) {
    return {
      domain,
      projectId: config.projectIdOrName ?? 'local-project',
      verified: false,
      verificationStatus: redirectTarget ? 'redirect-only' : 'pending',
      dnsInstructions: [
        {
          type: 'TXT',
          domain: `_vercel.${domain}`,
          value: `vc-domain-verify=${domain},placeholder`,
          reason: 'Connect VERCEL_TOKEN and VERCEL_PROJECT_ID to enable live verification.',
        },
      ],
      mode: 'placeholder',
    }
  }

  const payload = await vercelRequest(`/v10/projects/${config.projectIdOrName}/domains`, {
    method: 'POST',
    body: JSON.stringify({
      name: domain,
      redirect: redirectTarget,
      redirectStatusCode: redirectTarget ? 308 : null,
      gitBranch: null,
    }),
  })

  return mapProjectDomain(payload)
}

export const verifyDomainOnVercel = async (domain) => {
  const config = getVercelConfig()

  if (!config.enabled) {
    return {
      domain,
      verified: false,
      verificationStatus: 'pending',
      dnsInstructions: [
        {
          type: 'TXT',
          domain: `_vercel.${domain}`,
          value: `vc-domain-verify=${domain},placeholder`,
          reason: 'Live verification is unavailable until Vercel credentials are configured.',
        },
      ],
      mode: 'placeholder',
    }
  }

  const payload = await vercelRequest(`/v9/projects/${config.projectIdOrName}/domains/${domain}/verify`, {
    method: 'POST',
  })

  return mapProjectDomain(payload)
}

export const getDomainFromVercel = async (domain) => {
  const config = getVercelConfig()

  if (!config.enabled) {
    return null
  }

  const payload = await vercelRequest(`/v9/projects/${config.projectIdOrName}/domains/${domain}`, {
    method: 'GET',
  })

  return mapProjectDomain(payload)
}

export const updateDomainOnVercel = async (domain, { redirectTarget = null } = {}) => {
  const config = getVercelConfig()

  if (!config.enabled) {
    return {
      domain,
      redirectTarget,
      verified: false,
      verificationStatus: redirectTarget ? 'redirect-only' : 'pending',
      dnsInstructions: [],
      mode: 'placeholder',
    }
  }

  const payload = await vercelRequest(`/v9/projects/${config.projectIdOrName}/domains/${domain}`, {
    method: 'PATCH',
    body: JSON.stringify({
      redirect: redirectTarget,
      redirectStatusCode: redirectTarget ? 308 : null,
      gitBranch: null,
    }),
  })

  return mapProjectDomain(payload)
}

export const removeDomainFromVercel = async (domain) => {
  const config = getVercelConfig()

  if (!config.enabled) {
    return { domain, removed: true, mode: 'placeholder' }
  }

  await vercelRequest(`/v9/projects/${config.projectIdOrName}/domains/${domain}`, {
    method: 'DELETE',
  })

  return { domain, removed: true, mode: 'vercel' }
}
