---
name: alp-theme-system
description: Use when changing colors, typography, Tailwind theme tokens, shared UI primitives, or semantic styling conventions in this repo. Especially relevant when mapping the project's CSS variable system to Tailwind names like primary, secondary, muted, card, border, and foreground.
---

# Austin Leads Theme System

Use this skill for styling-system work.

## Source files

- [`src/styles/globals.css`](../../../src/styles/globals.css)
- [`src/components/Button.jsx`](../../../src/components/Button.jsx)
- [`src/components/Card.jsx`](../../../src/components/Card.jsx)
- [`src/components/ui`](../../../src/components/ui)

## Rules

- The CSS variable system is the source of truth.
- Tailwind semantic utilities should resolve through standard names:
  - `background`
  - `foreground`
  - `primary`
  - `primary-foreground`
  - `secondary`
  - `secondary-foreground`
  - `muted`
  - `muted-foreground`
  - `accent`
  - `accent-foreground`
  - `border`
  - `input`
  - `ring`
- Avoid arbitrary-value theme classes that inline raw CSS variable references.
- If JSX gets noisy, extract repeated styling into short semantic global classes or shared primitives.
- Keep admin theme overrides separate from the public-site palette.

## Validation

- Run `pnpm build`
- Check that shadcn components still resolve semantic colors correctly
- Check that the public solar page still matches the intended brand palette and typography
