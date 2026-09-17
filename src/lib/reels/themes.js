/*
 * The reel themes.
 *
 * A theme is one look: a HyperFrames project on the render worker, the scene
 * types that project knows how to draw, and the words the studio starts you
 * with. Everything that used to say "christmas-reels" now asks a theme.
 *
 * Adding a theme means three things, in this order:
 *   1. an entry here,
 *   2. a `videos/<project>/` composition that reads the same scene `type`s,
 *   3. a COPY line in `services/reel-renderer/Dockerfile` and an entry in that
 *      worker's own TEMPLATES map, which refuses anything it does not know.
 * Miss any one and a render fails with "Unknown template".
 */

/** The theme a reel gets when it does not say. Every row saved before themes existed is this. */
export const DEFAULT_THEME = 'christmas'

export const THEMES = [
  {
    id: 'christmas',
    label: 'Texas Christmas Lights',
    hint: 'Night sky, warm bulbs, gold price card. The seasonal look.',
    /* Must match a key in the worker's TEMPLATES map and a folder under videos/. */
    project: 'christmas-reels',
    previewUrl: '/reels/christmas-reels/preview.html',
    shareTitle: 'Texas Christmas Lights',
    downloadName: 'christmas-reel.mp4',
    sceneTypes: ['photo', 'offer', 'text', 'signoff', 'lights'],
    captionTags: '#ChristmasLights #TexasChristmasLights #CentralTexas #HolidayLights',
    phone: '(512) 775-0561',
    /* The night shoot leads the photo picker for this theme. */
    ranksChristmasPhotosFirst: true,
  },
  {
    id: 'brand',
    label: 'Texas Solar & Roofing',
    hint: 'Year-round brand look. Works for solar, roofing or storm work.',
    project: 'brand-reels',
    previewUrl: '/reels/brand-reels/preview.html',
    shareTitle: 'Texas Solar and Roofing Pros',
    downloadName: 'texas-solar-roofing-reel.mp4',
    /* No `lights`: a drawn house with a lit roofline is Christmas whatever colour it is. */
    sceneTypes: ['photo', 'offer', 'text', 'signoff'],
    captionTags: '#CentralTexas #AustinTX #TexasRoofing #TexasSolar #HailDamage',
    phone: '512-400-3763',
    ranksChristmasPhotosFirst: false,
  },
]

/** A theme by id. Anything unknown, including null, falls back to the default. */
export const themeOf = (id) =>
  THEMES.find((theme) => theme.id === id) || THEMES.find((theme) => theme.id === DEFAULT_THEME)

/** The id, normalised. Use this before writing a theme to the database. */
export const themeId = (id) => themeOf(id).id

/** The composition the worker should render. */
export const themeProject = (id) => themeOf(id).project

/** True when this theme can draw that scene type. */
export const themeHasScene = (id, type) => themeOf(id).sceneTypes.includes(type)
