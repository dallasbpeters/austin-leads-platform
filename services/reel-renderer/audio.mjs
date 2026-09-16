/*
 * Voice, music and sound effects for a reel, from ElevenLabs.
 *
 * For each scene with a `say` line: one voice clip. If a clip runs longer than
 * its scene allows, the scene is stretched — the voice must never be cut off.
 * Then one instrumental track the length of the whole reel, and a handful of
 * sound effects placed on the composition's beats: sleigh bells for the opening
 * bloom and the roofline lighting up, a whoosh under each light-burst cut, a
 * chime when the price lands, a short sting under the logo. Everything lands
 * in the render's own copy of the project as static <audio> elements, because
 * HyperFrames' mixer reads authored audio, plus a small script that dips the
 * music under the voice and fades it out at the end.
 *
 * Sound effects are cached on disk by prompt, so the second reel does not pay
 * ElevenLabs for the same bells again.
 *
 * With no ELEVENLABS_API_KEY the reel renders silent and says so.
 */

import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
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

/* REEL_SFX=off renders with voice and music only. */
export const sfxEnabled = () => (process.env.REEL_SFX || '').trim().toLowerCase() !== 'off'
const SFX_CACHE_DIR = () =>
  process.env.SFX_CACHE_DIR || path.join(process.env.WORK_DIR || '/tmp/renders', 'sfx-cache')

/* Room around each line: a breath before it starts, and before the next scene. */
const LEAD_IN = 0.35
const TAIL = 0.45
/* The voice pool: a few clips at once stays inside every paid plan's concurrency. */
const VOICE_CONCURRENCY = 3
const SFX_CONCURRENCY = 2

/*
 * Where things land inside a scene, in seconds from its start. This mirrors
 * BEATS in videos/christmas-reels/index.html — change them together.
 */
const BEATS = {
  headline: 0.5,
  wordStep: 0.14,
  price: 0.9,
  priceCount: 0.9,
  lightsOn: 0.7,
  signoffLogo: 0.2,
}

/** The four sounds a reel uses. `seconds` is what we ask ElevenLabs for. */
export const SFX = {
  bells: {
    seconds: 3,
    volume: 0.5,
    prompt:
      'Soft sleigh bells shimmer, a gentle magical Christmas sparkle swell, warm and airy, ' +
      'no music, clean tail, cinematic',
  },
  whoosh: {
    seconds: 1,
    volume: 0.42,
    prompt:
      'Short soft cinematic whoosh with a light airy shimmer tail, smooth, subtle, for a scene transition',
  },
  chime: {
    seconds: 1.5,
    volume: 0.6,
    prompt:
      'A single warm bright bell chime with a soft glowing tail, pleasant and clean, like a gift being revealed',
  },
  sting: {
    seconds: 2.5,
    volume: 0.55,
    prompt:
      'A short warm festive orchestral sting, gentle sleigh bells and a soft chime resolving, uplifting, clean ending',
  },
}

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

const wordCount = (text) =>
  String(text || '')
    .split(/\s+/)
    .filter(Boolean).length

/**
 * Where each sound effect goes, from the fitted scenes. Pure: the same scenes
 * always give the same cues, and nothing here touches the network.
 *
 * @param {object[]} scenes - The fitted scenes (durations already stretched for the voice).
 * @returns {{ kind: string, at: number }[]} Sound cues in time order.
 */
export function sfxCues(scenes) {
  const cues = [{ kind: 'bells', at: 0 }]
  let cursor = 0
  for (const [index, scene] of scenes.entries()) {
    const duration = Math.max(2, Number(scene.duration) || 4)
    if (index > 0) {
      /* The light burst peaks a beat before the cut; the whoosh rides it. */
      cues.push({ kind: 'whoosh', at: Math.max(0, cursor - 0.12) })
    }
    if (scene.type === 'lights') {
      cues.push({ kind: 'bells', at: cursor + BEATS.lightsOn })
    }
    if (scene.type === 'signoff') {
      cues.push({ kind: 'sting', at: cursor + BEATS.signoffLogo })
    }
    if (scene.price) {
      /* The price lands when its count finishes, after the headline words settle. */
      const settled = BEATS.headline + wordCount(scene.headline) * BEATS.wordStep + 0.1
      const priceAt = Math.max(BEATS.price, settled - 0.2)
      cues.push({ kind: 'chime', at: cursor + priceAt + BEATS.priceCount - 0.05 })
    }
    cursor += duration
  }
  return cues.sort((a, b) => a.at - b.at)
}

/** One file per sound kind, from the cache when we have it, else from ElevenLabs. */
async function makeSfx(kinds, audioDir) {
  const cacheDir = SFX_CACHE_DIR()
  await mkdir(cacheDir, { recursive: true })
  const files = {}
  await pool([...kinds], SFX_CONCURRENCY, async (kind) => {
    const spec = SFX[kind]
    const hash = createHash('sha1')
      .update(`${kind}|${spec.prompt}|${spec.seconds}`)
      .digest('hex')
      .slice(0, 16)
    const cached = path.join(cacheDir, `${kind}-${hash}.mp3`)
    const target = path.join(audioDir, `sfx-${kind}.mp3`)
    try {
      await copyFile(cached, target)
    } catch {
      const audio = await elevenlabs('/v1/sound-generation?output_format=mp3_44100_128', {
        text: spec.prompt,
        duration_seconds: spec.seconds,
        prompt_influence: 0.4,
      })
      await writeFile(cached, audio)
      await copyFile(cached, target)
    }
    files[kind] = { file: target, seconds: await secondsOf(target) }
  })
  return files
}

const escapeAttr = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;')

/** The static audio tags plus the ducking script, ready to drop before </body>. */
export function audioMarkup({ cues, total, musicFile, sfx = [], projectDir }) {
  const rel = (file) => escapeAttr(path.relative(projectDir, file).split(path.sep).join('/'))
  const MUSIC_LEVEL = 0.32
  const MUSIC_UNDER_VOICE = 0.1

  const voices = cues
    .map(
      (cue) =>
        `<audio id="vo-${cue.index + 1}" src="${rel(cue.file)}" data-start="${cue.start.toFixed(2)}" ` +
        `data-duration="${cue.seconds.toFixed(2)}" data-track-index="${20 + cue.index}" ` +
        `data-audio-group="voiceover" data-volume="1"></audio>`,
    )
    .join('\n')

  const music = musicFile
    ? `<audio id="bgm" src="${rel(musicFile)}" data-start="0" data-duration="${total.toFixed(2)}" ` +
      `data-track-index="40" data-audio-group="music" data-volume="${MUSIC_LEVEL}"></audio>`
    : ''

  /* Effects never run past the end of the reel; a clip that would is trimmed. */
  const effects = sfx
    .map((cue, index) => {
      const seconds = Math.min(cue.seconds, Math.max(0.2, total - cue.at))
      return (
        `<audio id="sfx-${index + 1}" src="${rel(cue.file)}" data-start="${cue.at.toFixed(2)}" ` +
        `data-duration="${seconds.toFixed(2)}" data-track-index="${60 + index}" ` +
        `data-audio-group="sfx" data-volume="${cue.volume}"></audio>`
      )
    })
    .join('\n')

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

  return `\n${voices}\n${music}\n${effects}\n${ducking}\n`
}

/**
 * Makes the voice, music and effects for one render and says how the scenes must change.
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

  let sfx = []
  let sfxNote = 'no sfx (REEL_SFX=off)'
  if (sfxEnabled()) {
    try {
      const cues = sfxCues(fitted.scenes)
      const files = await makeSfx(new Set(cues.map((cue) => cue.kind)), audioDir)
      sfx = cues.map((cue) => ({ ...cue, ...files[cue.kind], volume: SFX[cue.kind].volume }))
      sfxNote = `${sfx.length} sfx`
    } catch (error) {
      // Same rule as music: effects are garnish, the reel ships without them.
      console.error('[reel-renderer] sound effects failed, continuing without them:', error.message)
      sfxNote = `no sfx (${error.message.slice(0, 80)})`
    }
  }

  return {
    scenes: fitted.scenes,
    total: fitted.total,
    markup: audioMarkup({ cues: fitted.cues, total: fitted.total, musicFile, sfx, projectDir }),
    audio: `${fitted.cues.length} voice clip${fitted.cues.length === 1 ? '' : 's'} + ${musicNote} + ${sfxNote}`,
  }
}
