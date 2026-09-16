/*
 * Reel renderer — the Railway half of the Christmas lights video tool.
 *
 * The website never renders video itself: Vercel has no Chrome and no FFmpeg,
 * and a render takes minutes. It asks this worker instead. The worker runs the
 * HyperFrames CLI against a template baked into the image, uploads the finished
 * MP4 to Vercel Blob (a public URL — which is what Instagram needs to fetch a
 * Reel), and reports back.
 *
 * Renders run one at a time. Chrome at 1080x1920 is heavy, and a queue of one
 * keeps a small Railway box honest.
 */

import { exec } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { promisify } from 'node:util'

import { put } from '@vercel/blob'

const run = promisify(exec)

const PORT = Number(process.env.PORT) || 8080
const SHARED_SECRET = process.env.RENDER_SHARED_SECRET || ''
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || ''
const PROJECTS_DIR = process.env.PROJECTS_DIR || '/app/videos'
const WORK_DIR = process.env.WORK_DIR || '/tmp/renders'
const RENDER_TIMEOUT_MS = Number(process.env.RENDER_TIMEOUT_MS) || 15 * 60 * 1000

/** Templates this worker will render. Anything else is refused, so a caller can't reach elsewhere on disk. */
const TEMPLATES = {
  'christmas-reels': { project: 'christmas-reels', label: 'Texas Christmas Lights reel' },
}

const jobs = new Map()
let working = false
const queue = []

// ─── Helpers ─────────────────────────────────────────────────────────────────

const json = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(body))
}

const readJsonBody = async (request) => {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}')
}

const authorized = (request) => Boolean(SHARED_SECRET) && request.headers['x-render-secret'] === SHARED_SECRET

/* Stringly-typed on purpose: HyperFrames takes variables as one JSON argument. */
const variablesArg = (variables) => JSON.stringify(variables || {})

// ─── Rendering ───────────────────────────────────────────────────────────────

/*
 * The reel's length lives in the composition's root `data-duration`, and the
 * CLI has no flag for it, so every render works on its own copy of the project
 * with the total patched in.
 */
async function prepareProject(job, source) {
  const seconds = Number(job.variables?.totalDuration) || 0
  if (!seconds) {
    return source
  }
  const workingDir = path.join(WORK_DIR, job.id)
  await cp(source, workingDir, { recursive: true })
  const entry = path.join(workingDir, 'index.html')
  const html = await readFile(entry, 'utf-8')
  await writeFile(entry, html.replaceAll(/data-duration="[\d.]+"/g, `data-duration="${seconds}"`))
  return workingDir
}

async function renderJob(job) {
  const template = TEMPLATES[job.template]
  const outputPath = path.join(WORK_DIR, `${job.id}.mp4`)

  await mkdir(WORK_DIR, { recursive: true })
  const projectDir = await prepareProject(job, path.join(PROJECTS_DIR, template.project))

  job.status = 'rendering'
  job.startedAt = Date.now()

  const command = [
    'npx --yes hyperframes@0.8.41 render',
    `--quality ${job.quality}`,
    `--fps ${job.fps}`,
    `--variables '${variablesArg(job.variables).replaceAll("'", String.raw`'\''`)}'`,
    `--output ${JSON.stringify(outputPath)}`,
  ].join(' ')

  const { stdout, stderr } = await run(command, {
    cwd: projectDir,
    timeout: RENDER_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
  })
  job.log = `${stdout}\n${stderr}`.slice(-4000)

  const { size } = await stat(outputPath)
  if (!size) {
    throw new Error('The render produced an empty file.')
  }

  job.status = 'uploading'
  const blob = await put(`reels/${job.id}.mp4`, createReadStream(outputPath), {
    access: 'public',
    contentType: 'video/mp4',
    token: BLOB_TOKEN,
    addRandomSuffix: false,
  })

  await rm(outputPath, { force: true })
  if (projectDir.startsWith(WORK_DIR)) {
    await rm(projectDir, { recursive: true, force: true })
  }

  job.status = 'done'
  job.url = blob.url
  job.bytes = size
  job.finishedAt = Date.now()
}

/** Tells the site the job finished, if it asked to be told. Failure here never fails the render. */
async function notify(job) {
  if (!job.callbackUrl) {
    return
  }
  try {
    await fetch(job.callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-render-secret': SHARED_SECRET },
      body: JSON.stringify({
        id: job.id,
        status: job.status,
        url: job.url || null,
        bytes: job.bytes || null,
        error: job.error || null,
      }),
    })
  } catch (error) {
    console.error(`[reel-renderer] callback failed for ${job.id}:`, error.message)
  }
}

async function drainQueue() {
  if (working) {
    return
  }
  working = true
  while (queue.length) {
    const job = queue.shift()
    try {
      await renderJob(job)
      console.log(`[reel-renderer] ${job.id} done in ${job.finishedAt - job.startedAt}ms`)
    } catch (error) {
      job.status = 'failed'
      job.error = error.message
      job.finishedAt = Date.now()
      console.error(`[reel-renderer] ${job.id} failed:`, error.message)
    }
    await notify(job)
  }
  working = false
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

const routes = {
  'GET /health': (_request, response) =>
    json(response, 200, {
      ok: true,
      templates: Object.keys(TEMPLATES),
      queued: queue.length,
      working,
    }),

  'POST /render': async (request, response) => {
    const body = await readJsonBody(request)
    if (!TEMPLATES[body.template]) {
      return json(response, 400, { error: `Unknown template: ${body.template}` })
    }
    if (!BLOB_TOKEN) {
      return json(response, 500, { error: 'BLOB_READ_WRITE_TOKEN is not set on the worker.' })
    }

    const job = {
      id: randomUUID(),
      template: body.template,
      variables: body.variables || {},
      quality: ['draft', 'looks', 'delivery'].includes(body.quality) ? body.quality : 'looks',
      fps: Number(body.fps) > 0 ? Math.min(60, Number(body.fps)) : 30,
      callbackUrl: typeof body.callbackUrl === 'string' ? body.callbackUrl : null,
      status: 'queued',
      queuedAt: Date.now(),
    }
    jobs.set(job.id, job)
    queue.push(job)
    drainQueue()

    return json(response, 202, { id: job.id, status: job.status, position: queue.length })
  },
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const key = `${request.method} ${url.pathname}`

  if (key !== 'GET /health' && !authorized(request)) {
    return json(response, 401, { error: 'Unauthorized' })
  }

  const jobMatch = url.pathname.match(/^\/render\/([\w-]+)$/)
  if (request.method === 'GET' && jobMatch) {
    const job = jobs.get(jobMatch[1])
    return job
      ? json(response, 200, {
          id: job.id,
          status: job.status,
          url: job.url || null,
          bytes: job.bytes || null,
          error: job.error || null,
        })
      : json(response, 404, { error: 'No such render' })
  }

  const handler = routes[key]
  if (!handler) {
    return json(response, 404, { error: 'Not found' })
  }

  try {
    await handler(request, response)
  } catch (error) {
    console.error('[reel-renderer]', error)
    json(response, 500, { error: error.message })
  }
})

server.listen(PORT, () => {
  console.log(`[reel-renderer] listening on ${PORT}; templates: ${Object.keys(TEMPLATES).join(', ')}`)
})
