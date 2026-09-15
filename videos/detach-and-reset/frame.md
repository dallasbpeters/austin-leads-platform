---
version: 1
name: Texas Solar and Roofing Pros — Frame (video / frame layer)
description: >
  Video-first design spec derived from the live site theme. Every value is
  lifted verbatim from src/styles/tokens.css and
  src/styles/texas-solar-and-roofing-pros-theme.css (oklch resolved to sRGB hex
  for the frame), plus the brand guide in CLAUDE.md. The unit is the frame
  (1920x1080). Atoms are sacred; composition is free.
unit: the frame — 1920x1080
source_of_truth:
  - ../../src/styles/tokens.css
  - ../../src/styles/texas-solar-and-roofing-pros-theme.css
  - ../../CLAUDE.md
  - ../../docs/voice-and-tone-guide.md

colors:
  # Ground — warm paper, never pure white
  warm-bg: '#fffcf5' # --color-warm-bg / --background
  surface: '#fbf9f2' # --color-surface / --muted
  surface-elevated: '#ffffff' # --color-surface-elevated
  paper: '#f9f7f4' # Warm Paper Surface (CLAUDE.md)
  mist: '#f8fafc' # Cool Mist Surface (CLAUDE.md)

  # Ink
  text-strong: '#020511' # --color-text-strong / --foreground
  text: '#0a121f' # --color-text
  midnight-slate: '#0f172a' # Midnight Slate Text (CLAUDE.md)
  charcoal: '#333333' # Charcoal Text (CLAUDE.md)
  steel-muted: '#62748e' # Steel Muted Text (CLAUDE.md)

  # Structure
  border: '#e4e4e4' # --color-border
  grid-line: '#eeeeee' # --color-grid-line

  # Brand
  primary: '#202646' # --color-primary, midnight navy
  primary-100: '#d7e3ff' # --color-primary-100
  secondary: '#3585f5' # --color-secondary, sky blue
  tertiary: '#566071' # --color-tertiary, steel
  flag-red: '#de1017' # --logo-flag-red, Texas Flag Red
  sunset-orange: '#ea580c' # Sunset Orange (CLAUDE.md)
  orange-500: '#ff9f00' # --color-orange-500
  golden-sun: '#ffd06b' # Golden Sun Eyebrow (CLAUDE.md)
  savings-green: '#00bb7f' # Savings Green (CLAUDE.md)
  alert-red: '#fb2c36' # Alert Red (CLAUDE.md)
  destructive: '#ef4343' # --destructive

  # Dark feature bands (hero / warning only)
  deep-sky: '#082f43' # Deep Sky Section (CLAUDE.md)
  night-sky: '#040a17' # Night Sky Section (CLAUDE.md)

typography:
  heading:
    family: 'Gloock'
    weight: 400
    source: 'Google Fonts (loaded by src/app/layout.jsx as --font-serif)'
    use: "Every frame headline. High-contrast serif; this is the brand's voice."
  display:
    family: 'BespokeSerif-Variable'
    source: 'assets/fonts/BespokeSerif-Variable.woff2'
    use: 'Large display statements and pull quotes only.'
  body:
    family: 'Switzer-Variable'
    weights: [300, 400, 500, 700]
    source: 'assets/fonts/Switzer-Variable.woff2 (--font-sans)'
    fallback: 'Helvetica, ui-sans-serif, system-ui'
    use: 'All body copy, captions, buttons, labels.'
  mono:
    family: 'JetBrains Mono'
    weight: 500
    source: 'Google Fonts (--font-mono)'
    tracking: '0.14em uppercase for chrome'
    use: 'Numbers, step counters, eyebrow labels, stat tiles. Figures must line up.'

scale:
  # Frame scale at 1920x1080. Web rem values multiplied for frame legibility.
  headline: '108px / 0.98 line-height / -0.02em'
  subhead: '56px / 1.12'
  body: '34px / 1.45'
  caption: '26px / 1.4'
  eyebrow: '22px / 0.14em tracking / uppercase / mono'
  counter: '160px mono'

radius:
  tight-chip: '4px' # .25rem
  button: '12px' # .75rem — also --radius
  card: '16px' # 1rem
  large-card: '24px' # 1.5rem
  section-panel: '36px' # 2.25rem
  pill: '999px'
  circle: '50%'

spacing:
  hairline: '1px'
  tight: '8px'
  base: '16px'
  relaxed: '24px'
  spacious: '32px'
  section: '24px'
  section-gap: '28px'
  frame-margin: '120px' # safe gutter at 1920x1080

shadow:
  color: '#b3b3b3'
  sm: '0.6px 0.6px 0.9px rgb(179 179 179 / 30%), 0.9px 0.9px 1.3px -1.5px rgb(179 179 179 / 28%)'
  note: 'Shadows stay faint. This is a paper brand, not a glass one.'

impeccable_pass: 2026-09-14
tokens: |
  Declared once per composition root, in OKLCH. Hue 273.77 is the brand
  primary's own hue, so every neutral is tinted toward the brand rather than
  being dead gray; chroma falls as lightness rises so nothing goes garish.
  --ground   oklch(10%   0.028 273.77)
  --surface  oklch(16.5% 0.032 273.77)
  --line     oklch(27%   0.030 273.77)
  --muted    oklch(80%   0.026 273.77)
  --text     oklch(95.5% 0.012 90)
  --paper    oklch(98.5% 0.014 90)
  --deep-sky oklch(31%   0.055 230)
  --gold     oklch(86% 0.13 82)    --sky   oklch(74% 0.15 258)
  --flag     oklch(57% 0.23 28)    --green oklch(80% 0.14 165)
  --orange   oklch(78% 0.17 73)    --alert oklch(74% 0.19 25)
type_scale: |
  Six steps, perfect fourth, every ratio >= 1.33. Seventeen ad-hoc sizes were
  collapsed into these; every frame headline is --t-5, which is what buys the
  contrast.
  --t-1 24px  chrome, mono labels, fine print
  --t-2 32px  notes, body
  --t-3 44px  lede, sub, secondary lines
  --t-4 76px  section titles
  --t-5 102px frame headlines
  --t-6 136px the one hero term
leading: |
  Light type on a dark ground reads lighter, so leading opens up.
  --lh-display 1.06 · --lh-title 1.10 · --lh-body 1.45
spacing: 4pt scale, --s-2 8 through --s-10 128; --gutter 128px
motion_pace: |
  Every tween duration eased out ~28% (staggers ~18%) on 2026-09-14 — the frames
  were snapping. No start position moved, so each beat still lands on the word
  that cues it; the moves just take longer to settle. Word cascades now run
  0.20-0.26s (were 0.13-0.20s). The f03 camera nudge keeps its original clock
  and chains its three phases off their own durations.
accent_budget: |
  60/30/10 by visual weight. Gold appears only on the warning frame and the
  active rail step. Every other eyebrow is --muted. One decorative glow survives
  in the whole film, on the warning frame, where the light is the point.
---

## Overview

A warm-paper, editorial system. The page ground is never pure white — it is
`warm-bg #fffcf5`. Headlines are Gloock, a high-contrast serif that carries the
brand's trustworthy, editorial feel. Everything else is Switzer. Numbers and
step counters are JetBrains Mono so figures line up and read as precise.

The emotional register is a trusted neighbor explaining a job — calm, plain,
unhurried. Not a sales pitch.

## The Frame

- 1920x1080, 120px safe margin on every edge.
- One idea per frame. The headline leads; support sits below or to one side.
- Warm paper ground on every frame except the warning beat, which uses the
  `deep-sky #082f43` band with `golden-sun #ffd06b` for its eyebrow label.

## Composition Rules

- **One accent per frame.** `flag-red` for the brand mark and the single call to
  action. `secondary` (sky blue) for the panels themselves. `orange-500` for
  sun and warmth. Never two loud accents in one frame.
- **Hairlines are the structural device.** 1px `grid-line #eeeeee` rules and
  roof lines. No heavy borders, no boxes around everything.
- **Savings green is only ever a positive number.** `alert-red` is only ever an
  error or a real risk. Neither is decoration.
- Build on a 4px grid.
- Lead the eye. Nothing is centered with equal weight except the closing mark.

## Do

- Lead with the number or the fact the homeowner asked about, then explain it.
- Use "we" and "you". One homeowner at a time.
- Name the local context: Texas, Central Texas, Austin, the county.
- Say numbers vary by roof, usage, utility, and carrier.

## Don't

- Don't mention the federal solar tax credit. It expired December 31, 2025.
- Don't use hype words: revolutionary, unbeatable, limited-time.
- Don't use jargon without a plain explanation right after it.
- Don't use gradient text, neon, or pure #000 / #fff.
- Don't hide caveats.
