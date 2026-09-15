---
workflow: general-video
flow: companion
storyboard: yes
message: 'Your Texas roof lasts 20 years and your panels last 25 — getting the order wrong costs $5,400'
destination: website-guide
aspect: 1920x1080
language: en
length: 64s
angle: concept
voice: elevenlabs:FpctH3pqgHOSrmaRotxS
---

## Intent

A data explainer for a Central Texas homeowner deciding whether to put solar on
their current roof. The earlier cut walked through the detach-and-reset process
step by step and taught nothing — a homeowner could guess all of it, and there
was not one number on screen.

This cut is built on three datasets already in the repo (docs/chart-imports/):
detach-and-reset pricing by system size, real-world Texas roof lifespan against
manufacturer warranty, and separate-vs-combined project totals. The thesis is
arithmetic the homeowner cannot get anywhere else: a Texas architectural shingle
roof gives about 20 years, panels are warranted 25, so the collision is
guaranteed — and getting the sequence wrong costs $5,400 on a typical 8 kW job.

Tone stays the brand voice: warm, plain, direct, every figure captioned with what
it varies by. No hype, no urgency.

## Assets

- User-supplied narration script (8 lines), reshaped per scene, wording kept close.
- assets/video/installers.mp4 — user-supplied, 10s, 1920x1080, 24fps. Six distinct
  shots; scene cuts at 1.46 / 3.29 / 5.17 / 6.79 / 8.42s. Used in five of the six
  frames, each range trimmed with data-media-start + data-duration and stretched to
  its window with a constant data-playback-rate. Muted throughout — the voiceover
  owns the sound, so the clip's own audio track is never mounted.
  A 0.05-1.41 wide aerial, crew on roof -> frame 01 hero (rate 0.358)
  B 1.52-3.23 kneeling, working shingles -> step 02 (rate 0.518)
  C 3.35-5.11 two installers, panel -> step 01 (rate 0.451)
  D 5.23-6.73 gloved hands, clamp -> frame 04 sealed mount (rate 0.333)
  E 6.85-8.36 drill into rail -> step 03 (rate 0.686)
  F 8.48-9.94 finished array, wide -> frame 06 close (rate 0.298)
- assets/photos/*.jpg — real crew photography pulled from the company's own
  /our-process page (captured 2026-09-14). That page documents this exact job in
  nine steps with a photo each, so the film's visual vocabulary comes from the
  source rather than being invented. Frames 01, 03 and 04 are built on it.
- assets/brand/tx-solar-logo.svg — brand mark, from public/tx-solar-logo.svg.
- capture/ — full hyperframes capture of /our-process (screenshots, tokens, text).
- frame.md — design spec, brand truth for every frame.
- assets/fonts/Switzer-Variable.woff2 — body/label typeface, copied from public/fonts.
- assets/fonts/BespokeSerif-Variable.woff2 — display typeface, copied from public/fonts.
- ../../src/styles/tokens.css — token source.
- ../../src/styles/texas-solar-and-roofing-pros-theme.css — tenant theme source.

## Customizations

- Voiceover: ElevenLabs, voice "Dallas Salesman" (FpctH3pqgHOSrmaRotxS), speed 1.0 (natural).
- Closing line carries a real call to action, taken from the company's own
  content pack: "Send us your roof age and a year of electric bills and we'll map
  out your best next step." Phone 512-400-3763 and the domain are on screen and
  hold to the last frame.
- Background bed: assets/audio/bed.mp3, generated with the ElevenLabs Music API
  (66s for a 64.2s film). Mounted on its own track at 0.16 volume and carved
  under the narration with /hyperframes-audio carve.mjs — a six-band EQ carve
  (160/250/400/630/1600/2500 Hz) plus a 311-point level envelope, floor -19.2 dB.
  The six narration clips sit on an <hf-audio-group id="voiceover"> bus so the
  carve tracks the role, not six clip ids that would drift on the next re-record.
  Frame lengths are the measured take plus a 0.35s lead-in and a ~0.5s tail, so
  there is no dead air between frames. Total run 31.1s.
  API key read at run time from 1Password: `op read "op://Employee/rg5y4esghc7bplurkwe7x4w55y/credential"`.
  The key is never written to a file in this repo.
- Dark theme: the film uses Night Sky #040a17 as its ground, matching the live
  /our-process page, which is also dark. Frame 05 keeps Deep Sky #082f43.
- The three-step frame reproduces the /our-process step rail in motion: one step
  fills the frame, the column advances on each spoken "Then", the rail dot lights.
- Design: NO shipped preset. The video uses the site's own theme variables.
  `frame.md` at this project root is the brand truth, derived verbatim from
  src/styles/tokens.css, src/styles/texas-solar-and-roofing-pros-theme.css, and
  the brand guide in CLAUDE.md. oklch values resolved to sRGB hex for the frame.

## Notes

- Brand guide lives at /Users/dallas/Development/austin-leads-platform/CLAUDE.md
  and /docs/voice-and-tone-guide.md.
- Do NOT mention the federal solar tax credit. It expired December 31, 2025.
- Always say numbers vary by roof, usage, utility, and carrier.
- No hype words: revolutionary, unbeatable, limited-time.
- The warranty warning is the payoff beat, not a footnote.

## Source script (user's words)

Your roof needs replacing, but solar panels are bolted to it.
Here is how a detach and reset works.
Crews remove the panels and store them safely on site.
Roofers replace the shingles underneath.
Then the panels go back on new, sealed mounts.
One warning: some solar warranties end if a different company moves the panels.
Check your paperwork first.
Get the detach cost in writing before the roofing bid.

## Data sources — every figure on screen

- docs/chart-imports/solar-panel-detach-and-reset-bar.json
  $1,800 / $2,500 / $3,500 / $4,200 / $5,200 by system size. Frame 01.
- docs/chart-imports/when-to-replace-your-roof-texas-composed.json
  Architectural shingle: 20 yrs real vs 30 yrs warranty. Frames 02 and 03.
- docs/chart-imports/solar-warranties-texas-composed.json
  Mid-tier panel warranty 25 yrs. Frames 02 and 03.
- docs/chart-imports/planning-roof-and-solar-together-bar.json
  $12,000 / $22,400 / $38,400 / $33,000. Frame 04. The $5,400 delta is derived.

Nothing on screen is invented. If any of these change, the film has to change.
