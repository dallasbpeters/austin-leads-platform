const API_BASE = 'https://api.vercel.com'

function getVercelConfig() {
  const token = process.env.VERCEL_TOKEN
  const projectIdOrName = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME
  const teamId = process.env.VERCEL_TEAM_ID
  const slug = process.env.VERCEL_TEAM_SLUG

  return {
    token,
    projectIdOrName,
    teamId,
    slug,
    enabled: Boolean(token && projectIdOrName),
  }
}

function buildUrl(pathname) {
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

async function vercelRequest(pathname, init = {}) {
  const config = getVercelConfig()

  if (!config.enabled) {
    return null
  }

  const response = await fetch(buildUrl(pathname), {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
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

function mapVerificationStatus(record) {
  if (record.redirect) {
    return 'redirect-only'
  }

  if (record.verified) {
    return 'active'
  }

  return 'pending'
}

export function isVercelConfigured() {
  return getVercelConfig().enabled
}

function mapProjectDomain(payload) {
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

export async function listProjectDomainsOnVercel() {
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

export async function addDomainToVercel({ domain, redirectTarget = null }) {
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

export async function verifyDomainOnVercel(domain) {
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

export async function getDomainFromVercel(domain) {
  const config = getVercelConfig()

  if (!config.enabled) {
    return null
  }

  const payload = await vercelRequest(`/v9/projects/${config.projectIdOrName}/domains/${domain}`, {
    method: 'GET',
  })

  return mapProjectDomain(payload)
}
