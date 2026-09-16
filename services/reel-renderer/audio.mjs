/*
 * Voice and music for a reel, from ElevenLabs.
 *
 * For each scene with a `say` line: one voice clip. If a clip runs longer than
 * its scene allows, the scene is stretched — the voice must never be cut off.
 * Then one instrumental track the length of the whole reel. Everything lands
 * in the render's own copy of the project as static <audio> elements, because
 * HyperFrames' mixer reads authored audio, plus a small script that dips the
 * music under the voice and fades it out at the end.
 *
 * With no ELEVENLABS_API_KEY the reel renders silent and says so.
 */

import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { promisify } from 'node:util'

const run = promisify(execFile)

const API = 'https://api.elevenlabs.io'
const KEY = () => (process.env.ELEVENLABS_API_KEY || '').trim()

/* A warm, festive voice. Override with REEL_VOICE_ID once the shortlist is chosen. */
const VOICE_ID = () => (process.env.REEL_VOICE_ID || '').trim() || '21m00Tcm4TlvDq8ikWAM'
const VOICE_MODEL = () => (process.env.REEL_VOICE_MODEL || '').trim() || 'eleven_multilingual_v2'
const MUSIC_PROMPT =
  process.env.REEL_MUSIC_PROMPT ||
  'Warm, cozy instrumental Christmas music for a short social ad: gentle sleigh bells, soft piano, ' +
    'light strings, hopeful and inviting, steady tempo, no vocals, clean ending.'

/* Room around each line: a breath before it starts, and before the next scene. */
const LEAD_IN = 0.35
const TAIL = 0.45
/* The voice pool: a few clips at once stays inside every paid plan's concurrency. */
const VOICE_CONCURRENCY = 3

export const hasAudioKey = () => Boolean(KEY())

async function elevenlabs(pathname, body, attempt = 0) {
  const response = await fetch(`${API}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': KEY() },
    body: JSON.stringify(body),
  })
  /* Busy: ElevenLabs queues first and only then answers 429. Back off and retry. */
  if (response.status === 429 && attempt < 4) {
    await sleep(1500 * 2 ** attempt)
    return elevenlabs(pathname, body, attempt + 1)
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`ElevenLabs ${pathname} answered ${response.status}: ${detail.slice(0, 200)}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

async function secondsOf(file) {
  const { stdout } = await run('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'csv=p=0',
    file,
  ])
  return Number.parseFloat(stdout) || 0
}

/** Runs `worker` over `items`, at most `limit` at a time, keeping order. */
async function pool(items, limit, worker) {
  const results = Array.from({ length: items.length })
  let next = 0
  const lane = async () => {
    while (next < items.length) {
      const index = next
      next += 1
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, lane))
  return results
}

async function makeVoice(scenes, audioDir) {
  return pool(scenes, VOICE_CONCURRENCY, async (scene, index) => {
    const text = String(scene.say || '').trim()
    if (!text) {
      return null
    }
    const file = path.join(audioDir, `vo-${index + 1}.mp3`)
    const audio = await elevenlabs(`/v1/text-to-speech/${VOICE_ID()}?output_format=mp3_44100_128`, {
      text,
      model_id: VOICE_MODEL(),
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
    })
    await writeFile(file, audio)
    return { file, seconds: await secondsOf(file) }
  })
}

/** Stretches any scene too short for its line. Returns the new scenes and where each voice starts. */
export function fitScenesToVoice(scenes, clips) {
  let cursor = 0
  const cues = []
  const fitted = scenes.map((scene, index) => {
    const clip = clips[index]
    const minimum = clip ? LEAD_IN + clip.seconds + TAIL : 0
    const duration = Math.max(Number(scene.duration) || 4, Math.ceil(minimum * 2) / 2)
    if (clip) {
      cues.push({ index, start: cursor + LEAD_IN, seconds: clip.seconds, file: clip.file })
    }
    cursor += duration
    return { ...scene, duration }
  })
  return { scenes: fitted, cues, total: cursor }
}

async function makeMusic(total, audioDir) {
  const file = path.join(audioDir, 'music.mp3')
  const audio = await elevenlabs('/v1/music?output_format=mp3_44100_128', {
    prompt: MUSIC_PROMPT,
    music_length_ms: Math.max(3000, Math.round(total * 1000)),
    force_instrumental: true,
  })
  await writeFile(file, audio)
  return file
}

const escapeAttr = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;')

/** The static audio tags plus the ducking script, ready to drop before </body>. */
export function audioMarkup({ cues, total, musicFile, projectDir }) {
  const rel = (file) => escapeAttr(path.relative(projectDir, file).split(path.sep).join('/'))
  const MUSIC_LEVEL = 0.32
  const MUSIC_UNDER_VOICE = 0.1

  const voices = cues
    .map(
      (cue) =>
        `<audio id="vo-${cue.index + 1}" src="${rel(cue.file)}" data-start="${cue.start.toFixed(2)}" ` +
        `data-duration="${cue.seconds.toFixed(2)}" data-track-index="${20 + cue.index}" data-volume="1"></audio>`,
    )
    .join('\n')

  const music = musicFile
    ? `<audio id="bgm" src="${rel(musicFile)}" data-start="0" data-duration="${total.toFixed(2)}" ` +
      `data-track-index="40" data-volume="${MUSIC_LEVEL}"></audio>`
    : ''

  /* Tween values replace the baseline, so every value here is an absolute level. */
  const ducking = musicFile
    ? `<script>
(() => {
  const tl = window.__timelines && window.__timelines.main
  if (!tl) return
  const cues = ${JSON.stringify(cues.map(({ start, seconds }) => ({ start, seconds })))}
  for (const cue of cues) {
    tl.to('#bgm', { volume: ${MUSIC_UNDER_VOICE}, duration: 0.3, ease: 'power1.out' }, Math.max(0, cue.start - 0.25))
    tl.to('#bgm', { volume: ${MUSIC_LEVEL}, duration: 0.6, ease: 'power1.inOut' }, cue.start + cue.seconds + 0.1)
  }
  tl.to('#bgm', { volume: 0, duration: 1.4, ease: 'power1.in' }, Math.max(0, ${total.toFixed(2)} - 1.4))
})()
</script>`
    : ''

  return `\n${voices}\n${music}\n${ducking}\n`
}

/**
 * Makes the voice and music for one render and says how the scenes must change.
 *
 * @param {object[]} scenes - The render's scenes, each with an optional `say`.
 * @param {string} projectDir - The render's own copy of the project.
 * @returns {Promise<{ scenes: object[], total: number, markup: string, audio: string }>} What to write back.
 */
export async function buildReelAudio(scenes, projectDir) {
  const plain = () => {
    const total = scenes.reduce((sum, scene) => sum + (Number(scene.duration) || 4), 0)
    return { scenes, total, markup: '', audio: 'silent (no ELEVENLABS_API_KEY)' }
  }
  if (!hasAudioKey()) {
    return plain()
  }

  const audioDir = path.join(projectDir, 'assets', 'audio')
  await mkdir(audioDir, { recursive: true })

  const clips = await makeVoice(scenes, audioDir)
  const fitted = fitScenesToVoice(scenes, clips)

  let musicFile = null
  let musicNote = 'music'
  try {
    musicFile = await makeMusic(fitted.total, audioDir)
  } catch (error) {
    // A reel with a voice and no music still ships; the job log says why.
    console.error('[reel-renderer] music failed, continuing without it:', error.message)
    musicNote = `no music (${error.message.slice(0, 80)})`
  }

  return {
    scenes: fitted.scenes,
    total: fitted.total,
    markup: audioMarkup({ cues: fitted.cues, total: fitted.total, musicFile, projectDir }),
    audio: `${fitted.cues.length} voice clip${fitted.cues.length === 1 ? '' : 's'} + ${musicNote}`,
  }
}
