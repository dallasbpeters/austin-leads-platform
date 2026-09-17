/*
 * Voice, music and sound effects for a reel, from ElevenLabs.
 *
 * For each scene with a `say` line: one voice clip. If a clip runs longer than
 * its scene allows, the scene is stretched — the voice must never be cut off.
 * Then one instrumental track the length of the whole reel, and a handful of
 * sound effects placed on the composition's beats: sleigh bells for the opening
 * bloom and the roofline lighting up, a whoosh under each light-burst cut, a
 * chime when the price lands. Nothing plays under the logo: the sign-off is
 * voice and music only. Everything lands
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
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { promisify } from 'node:util'

const run = promisify(execFile)

const API = 'https://api.elevenlabs.io'
const KEY = () => (process.env.ELEVENLABS_API_KEY || '').trim()

/* A warm, festive voice. Override with REEL_VOICE_ID once the shortlist is chosen. */
const VOICE_ID = () => (process.env.REEL_VOICE_ID || '').trim() || '21m00Tcm4TlvDq8ikWAM'
const VOICE_MODEL = () => (process.env.REEL_VOICE_MODEL || '').trim() || 'eleven_multilingual_v2'
/* Unhurried, like a neighbour talking: 1 is ElevenLabs' normal pace; 0.7 is the slowest it allows. */
const VOICE_SPEED = () => Math.min(1.2, Math.max(0.7, Number(process.env.REEL_VOICE_SPEED) || 0.82))
const MUSIC_PROMPT =
  process.env.REEL_MUSIC_PROMPT ||
  'Classic Christmas holiday instrumental, unmistakably festive: jingling sleigh bells on every beat, ' +
    'glockenspiel and celesta melody, warm strings and soft brass, a cozy fireside carol feel like a ' +
    'traditional holiday song, medium tempo, joyful and heartwarming, no vocals, clean ending.'

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
}

/** The three sounds a reel uses. `seconds` is what we ask ElevenLabs for. */
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

/** One spoken line, as MP3 bytes. */
const voiceBytes = (text) =>
  elevenlabs(`/v1/text-to-speech/${VOICE_ID()}?output_format=mp3_44100_128`, {
    text,
    model_id: VOICE_MODEL(),
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.75,
      style: 0.1,
      use_speaker_boost: true,
      speed: VOICE_SPEED(),
    },
  })

/** An instrumental bed of about `seconds`, as MP3 bytes. */
const musicBytes = (seconds) =>
  elevenlabs('/v1/music?output_format=mp3_44100_128', {
    prompt: MUSIC_PROMPT,
    music_length_ms: Math.max(3000, Math.round(seconds * 1000)),
    force_instrumental: true,
  })

/** One sound effect from the SFX table, as MP3 bytes. */
const sfxBytes = (kind) =>
  elevenlabs('/v1/sound-generation?output_format=mp3_44100_128', {
    text: SFX[kind].prompt,
    duration_seconds: SFX[kind].seconds,
    prompt_influence: 0.4,
  })

async function makeVoice(scenes, audioDir) {
  return pool(scenes, VOICE_CONCURRENCY, async (scene, index) => {
    const text = String(scene.say || '').trim()
    if (!text) {
      return null
    }
    const file = path.join(audioDir, `vo-${index + 1}.mp3`)
    await writeFile(file, await voiceBytes(text))
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
      cues.push({ index, start: cursor + LEAD_IN, seconds: clip.seconds, file: clip.file, url: clip.url })
    }
    cursor += duration
    return { ...scene, duration }
  })
  return { scenes: fitted, cues, total: cursor }
}

async function makeMusic(total, audioDir) {
  const file = path.join(audioDir, 'music.mp3')
  await writeFile(file, await musicBytes(total))
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
      await writeFile(cached, await sfxBytes(kind))
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

// ─── Preview audio ───────────────────────────────────────────────────────────
//
// The studio wants to hear a reel before it renders. Nothing is rendered: each
// clip is made once, keyed by what made it, published to a URL the browser can
// play, and remembered. Typing a new headline re-records that one line only.

/* The preview music is one shared bed, cut to length in the browser. */
const MUSIC_BED_SECONDS = 48

const hashOf = (...parts) => createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 20)
const round = (value) => Math.round(value * 100) / 100

/**
 * A clip made once and reused. Looks on disk, then wherever `lookup` says
 * (the Blob store, after a redeploy), and only then pays ElevenLabs.
 */
async function cachedClip({ key, cacheDir, make, publish, lookup }) {
  const meta = path.join(cacheDir, `${key}.json`)
  try {
    return JSON.parse(await readFile(meta, 'utf8'))
  } catch {
    /* not on disk yet */
  }
  let url = lookup ? await lookup(key).catch(() => null) : null
  let seconds
  if (url) {
    seconds = await secondsOf(url)
  } else {
    const file = path.join(cacheDir, `${key}.mp3`)
    await writeFile(file, await make())
    seconds = await secondsOf(file)
    url = await publish(file, key)
  }
  const clip = { url, seconds }
  await writeFile(meta, JSON.stringify(clip))
  return clip
}

/**
 * Lays the preview out: fitted scenes plus where every clip starts. Pure.
 *
 * @param {{ scenes: object[], clips: (object|null)[], music: object|null, sfxFiles: object|null }} parts
 * @returns {{ scenes: object[], total: number, voices: object[], music: object|null, sfx: object[] }}
 */
export function previewPlan({ scenes, clips, music, sfxFiles }) {
  const fitted = fitScenesToVoice(scenes, clips)
  const cues = sfxFiles ? sfxCues(fitted.scenes) : []
  return {
    scenes: fitted.scenes,
    total: fitted.total,
    voices: fitted.cues.map((cue) => ({
      index: cue.index,
      start: round(cue.start),
      seconds: round(cue.seconds),
      url: cue.url,
    })),
    music: music ? { url: music.url, seconds: round(music.seconds) } : null,
    sfx: cues
      .filter((cue) => sfxFiles[cue.kind])
      .map((cue) => ({
        kind: cue.kind,
        at: round(cue.at),
        seconds: round(sfxFiles[cue.kind].seconds),
        url: sfxFiles[cue.kind].url,
        volume: SFX[cue.kind].volume,
      })),
  }
}

/**
 * Voice, music bed and effects for the studio preview, as URLs.
 *
 * @param {object[]} scenes - Studio scenes, each with an optional `say`.
 * @param {{ cacheDir: string, publish: Function, lookup?: Function }} store - Where clips live and how they get a URL.
 * @returns {Promise<object>} A `previewPlan` plus an `audio` summary line.
 */
export async function previewAudio(scenes, { cacheDir, publish, lookup }) {
  if (!hasAudioKey()) {
    return {
      ...previewPlan({ scenes, clips: [], music: null, sfxFiles: null }),
      audio: 'silent (no ELEVENLABS_API_KEY)',
    }
  }
  await mkdir(cacheDir, { recursive: true })
  const store = { cacheDir, publish, lookup }

  const clips = await pool(scenes, VOICE_CONCURRENCY, async (scene) => {
    const text = String(scene.say || '').trim()
    if (!text) {
      return null
    }
    return cachedClip({
      ...store,
      key: `vo-${hashOf(VOICE_ID(), VOICE_MODEL(), VOICE_SPEED(), text)}`,
      make: () => voiceBytes(text),
    })
  })

  let music = null
  let musicNote = 'music'
  try {
    music = await cachedClip({
      ...store,
      key: `bed-${hashOf(MUSIC_PROMPT, MUSIC_BED_SECONDS)}`,
      make: () => musicBytes(MUSIC_BED_SECONDS),
    })
  } catch (error) {
    console.error('[reel-renderer] preview music failed:', error.message)
    musicNote = `no music (${error.message.slice(0, 80)})`
  }

  let sfxFiles = null
  let sfxNote = 'no sfx (REEL_SFX=off)'
  if (sfxEnabled()) {
    try {
      const entries = await pool(Object.keys(SFX), SFX_CONCURRENCY, async (kind) => [
        kind,
        await cachedClip({
          ...store,
          key: `sfx-${kind}-${hashOf(kind, SFX[kind].prompt, SFX[kind].seconds)}`,
          make: () => sfxBytes(kind),
        }),
      ])
      sfxFiles = Object.fromEntries(entries)
      sfxNote = 'sfx'
    } catch (error) {
      console.error('[reel-renderer] preview sound effects failed:', error.message)
      sfxNote = `no sfx (${error.message.slice(0, 80)})`
    }
  }

  const plan = previewPlan({ scenes, clips, music, sfxFiles })
  return {
    ...plan,
    audio: `${plan.voices.length} voice clip${plan.voices.length === 1 ? '' : 's'} + ${musicNote} + ${sfxNote}`,
  }
}
