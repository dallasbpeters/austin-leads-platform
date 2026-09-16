import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { listRailwayKeys, railwayReady, setRailwayVars } from './railway'
import { listVercelEnv, setVercelEnv, vercelReady } from './vercel-env'

/*
 * Every variable the reel and social tools need, and where each one lives.
 * The Social accounts page reads this list, shows what is set, and writes the
 * values straight to Vercel and Railway. Values are write-only: nothing here
 * ever returns one.
 *
 *   targets  vercel  → the website
 *            railway → the reel renderer
 *   kind     generate → a random secret made on the server
 *            secret   → pasted, never shown again
 *            text     → pasted, a plain setting
 */
export const DEPLOY_SETTINGS = [
  {
    key: 'RAILWAY_TOKEN',
    group: 'Access',
    label: 'Railway project token',
    help: 'Railway → your project → Settings → Tokens → New token (production). Lets this page manage the renderer.',
    targets: ['vercel'],
    kind: 'secret',
  },
  {
    key: 'SOCIAL_TOKEN_KEY',
    group: 'Access',
    label: 'Token encryption key',
    help: 'Encrypts TikTok and Instagram logins in the database. Changing it disconnects both accounts.',
    targets: ['vercel'],
    kind: 'generate',
    dangerousReplace: true,
  },
  {
    key: 'RENDER_SHARED_SECRET',
    group: 'Reel renderer',
    label: 'Renderer password',
    help: 'The website and the renderer both need the same value. Generate sets both.',
    targets: ['vercel', 'railway'],
    kind: 'generate',
  },
  {
    key: 'REEL_RENDERER_URL',
    group: 'Reel renderer',
    label: 'Renderer address',
    help: 'Where the renderer runs.',
    targets: ['vercel'],
    kind: 'text',
    placeholder: 'https://render.texassolarandroofingpros.com',
  },
  {
    key: 'BLOB_READ_WRITE_TOKEN',
    group: 'Reel renderer',
    label: 'Vercel Blob token',
    help: 'Vercel → Storage → your Blob store → .env.local tab. The renderer uploads finished videos with it.',
    targets: ['railway'],
    kind: 'secret',
  },
  {
    key: 'ELEVENLABS_API_KEY',
    group: 'Voice and music',
    label: 'ElevenLabs API key',
    help: 'elevenlabs.io → Developers → API keys. A paid plan is needed for commercial music.',
    targets: ['railway'],
    kind: 'secret',
  },
  {
    key: 'REEL_VOICE_ID',
    group: 'Voice and music',
    label: 'Voice ID',
    help: 'The ElevenLabs voice that reads the scenes. Blank uses the default voice.',
    targets: ['railway'],
    kind: 'text',
    optional: true,
  },
  {
    key: 'REEL_MUSIC_PROMPT',
    group: 'Voice and music',
    label: 'Music style',
    help: 'Describes the soundtrack. Blank uses cozy instrumental Christmas music.',
    targets: ['railway'],
    kind: 'text',
    optional: true,
  },
  {
    key: 'REEL_SFX',
    group: 'Voice and music',
    label: 'Sound effects',
    help: 'Sleigh bells, whooshes and chimes from ElevenLabs. Blank is on; type off to render with voice and music only.',
    targets: ['railway'],
    kind: 'text',
    optional: true,
  },
  {
    key: 'TIKTOK_CLIENT_KEY',
    group: 'TikTok',
    label: 'Client key',
    help: 'developers.tiktok.com → your app → App details.',
    targets: ['vercel'],
    kind: 'text',
  },
  {
    key: 'TIKTOK_CLIENT_SECRET',
    group: 'TikTok',
    label: 'Client secret',
    help: 'Same page as the client key.',
    targets: ['vercel'],
    kind: 'secret',
  },
  {
    key: 'INSTAGRAM_APP_ID',
    group: 'Instagram',
    label: 'Instagram app ID',
    help: 'developers.facebook.com → your app → Instagram → API setup with Instagram login.',
    targets: ['vercel'],
    kind: 'text',
  },
  {
    key: 'INSTAGRAM_APP_SECRET',
    group: 'Instagram',
    label: 'Instagram app secret',
    help: 'Same page as the app ID.',
    targets: ['vercel'],
    kind: 'secret',
  },
]

export const findSetting = (key) => DEPLOY_SETTINGS.find((setting) => setting.key === key) || null

/*
 * Keys and tokens are plain ASCII. A paste from a terminal or a chat can carry
 * box-drawing characters, smart quotes, or line breaks around them; drop
 * anything that could never be part of a key.
 */
export const cleanPastedValue = (raw) =>
  String(raw ?? '')
    .replaceAll(/[^\u0020-\u007E]/g, '')
    .trim()
    .replaceAll(/^["'`]+|["'`]+$/g, '')

const isLocal = () => process.env.NODE_ENV !== 'production'

/* In local dev the values also go to .env.local, so the dev server matches. */
function writeLocalEnv(key, value) {
  const file = path.join(process.cwd(), '.env.local')
  const text = existsSync(file) ? readFileSync(file, 'utf-8') : ''
  const line = `${key}=${JSON.stringify(value)}`
  const pattern = new RegExp(`^${key}=.*$`, 'm')
  const next = pattern.test(text) ? text.replace(pattern, line) : `${text.replace(/\n?$/, '\n')}${line}\n`
  writeFileSync(file, next)
  process.env[key] = value
}

async function safely(task) {
  try {
    return { value: await task() }
  } catch (error) {
    return { error: error.message }
  }
}

/** Where each setting stands. Never includes a value. */
export async function deploySettingsStatus() {
  const [vercel, railway] = await Promise.all([
    vercelReady() ? safely(listVercelEnv) : { error: 'VERCEL_TOKEN is not set.' },
    railwayReady()
      ? safely(listRailwayKeys)
      : {
          error: (process.env.RAILWAY_TOKEN || '').trim()
            ? 'The saved Railway token is not a real token (it has no token ID in it). Paste it again.'
            : 'Add the Railway project token first.',
        },
  ])
  const vercelKeys = new Set((vercel.value || []).map((entry) => entry.key))
  const railwayKeys = new Set(railway.value || [])

  const place = (setting, target, keys, source) => {
    if (!setting.targets.includes(target)) {
      return null
    }
    if (source.error) {
      return 'unknown'
    }
    return keys.has(setting.key) ? 'set' : 'missing'
  }

  return {
    vercel: { ready: !vercel.error, error: vercel.error || null },
    railway: { ready: !railway.error, error: railway.error || null },
    local: isLocal(),
    settings: DEPLOY_SETTINGS.map((setting) => ({
      ...setting,
      vercel: place(setting, 'vercel', vercelKeys, vercel),
      railway: place(setting, 'railway', railwayKeys, railway),
      // Set on Vercel but not in this running deployment → it needs a redeploy.
      live: Boolean((process.env[setting.key] || '').trim()),
    })),
  }
}

/**
 * Writes one setting to every place it belongs.
 *
 * @returns {Promise<{ wrote: string[], redeploy: string[] }>} Where it went and what needs a redeploy.
 */
export async function applySetting(key, rawValue, { generate = false } = {}) {
  const setting = findSetting(key)
  if (!setting) {
    throw new Error(`Unknown setting: ${key}`)
  }
  if (generate && setting.kind !== 'generate') {
    throw new Error(`${key} is pasted, not generated.`)
  }
  const value = generate ? randomBytes(32).toString('hex') : cleanPastedValue(rawValue)
  if (!value) {
    throw new Error('Enter a value first.')
  }
  if (setting.key === 'REEL_RENDERER_URL' && !/^https:\/\/[^\s/]+/.test(value)) {
    throw new Error('The renderer address must start with https://')
  }

  const secret = setting.kind !== 'text'
  const wrote = []
  const redeploy = []
  // Railway first: if the renderer can't take the new password, the website keeps the old one.
  if (setting.targets.includes('railway')) {
    await setRailwayVars({ [key]: value })
    wrote.push('Railway')
  }
  if (setting.targets.includes('vercel')) {
    await setVercelEnv(key, value, { secret })
    wrote.push('Vercel')
    redeploy.push('vercel')
  }
  if (isLocal()) {
    writeLocalEnv(key, value)
    wrote.push('.env.local')
  }
  return { wrote, redeploy }
}
