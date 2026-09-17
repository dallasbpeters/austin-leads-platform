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

import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { copyFile, cp, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { promisify } from 'node:util'

import { list, put } from '@vercel/blob'

import { buildReelAudio, hasAudioKey, previewAudio } from './audio.mjs'

const run = promisify(execFile)

const PORT = Number(process.env.PORT) || 8080
const SHARED_SECRET = process.env.RENDER_SHARED_SECRET || ''
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || ''
const PROJECTS_DIR = process.env.PROJECTS_DIR || '/app/videos'
const WORK_DIR = process.env.WORK_DIR || '/tmp/renders'
const RENDER_TIMEOUT_MS = Number(process.env.RENDER_TIMEOUT_MS) || 15 * 60 * 1000
/*
 * Local mode: with no Blob token the finished MP4 stays on disk and is served
 * from this process at PUBLIC_URL/files/<id>.mp4. Good enough to watch a reel
 * on a laptop; Instagram needs the Blob URL, so production keeps the token.
 */
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '')
const FILES_DIR = path.join(WORK_DIR, 'files')
/* Preview clips (voice lines, the music bed, effects) and their URLs, keyed by what made them. */
const PREVIEW_CACHE_DIR = path.join(WORK_DIR, 'preview-cache')
/* Previews are seconds of API time, not minutes of Chrome, so a couple may run at once. */
const PREVIEW_CONCURRENCY = 2

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

// ─── Rendering ───────────────────────────────────────────────────────────────

/*
 * Every render works on its own copy of the project, because three things are
 * written into it: the voice and music files, the <audio> tags that place them,
 * and the reel's final length (the root `data-duration`, which the CLI has no
 * flag for). Voice can also stretch scenes, so the scene list is rewritten too.
 */
async function prepareProject(job, source) {
  const workingDir = path.join(WORK_DIR, job.id)
  await cp(source, workingDir, { recursive: true })

  let scenes
  try {
    scenes = JSON.parse(job.variables?.scenes || '[]')
  } catch {
    scenes = []
  }

  job.status = 'voicing'
  const audio = await buildReelAudio(scenes, workingDir)
  job.audio = audio.audio
  job.variables = { ...job.variables, scenes: JSON.stringify(audio.scenes), totalDuration: audio.total }
  job.seconds = audio.total

  const entry = path.join(workingDir, 'index.html')
  const html = await readFile(entry, 'utf-8')
  await writeFile(
    entry,
    html
      .replaceAll(/data-duration="[\d.]+"/g, `data-duration="${audio.total}"`)
      .replace('</body>', `${audio.markup}</body>`),
  )
  return workingDir
}

async function renderJob(job) {
  const template = TEMPLATES[job.template]
  const outputPath = path.join(WORK_DIR, `${job.id}.mp4`)

  await mkdir(WORK_DIR, { recursive: true })
  const projectDir = await prepareProject(job, path.join(PROJECTS_DIR, template.project))

  job.status = 'rendering'
  job.startedAt = Date.now()

  /* Variables go in a file and arguments go as a list: no shell, no quoting. */
  const variablesPath = path.join(projectDir, 'reel-variables.json')
  await writeFile(variablesPath, JSON.stringify(job.variables || {}))

  /* HyperFrames is installed in the image (see the Dockerfile), so no download per render. */
  const { stdout, stderr } = await run(
    process.env.HYPERFRAMES_BIN || 'hyperframes',
    [
      'render',
      '--quality',
      job.quality,
      '--fps',
      String(job.fps),
      '--variables-file',
      variablesPath,
      '--output',
      outputPath,
    ],
    {
      cwd: projectDir,
      timeout: RENDER_TIMEOUT_MS,
      maxBuffer: 16 * 1024 * 1024,
    },
  )
  job.log = `${stdout}\n${stderr}`.slice(-4000)

  const { size } = await stat(outputPath)
  if (!size) {
    throw new Error('The render produced an empty file.')
  }

  job.status = 'uploading'
  let url
  if (BLOB_TOKEN) {
    const blob = await put(`reels/${job.id}.mp4`, createReadStream(outputPath), {
      access: 'public',
      contentType: 'video/mp4',
      token: BLOB_TOKEN,
      addRandomSuffix: false,
    })
    url = blob.url
    await rm(outputPath, { force: true })
  } else {
    await mkdir(FILES_DIR, { recursive: true })
    await rename(outputPath, path.join(FILES_DIR, `${job.id}.mp4`))
    url = `${PUBLIC_URL}/files/${job.id}.mp4`
  }
  if (projectDir.startsWith(WORK_DIR)) {
    await rm(projectDir, { recursive: true, force: true })
  }

  job.status = 'done'
  job.url = url
  job.bytes = size
  job.finishedAt = Date.now()
}

// ─── Preview audio ───────────────────────────────────────────────────────────

/** Gives a cached clip a URL the browser can play: Blob in production, this process locally. */
async function publishClip(file, key) {
  if (BLOB_TOKEN) {
    const blob = await put(`reels/audio/${key}.mp3`, createReadStream(file), {
      access: 'public',
      contentType: 'audio/mpeg',
      token: BLOB_TOKEN,
      addRandomSuffix: false,
    })
    return blob.url
  }
  await mkdir(path.join(FILES_DIR, 'audio'), { recursive: true })
  await copyFile(file, path.join(FILES_DIR, 'audio', `${key}.mp3`))
  return `${PUBLIC_URL}/files/audio/${key}.mp3`
}

/** After a redeploy the disk is empty but Blob is not: find a clip made before. */
async function lookupClip(key) {
  if (!BLOB_TOKEN) {
    return null
  }
  const { blobs } = await list({ prefix: `reels/audio/${key}`, token: BLOB_TOKEN, limit: 1 })
  return blobs[0]?.url || null
}

let previewing = 0
const previewWaiters = []
const previewSlot = () =>
  previewing < PREVIEW_CONCURRENCY
    ? (previewing += 1)
    : new Promise((resolve) => previewWaiters.push(resolve)).then(() => (previewing += 1))
const releasePreviewSlot = () => {
  previewing -= 1
  previewWaiters.shift()?.()
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
      audio: hasAudioKey() ? 'voice + music' : 'silent (no ELEVENLABS_API_KEY)',
      storage: BLOB_TOKEN ? 'vercel-blob' : `local (${PUBLIC_URL}/files)`,
      queued: queue.length,
      working,
    }),

  'POST /audio': async (request, response) => {
    const body = await readJsonBody(request)
    const scenes = Array.isArray(body.scenes) ? body.scenes : []
    if (!scenes.length || scenes.length > 20) {
      return json(response, 400, { error: 'Send between 1 and 20 scenes.' })
    }
    await previewSlot()
    try {
      const plan = await previewAudio(scenes, {
        cacheDir: PREVIEW_CACHE_DIR,
        publish: publishClip,
        lookup: lookupClip,
      })
      return json(response, 200, plan)
    } finally {
      releasePreviewSlot()
    }
  },

  'POST /render': async (request, response) => {
    const body = await readJsonBody(request)
    if (!TEMPLATES[body.template]) {
      return json(response, 400, { error: `Unknown template: ${body.template}` })
    }
    if (!BLOB_TOKEN) {
      console.warn('[reel-renderer] no BLOB_READ_WRITE_TOKEN: serving the MP4 from this process (local mode)')
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

  /* Local-mode files are public by design: the id is a UUID and the browser needs to fetch them. */
  const fileMatch = url.pathname.match(/^\/files\/((?:audio\/)?[\w-]+\.(mp4|mp3))$/)
  if (request.method === 'GET' && fileMatch) {
    const file = path.join(FILES_DIR, fileMatch[1])
    try {
      const { size } = await stat(file)
      const type = fileMatch[2] === 'mp3' ? 'audio/mpeg' : 'video/mp4'
      /* Browsers seek inside media with Range requests; without them a scrub sticks at 0. */
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '')
      if (range) {
        const start = range[1] ? Number(range[1]) : 0
        const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1
        if (start >= size || start > end) {
          response.writeHead(416, { 'Content-Range': `bytes */${size}` })
          return response.end()
        }
        response.writeHead(206, {
          'Content-Type': type,
          'Content-Length': end - start + 1,
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
        })
        return createReadStream(file, { start, end }).pipe(response)
      }
      response.writeHead(200, {
        'Content-Type': type,
        'Content-Length': size,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
      })
      createReadStream(file).pipe(response)
    } catch {
      json(response, 404, { error: 'No such file' })
    }
    return
  }

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
          audio: job.audio || null,
          seconds: job.seconds || null,
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
