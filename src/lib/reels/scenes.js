/*
 * The scene vocabulary, shared by the builder and the composition.
 *
 * `videos/christmas-reels/index.html` reads exactly these `type` values and
 * fields; this file is what the UI builds its forms from. Add a scene type in
 * both places or it will not render.
 */

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `scene-${Date.now()}-${Math.random().toString(36).slice(2)}`

/** A text field on a scene form. `lines` renders a textarea. */
const field = (id, label, { placeholder = '', lines = 1 } = {}) => ({ id, label, placeholder, lines })

export const SCENE_TYPES = [
  {
    type: 'photo',
    label: 'Photo',
    hint: 'A job photo, graded and slowly pushed in, with your words over it.',
    needsPhoto: true,
    fields: [
      field('eyebrow', 'Small label', { placeholder: 'Leander' }),
      field('headline', 'Headline', { placeholder: 'Your house. Lit.' }),
      field('sub', 'One more line', { placeholder: 'We hang it, service it, take it down.', lines: 2 }),
    ],
    defaults: { duration: 5, eyebrow: 'Central Texas', headline: 'Your house. Lit.' },
  },
  {
    type: 'offer',
    label: 'Price card',
    hint: 'A gold price on the night sky. No photo needed.',
    fields: [
      field('eyebrow', 'Small label', { placeholder: 'Roofline package' }),
      field('headline', 'Above the price', { placeholder: 'Starting at' }),
      field('price', 'Price', { placeholder: '$300' }),
      field('sub', 'What it includes', { placeholder: 'Install, mid-season service, takedown.', lines: 2 }),
    ],
    defaults: { duration: 4, eyebrow: 'Roofline package', headline: 'Starting at', price: '$300' },
  },
  {
    type: 'text',
    label: 'Words only',
    hint: 'One statement, centered on the night sky.',
    fields: [
      field('eyebrow', 'Small label', { placeholder: 'No pressure' }),
      field('headline', 'Headline', { placeholder: 'Booked out by Thanksgiving.' }),
      field('sub', 'One more line', { placeholder: 'Call while the good weekends are open.', lines: 2 }),
    ],
    defaults: { duration: 4, headline: 'Booked out by Thanksgiving.' },
  },
  {
    type: 'signoff',
    label: 'Sign-off',
    hint: 'Logo, phone number, and the closing line. Put it last.',
    fields: [
      field('sub', 'Phone', { placeholder: '(512) 775-0561' }),
      field('headline', 'Closing line', { placeholder: 'Free estimate · No pressure' }),
    ],
    defaults: { duration: 4, sub: '(512) 775-0561', headline: 'Free estimate · No pressure' },
  },
  {
    type: 'lights',
    label: 'Drawn house',
    hint: 'An illustrated house whose roofline lights up. Use it when you have no photo.',
    fields: [
      field('eyebrow', 'Small label', { placeholder: 'Central Texas' }),
      field('headline', 'Headline', { placeholder: 'Your roofline. Lit.' }),
      field('sub', 'One more line', { placeholder: 'No ladder. No tangled box of lights.', lines: 2 }),
    ],
    defaults: { duration: 6, headline: 'Your roofline. Lit.', bulbColor: 'warm-white' },
  },
]

export const BULB_COLORS = [
  { value: 'warm-white', label: 'Warm white' },
  { value: 'multicolor', label: 'Multicolor' },
  { value: 'bright-white', label: 'Bright white' },
]

export const sceneTypeOf = (scene) =>
  SCENE_TYPES.find((entry) => entry.type === scene?.type) || SCENE_TYPES[0]

export const makeScene = (type) => {
  const definition = SCENE_TYPES.find((entry) => entry.type === type) || SCENE_TYPES[0]
  return { id: newId(), type: definition.type, ...definition.defaults }
}

/** What the studio starts with: a photo, a price, a sign-off. */
export const STARTER_SCENES = () => [
  {
    ...makeScene('photo'),
    eyebrow: 'Central Texas',
    headline: 'Your house. Lit.',
    sub: 'We hang it, we service it, we take it down.',
  },
  makeScene('offer'),
  makeScene('signoff'),
]

export const SCENE_MIN_SECONDS = 2
export const SCENE_MAX_SECONDS = 12

export const sceneSeconds = (scene) =>
  Math.min(SCENE_MAX_SECONDS, Math.max(SCENE_MIN_SECONDS, Number(scene?.duration) || 4))

export const totalSeconds = (scenes) => scenes.reduce((sum, scene) => sum + sceneSeconds(scene), 0)

const clean = (value) => String(value || '').trim()

/* A spoken line should end like a sentence, so the voice pauses naturally. */
const sentence = (value) => {
  const text = clean(value)
  return text && !/[.!?]$/.test(text) ? `${text}.` : text
}

/* "·" separates on-screen fragments; spoken, it reads better as a pause. */
const speakable = (value) => clean(value).replaceAll(' · ', ', ').replaceAll('·', ',')

/**
 * What the voice says over a scene: its on-screen words, in reading order.
 *
 * @param {object} scene - A studio scene.
 * @returns {string} The line to speak, or '' for a silent scene.
 */
export function spokenLine(scene) {
  switch (scene?.type) {
    case 'offer': {
      return [
        sentence(scene.eyebrow),
        sentence(`${clean(scene.headline)} ${clean(scene.price)}`),
        sentence(scene.sub),
      ]
        .filter(Boolean)
        .join(' ')
    }
    case 'signoff': {
      return [sentence(speakable(scene.headline)), scene.sub ? sentence(`Call ${clean(scene.sub)}`) : '']
        .filter(Boolean)
        .join(' ')
    }
    default: {
      return [sentence(scene?.headline), sentence(scene?.sub)].filter(Boolean).join(' ')
    }
  }
}

/** Strips the studio's own bookkeeping before the scenes go to the renderer. */
export const toRenderScenes = (scenes) =>
  scenes.map(({ id: _id, photo, ...scene }) => ({
    ...scene,
    duration: sceneSeconds(scene),
    say: spokenLine(scene),
    ...(photo?.src ? { photoUrl: photo.src } : {}),
  }))

/** A one-line summary for the scene strip. */
export const sceneSummary = (scene) =>
  scene.headline || scene.price || scene.eyebrow || sceneTypeOf(scene).label
