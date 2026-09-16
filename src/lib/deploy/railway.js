/*
 * Railway, for the reel renderer: its variables, its build settings, and
 * redeploys. Uses a Railway *project* token (RAILWAY_TOKEN), which already
 * knows its project and environment. The service is RAILWAY_SERVICE_ID, or
 * the project's only service, or the one whose name mentions "render".
 */

const API = 'https://backboard.railway.com/graphql/v2'
const env = (name) => (process.env[name] || '').trim()

/*
 * Railway tokens are UUIDs. A paste can drag in stray characters (box-drawing
 * lines from a terminal, quotes, spaces), and a header can only carry plain
 * ASCII, so read the UUID out of whatever was saved.
 */
const UUID = /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/i
const railwayToken = () => env('RAILWAY_TOKEN').match(UUID)?.[0] || ''

export const RENDERER_REPO = 'dallasbpeters/austin-leads-platform'
export const RENDERER_DOCKERFILE = 'services/reel-renderer/Dockerfile'

export const railwayReady = () => Boolean(railwayToken())

async function gql(query, variables = {}) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Project-Access-Token': railwayToken() },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.errors?.length) {
    throw new Error(`Railway: ${payload.errors?.[0]?.message || response.status}`)
  }
  return payload.data
}

let cachedTarget = null

/** { projectId, environmentId, serviceId, serviceName } for the renderer. */
export async function railwayTarget() {
  if (cachedTarget) {
    return cachedTarget
  }
  const { projectToken } = await gql('query { projectToken { projectId environmentId } }')
  const { project } = await gql(
    'query project($id: String!) { project(id: $id) { name services { edges { node { id name } } } } }',
    { id: projectToken.projectId },
  )
  const services = project.services.edges.map((edge) => edge.node)
  const pinned = env('RAILWAY_SERVICE_ID')
  const service =
    services.find((item) => item.id === pinned) ||
    (services.length === 1 ? services[0] : services.find((item) => /render/i.test(item.name)))
  if (!service) {
    throw new Error(
      `Railway: pick the renderer service — set RAILWAY_SERVICE_ID (services: ${services.map((item) => item.name).join(', ')}).`,
    )
  }
  cachedTarget = {
    ...projectToken,
    projectName: project.name,
    serviceId: service.id,
    serviceName: service.name,
  }
  return cachedTarget
}

/** Which variable names the service has. Values stay on the server and are dropped here. */
export async function listRailwayKeys() {
  const target = await railwayTarget()
  const { variables } = await gql(
    'query variables($projectId: String!, $environmentId: String!, $serviceId: String) { variables(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId, unrendered: true) }',
    target,
  )
  return Object.keys(variables || {})
}

/** Sets variables on the service. Railway redeploys it on its own. */
export async function setRailwayVars(variables) {
  const { projectId, environmentId, serviceId } = await railwayTarget()
  await gql(
    'mutation variableCollectionUpsert($input: VariableCollectionUpsertInput!) { variableCollectionUpsert(input: $input) }',
    { input: { projectId, environmentId, serviceId, variables } },
  )
}

export async function railwayStatus() {
  const target = await railwayTarget()
  const { serviceInstance } = await gql(
    'query serviceInstance($serviceId: String!, $environmentId: String!) { serviceInstance(serviceId: $serviceId, environmentId: $environmentId) { rootDirectory healthcheckPath latestDeployment { status createdAt } } }',
    target,
  )
  return {
    project: target.projectName,
    service: target.serviceName,
    rootDirectory: serviceInstance?.rootDirectory || '/',
    healthcheckPath: serviceInstance?.healthcheckPath || '',
    deployment: serviceInstance?.latestDeployment || null,
  }
}

/** Points the service at `main` and the renderer Dockerfile, then redeploys. */
export async function fixRailwayBuild() {
  const { environmentId, serviceId } = await railwayTarget()
  await gql(
    'mutation serviceConnect($id: String!, $input: ServiceConnectInput!) { serviceConnect(id: $id, input: $input) { id } }',
    {
      id: serviceId,
      input: { repo: RENDERER_REPO, branch: 'main' },
    },
  )
  await gql(
    'mutation serviceInstanceUpdate($serviceId: String!, $environmentId: String!, $input: ServiceInstanceUpdateInput!) { serviceInstanceUpdate(serviceId: $serviceId, environmentId: $environmentId, input: $input) }',
    {
      serviceId,
      environmentId,
      input: { rootDirectory: '/', dockerfilePath: RENDERER_DOCKERFILE, healthcheckPath: '/health' },
    },
  )
  await redeployRailway()
}

export async function redeployRailway() {
  const { environmentId, serviceId } = await railwayTarget()
  await gql(
    'mutation serviceInstanceRedeploy($serviceId: String!, $environmentId: String!) { serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId) }',
    { serviceId, environmentId },
  )
}
