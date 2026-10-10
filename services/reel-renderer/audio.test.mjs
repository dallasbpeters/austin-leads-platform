import { describe, expect, it } from 'vitest'

import { audioMarkup, fitScenesToVoice, previewPlan, sfxCues } from './audio.mjs'

const scenes = [
  { type: 'photo', duration: 5, headline: 'Your house. Lit.' },
  { type: 'offer', duration: 5, headline: 'Starting at', price: '$300' },
  { type: 'lights', duration: 6, headline: 'Your roofline. Lit.' },
  { type: 'signoff', duration: 4, headline: 'Free estimate' },
]

describe('where the sound effects go', () => {
  it('opens on bells, whooshes under every cut, chimes on the price, and leaves the logo quiet', () => {
    const cues = sfxCues(scenes)
    expect(cues[0]).toEqual({ kind: 'bells', at: 0 })
    expect(cues.filter((cue) => cue.kind === 'whoosh').map((cue) => cue.at)).toEqual([4.88, 9.88, 15.88])
    expect(cues.filter((cue) => cue.kind === 'bells').map((cue) => cue.at)).toEqual([0, 10.7])
    expect(cues.find((cue) => cue.kind === 'sting')).toBeUndefined()
    const chime = cues.find((cue) => cue.kind === 'chime')
    /* price lands 0.9s after it appears at 0.9s into the offer scene, minus a hair */
    expect(chime.at).toBeCloseTo(5 + 0.9 + 0.9 - 0.05, 5)
  })

  it('is stable in time order and deterministic', () => {
    const a = sfxCues(scenes)
    const b = sfxCues(scenes)
    expect(a).toEqual(b)
    expect(a.map((cue) => cue.at)).toEqual(a.map((cue) => cue.at).toSorted((x, y) => x - y))
  })

  it('waits for long headlines before the chime', () => {
    const [cue] = sfxCues([
      { type: 'offer', duration: 6, headline: 'Whole roofline and all the trees', price: '$900' },
    ]).filter((entry) => entry.kind === 'chime')
    /* six words settle at 0.5 + 6 × 0.14 + 0.1 = 1.44; the price waits until 1.24 */
    expect(cue.at).toBeCloseTo(1.24 + 0.9 - 0.05, 5)
  })
})

describe('the audio markup', () => {
  it('places voice, music and effects on their own groups and trims effects at the end', () => {
    const projectDir = '/work/job'
    const fitted = fitScenesToVoice(scenes, [
      null,
      { file: '/work/job/assets/audio/vo-2.mp3', seconds: 2 },
      null,
      null,
    ])
    const markup = audioMarkup({
      cues: fitted.cues,
      total: fitted.total,
      musicFile: '/work/job/assets/audio/music.mp3',
      sfx: [
        { kind: 'bells', at: 0, file: '/work/job/assets/audio/sfx-bells.mp3', seconds: 3, volume: 0.5 },
        {
          kind: 'sting',
          at: fitted.total - 1,
          file: '/work/job/assets/audio/sfx-sting.mp3',
          seconds: 2.5,
          volume: 0.55,
        },
      ],
      projectDir,
    })
    expect(markup).toContain('data-audio-group="voiceover"')
    expect(markup).toContain('id="bgm"')
    expect(markup).toContain('data-audio-group="music"')
    expect(markup).toContain(
      'id="sfx-1" src="assets/audio/sfx-bells.mp3" data-start="0.00" data-duration="3.00"',
    )
    expect(markup).toContain(
      'id="sfx-2" src="assets/audio/sfx-sting.mp3" data-start="19.00" data-duration="1.00"',
    )
    expect(markup).toContain('data-volume="0.55"')
    expect(markup).toContain("tl.to('#bgm'")
  })

  it('renders nothing extra when there are no effects', () => {
    const markup = audioMarkup({ cues: [], total: 4, musicFile: null, projectDir: '/work/job' })
    expect(markup.trim()).toBe('')
  })
})

describe('the preview plan', () => {
  it('fits scenes to their lines and hands back every clip with a start and a URL', () => {
    const plan = previewPlan({
      scenes,
      clips: [
        null,
        { url: 'https://blob/vo-a.mp3', seconds: 6 },
        null,
        { url: 'https://blob/vo-b.mp3', seconds: 1 },
      ],
      music: { url: 'https://blob/bed.mp3', seconds: 48.2 },
      sfxFiles: {
        bells: { url: 'https://blob/bells.mp3', seconds: 3 },
        whoosh: { url: 'https://blob/whoosh.mp3', seconds: 1 },
        chime: { url: 'https://blob/chime.mp3', seconds: 1.5 },
        sting: { url: 'https://blob/sting.mp3', seconds: 2.5 },
      },
    })
    /* a 6 s line needs 0.35 + 6 + 0.45 = 6.8 → the 5 s offer scene grows to 7 s */
    expect(plan.scenes.map((scene) => scene.duration)).toEqual([5, 7, 6, 4])
    expect(plan.total).toBe(22)
    expect(plan.voices).toEqual([
      { index: 1, start: 5.35, seconds: 6, url: 'https://blob/vo-a.mp3' },
      { index: 3, start: 18.35, seconds: 1, url: 'https://blob/vo-b.mp3' },
    ])
    expect(plan.music).toEqual({ url: 'https://blob/bed.mp3', seconds: 48.2 })
    expect(plan.sfx[0]).toEqual({
      kind: 'bells',
      at: 0,
      seconds: 3,
      url: 'https://blob/bells.mp3',
      volume: 0.5,
    })
    expect(plan.sfx.find((cue) => cue.kind === 'sting')).toBeUndefined()
  })

  it('is silent with no clips and no effects', () => {
    const plan = previewPlan({ scenes, clips: [], music: null, sfxFiles: null })
    expect(plan).toMatchObject({ total: 20, voices: [], music: null, sfx: [] })
  })
})
