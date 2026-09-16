import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/*
 * Vercel project environment variables and redeploys, for the Social accounts
 * page. Uses VERCEL_TOKEN. The project comes from VERCEL_PROJECT_ID (Vercel
 * sets it on every deployment) or the local `.vercel/project.json`; the team
 * from VERCEL_TEAM_ID, the link file, or — failing both — the token's teams.
 */

const API = 'https://api.vercel.com'
const env = (name) => (process.env[name] || '').trim()

const linked = () => {
  const file = path.join(process.cwd(), '.vercel', 'project.json')
  if (!existsSync(file)) {
    return {}
  }
  try {
    return JSON.parse(readFileSync(file, 'utf-8'))
  } catch {
    return {}
  }
}

const projectId = () => env('VERCEL_PROJECT_ID') || linked().projectId || ''

export const vercelReady = () => Boolean(env('VERCEL_TOKEN') && projectId())

async function call(pathname, { team, method = 'GET', body } = {}) {
  const url = new URL(pathname, API)
  if (team) {
    url.searchParams.set('teamId', team)
  }
  const init = {
    method,
    headers: { Authorization: `Bearer ${env('VERCEL_TOKEN')}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  }
  if (body) {
    init.body = JSON.stringify(body)
  }
  const response = await fetch(url, init)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(`Vercel: ${payload.error?.message || response.status}`)
    error.status = response.status
    throw error
  }
  return payload
}

let cachedTeam = null

/** The team that owns the project. A token scoped to a team needs it on every call. */
async function teamId() {
  if (cachedTeam !== null) {
    return cachedTeam
  }
  const known = env('VERCEL_TEAM_ID') || linked().orgId || ''
  if (known) {
    cachedTeam = known
    return cachedTeam
  }
  try {
    await call(`/v9/projects/${projectId()}`)
    cachedTeam = ''
    return cachedTeam
  } catch {
    const { teams = [] } = await call('/v2/teams?limit=50')
    for (const team of teams) {
      try {
        await call(`/v9/projects/${projectId()}`, { team: team.id })
        cachedTeam = team.id
        return cachedTeam
      } catch {
        // Not this team.
      }
    }
  }
  throw new Error('Vercel: the token cannot see this project. Check VERCEL_TOKEN and VERCEL_PROJECT_ID.')
}

/** Every variable on the project: key, id, targets and type. Never values. */
export async function listVercelEnv() {
  const team = await teamId()
  const { envs = [] } = await call(`/v10/projects/${projectId()}/env`, { team })
  return envs.map(({ id, key, target, type }) => ({ id, key, target: target || [], type }))
}

/*
 * Sets a variable everywhere it already exists, or creates it. Secrets are
 * "sensitive" (write-only, production + preview); plain settings are
 * "encrypted" and also reach local `vercel env pull`.
 */
export async function setVercelEnv(key, value, { secret }) {
  const team = await teamId()
  const all = await listVercelEnv()
  const existing = all.filter((entry) => entry.key === key)
  if (existing.length > 0) {
    for (const entry of existing) {
      await call(`/v9/projects/${projectId()}/env/${entry.id}`, {
        team,
        method: 'PATCH',
        body: { value },
      })
    }
    return
  }
  await call(`/v10/projects/${projectId()}/env`, {
    team,
    method: 'POST',
    body: secret
      ? { key, value, type: 'sensitive', target: ['production', 'preview'] }
      : { key, value, type: 'encrypted', target: ['production', 'preview', 'development'] },
  })
}

/** Rebuilds the current production deployment so new variables take effect. */
export async function redeployVercel() {
  const team = await teamId()
  const { deployments = [] } = await call(
    `/v6/deployments?projectId=${projectId()}&target=production&state=READY&limit=1`,
    { team },
  )
  const latest = deployments[0]
  if (!latest) {
    throw new Error('Vercel: there is no production deployment to redeploy yet.')
  }
  const created = await call('/v13/deployments?forceNew=1', {
    team,
    method: 'POST',
    body: { name: latest.name, deploymentId: latest.uid, target: 'production' },
  })
  return { url: created.url ? `https://${created.url}` : null }
}
