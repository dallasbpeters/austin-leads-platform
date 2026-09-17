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
const speakable = (value) => spokenNumbers(clean(value).replaceAll(' · ', ', ').replaceAll('·', ','))

const ONES = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

/** 1250 → "one thousand two hundred fifty". Whole numbers up to 999,999. */
export function numberWords(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n) || n < 0 || n > 999_999) {
    return String(value)
  }
  if (n < 20) {
    return ONES[n]
  }
  if (n < 100) {
    return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`
  }
  if (n < 1000) {
    return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${numberWords(n % 100)}` : ''}`
  }
  return `${numberWords(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${numberWords(n % 1000)}` : ''}`
}

/** "$1,250" → "one thousand two hundred fifty dollars"; "$49.99" → "forty nine dollars and ninety nine cents". */
const dollarsWords = (whole, cents) => {
  const amount = Number(whole.replaceAll(',', ''))
  const dollars = `${numberWords(amount)} ${amount === 1 ? 'dollar' : 'dollars'}`
  if (!cents) {
    return dollars
  }
  const pennies = Number(cents)
  return pennies ? `${dollars} and ${numberWords(pennies)} ${pennies === 1 ? 'cent' : 'cents'}` : dollars
}

/** "(512) 775-0561" → "five one two, seven seven five, zero five six one": digit by digit, a pause per group. */
const phoneWords = (text) =>
  text
    .split(/\D+/)
    .filter(Boolean)
    .map((group) => [...group].map((digit) => ONES[Number(digit)]).join(' '))
    .join(', ')

/**
 * Numbers the voice would stumble on, rewritten as words: prices, phone
 * numbers, and any bare whole number. The screen keeps the digits.
 */
export function spokenNumbers(text) {
  return String(text || '')
    .replace(/\$\s?(\d[\d,]*)(?:\.(\d{2}))?/g, (_match, whole, cents) => dollarsWords(whole, cents))
    .replace(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, (match) => phoneWords(match))
    .replace(/\b\d{1,3}(?:,\d{3})+\b|\b\d+\b/g, (match) => numberWords(match.replaceAll(',', '')))
}

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
        sentence(speakable(scene.eyebrow)),
        sentence(speakable(`${clean(scene.headline)} ${clean(scene.price)}`)),
        sentence(speakable(scene.sub)),
      ]
        .filter(Boolean)
        .join(' ')
    }
    case 'signoff': {
      return [sentence(speakable(scene.headline)), scene.sub ? sentence(`Call ${speakable(scene.sub)}`) : '']
        .filter(Boolean)
        .join(' ')
    }
    default: {
      return [sentence(speakable(scene?.headline)), sentence(speakable(scene?.sub))].filter(Boolean).join(' ')
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

const CAPTION_TAGS = '#ChristmasLights #TexasChristmasLights #CentralTexas #HolidayLights'

/** A starting caption from the reel's own words: the opening line, the price, and how to book. */
export function defaultCaption(scenes) {
  const opening = scenes.find((scene) => clean(scene.headline) && scene.type !== 'signoff')
  const offer = scenes.find((scene) => scene.type === 'offer' && clean(scene.price))
  const signoff = scenes.find((scene) => scene.type === 'signoff')
  return [
    opening ? [sentence(opening.headline), sentence(opening.sub)].filter(Boolean).join(' ') : '',
    offer ? sentence(`${clean(offer.headline)} ${clean(offer.price)}`.trim()) : '',
    signoff?.sub ? `Free estimate, no pressure: ${clean(signoff.sub)}` : 'Free estimate, no pressure.',
    CAPTION_TAGS,
  ]
    .filter(Boolean)
    .join('\n\n')
}
