/*
 * Talks to the render worker (services/reel-renderer, running on Railway).
 *
 * The browser never calls the worker directly: the shared secret stays on the
 * server, and the worker's address can change without touching the client.
 */

const WORKER_URL = (process.env.REEL_RENDERER_URL || '').replace(/\/$/, '')
const SECRET = process.env.RENDER_SHARED_SECRET || ''

export const hasRenderer = () => Boolean(WORKER_URL && SECRET)

/** A render is slow, but these calls are not — they only queue and poll. */
async function callWorker(path, init = {}) {
  const response = await fetch(`${WORKER_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'x-render-secret': SECRET, ...init.headers },
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || `The renderer answered ${response.status}.`)
  }
  return payload
}

/**
 * Queues a render.
 *
 * @param {{ scenes: object[], quality?: string }} reel - Scenes from the studio.
 * @returns {Promise<{ id: string, status: string }>} The queued job.
 */
export const startRender = (reel) =>
  callWorker('/render', {
    method: 'POST',
    body: JSON.stringify({
      template: 'christmas-reels',
      quality: reel.quality || 'looks',
      fps: 30,
      variables: {
        scenes: JSON.stringify(reel.scenes),
        totalDuration: reel.scenes.reduce((sum, scene) => sum + (Number(scene.duration) || 4), 0),
      },
    }),
  })

/** Where a queued render has got to, and its public URL once it's done. */
export const renderStatus = (id) => callWorker(`/render/${encodeURIComponent(id)}`)

/**
 * Voice, music and effects for the studio preview, as playable URLs.
 *
 * @param {object[]} scenes - Scenes from the studio, with their `say` lines.
 * @returns {Promise<object>} Fitted scenes plus every clip's URL and start time.
 */
export const previewAudio = (scenes) =>
  callWorker('/audio', { method: 'POST', body: JSON.stringify({ scenes }) })
