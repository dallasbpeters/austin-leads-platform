---
version: alpha
name: Austin Leads Platform
description: Multi-tenant Texas lead-generation platform with a high-contrast flagship solar homepage and a neutral operational admin shell.
colors:
  primary: '#016BB7'
  primary-strong: '#016BB7'
  primary-soft: '#5AAFEF'
  secondary: '#0F363E'
  secondary-strong: '#31393F'
  secondary-soft: '#4D6A6F'
  tertiary: '#F8981B'
  tertiary-deep: '#C66F08'
  neutral: '#EEF3F7'
  neutral-warm: '#EFF5F6'
  surface: '#FFFFFF'
  surface-muted: '#DAE2E7'
  text: '#31393F'
  text-soft: '#4D6A6F'
  text-inverse: '#FFFFFF'
  admin-background: '#FAFAFA'
  admin-surface: '#FFFFFF'
  admin-text: '#1C1C1C'
  admin-muted: '#F5F5F5'
  admin-border: '#EBEBEB'
typography:
  h1:
    fontFamily: BespokeSerif-Variable
    fontSize: 6rem
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: -0.02em
    fontVariation: '"wght" 800'
  h2:
    fontFamily: BespokeSerif-Variable
    fontSize: 3rem
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -0.02em
    fontVariation: '"wght" 760'
  body-lg:
    fontFamily: Switzer-Variable
    fontSize: 1.125rem
    fontWeight: 650
    lineHeight: 1.7
    letterSpacing: 0em
    fontVariation: '"wght" 650'
  body-md:
    fontFamily: Switzer-Variable
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.7
    letterSpacing: 0em
    fontVariation: '"wght" 500'
  label-caps:
    fontFamily: Switzer-Variable
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.2em
    fontVariation: '"wght" 700'
  button-md:
    fontFamily: Switzer-Variable
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.02em
    fontVariation: '"wght" 700'
rounded:
  sm: 12px
  md: 16px
  lg: 24px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  hero-gutter: 64px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.text-inverse}'
    typography: '{typography.button-md}'
    rounded: '{rounded.pill}'
    padding: 16px
    height: 56px
  button-secondary:
    backgroundColor: '{colors.neutral-warm}'
    textColor: '{colors.secondary}'
    typography: '{typography.button-md}'
    rounded: '{rounded.pill}'
    padding: 16px
    height: 56px
  button-admin:
    backgroundColor: '{colors.admin-text}'
    textColor: '{colors.text-inverse}'
    typography: '{typography.button-md}'
    rounded: '{rounded.sm}'
    padding: 16px
    height: 40px
  card-surface:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.md}'
    padding: 24px
  card-hero-glass:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-inverse}'
    rounded: '{rounded.lg}'
    padding: 24px
  badge-eyebrow:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.secondary}'
    typography: '{typography.label-caps}'
    rounded: '{rounded.pill}'
    padding: 8px
---

## Overview

Austin Leads Platform should feel like two related products sharing one codebase:

- The public flagship experience is bright, editorial, and high-contrast. It mixes warm off-white surfaces, saturated utility blue, deep teal text, and sharp amber highlights. The overall effect should feel like modern regional journalism crossed with premium home-services advice: confident, useful, and a little theatrical.
- The admin experience is intentionally calmer. It uses a neutral black, white, and gray shell so operators feel like they are inside a tool, not inside the consumer-facing marketing brand.

The public site should not read like a generic SaaS dashboard or a template-heavy marketing page. It should feel roomy, typographic, and deliberate, with bold serif display moments, strong section rhythm, and occasional glass or image-overlay treatments. The admin should be utilitarian, quiet, and legible.

## Colors

The public palette is built around three roles:

- **Primary (`#016BB7`)** is the brand engine. Use it for primary actions, focused highlights, and compact emphasis.
- **Secondary (`#0F363E`)** is the structural ink. It should carry headlines, navigation framing, dark surfaces, and anything that needs visual authority.
- **Tertiary (`#F8981B`)** is the warm accent. Use it sparingly for high-energy highlights, supportive emphasis, and occasional contrast against the cooler palette.

Neutrals should stay warm rather than clinical:

- **Neutral (`#EEF3F7`)** and **Neutral Warm (`#EFF5F6`)** are the default page-field tones.
- **Surface (`#FFFFFF`)** is reserved for elevated cards and clean content modules.
- **Text (`#31393F`)** and **Text Soft (`#4D6A6F`)** should carry nearly all body copy.

For admin, switch to a separate neutral mode:

- **Admin Background (`#FAFAFA`)**
- **Admin Surface (`#FFFFFF`)**
- **Admin Text (`#1C1C1C`)**
- **Admin Border (`#EBEBEB`)**

Do not let the public orange-and-blue voice bleed into the admin shell unless a specific public-facing admin artifact is being intentionally branded.

## Typography

Typography is the main signature of the public experience.

- **Display serif:** `BespokeSerif-Variable` should drive hero headlines and major section titles. It should feel assertive, slightly dramatic, and never overly delicate.
- **UI and body sans:** `Switzer-Variable` should carry navigation, body copy, buttons, forms, and metadata. It should feel contemporary and crisp rather than soft or friendly-rounded.

The most important relationship is contrast:

- public headlines should feel large, compressed, and high-stakes
- supporting copy should feel readable and calm
- labels should often be uppercase with generous tracking

Avoid pairing the serif with weak body hierarchy. The serif works best when it is given space and surrounded by disciplined sans-serif scaffolding.

## Layout

The public layout should feel open and architectural, not dense.

- Prefer large horizontal canvases and generous side gutters.
- Let sections breathe with 24px, 32px, and 48px spacing steps.
- Hero zones can use oversized vertical rhythm and dramatic scale jumps.
- Cards should sit inside wide containers rather than edge-to-edge blocks.

The public homepage especially benefits from asymmetry: large headline areas paired with compact supporting cards, metrics, or media. Background treatments can include subtle grids, radial fades, and image overlays, but they should support the typography rather than compete with it.

The admin layout should be much tighter and more regular:

- consistent table and form spacing
- shallow headers
- predictable card grids
- restrained whitespace optimized for scanning

## Elevation & Depth

Depth should feel soft and intentional.

- Standard public cards use light elevation on bright surfaces.
- Important CTAs can use stronger brand-tinted shadow or sharper contrast.
- Image-backed hero cards may use translucent white glass with blur, especially on dark photography.

Avoid heavy, muddy shadows. Public depth should suggest polish and separation, not material heaviness. Admin depth should be even more restrained: light borders first, subtle shadow second.

## Shapes

The system uses rounded geometry, but not playful bubble shapes.

- Standard controls and cards should use 12px to 16px radii.
- Larger editorial cards can stretch to 24px.
- Primary public buttons should usually be pills.
- Admin actions should usually use smaller, more rectangular radii.

Corners should feel smooth and premium, but the typography and spacing should remain the dominant identity cues.

## Components

### Public buttons

Primary public buttons should be blue pills with white text and strong weight. They should feel assertive and slightly glossy through contrast, not through gradient gimmicks.

Secondary public buttons should use light ceramic surfaces with deep teal text. They can act as softer supporting actions without disappearing into the page.

### Hero treatment

The flagship solar hero should feel cinematic but readable:

- huge serif headline
- optional outlined second line
- darkened photo or slideshow backdrop when media is present
- a compact glass card for supporting copy
- a small tracked eyebrow label to establish context

The hero can be dramatic, but it must remain legible and grounded in practical service value.

### Cards

Public cards should feel like editorial modules placed on a warm field. Use white or near-white surfaces, clear borders when needed, and restrained shadow. Content density should stay moderate; these cards work best when they frame a single thought cleanly.

Admin cards should be flatter and quieter. They are containers for tools and data, not expressive brand objects.

### Navigation and labels

Small uppercase labels with tracking are a recurring public motif. Use them to create section rhythm, but do not overuse them in body-heavy areas. Navigation should feel light, organized, and text-led rather than icon-led.

## Do's and Don'ts

Do:

- preserve the bespoke solar homepage as the loudest expression of the brand
- use serif display type for major public moments and sans-serif for everything operational
- keep public surfaces warm and airy
- use amber as an accent, not a full-page fill
- keep admin visuals neutral and product-like

Don't:

- turn the public site into a generic dashboard aesthetic
- flatten everything into monochrome minimalism
- use the public blue and amber palette heavily inside admin
- replace roomy editorial spacing with cramped utility layouts
- introduce soft pastel branding, purple-heavy accents, or playful consumer-app styling
