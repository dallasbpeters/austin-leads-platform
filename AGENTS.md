# Austin Leads Platform Agent Guide

## Purpose

This repo is a multi-tenant Next.js platform for Austin/Texas lead-gen domains.

It currently has two parallel concerns:

1. The restored `Austin Solar Pros` homepage, which must keep its existing designed experience.
2. The broader platform foundation for multi-domain routing, admin workflows, Sanity content, analytics, and Vercel domain operations.

Do not treat this as a generic marketing site repo.

## Source Of Truth

- Public solar homepage:
  - `/` on localhost
  - [`src/App.jsx`](./src/App.jsx)
  - section components in [`src/components`](./src/components)
- Multi-tenant public renderer:
  - [`src/app/(site)/[[...slug]]/page.jsx`](./src/app/(site)/[[...slug]]/page.jsx)
  - [`src/components/platform/PublicSite.jsx`](./src/components/platform/PublicSite.jsx)
  - [`src/lib/platform/content.js`](./src/lib/platform/content.js)
  - [`src/lib/platform/fixtures.js`](./src/lib/platform/fixtures.js)
- Admin routes:
  - [`src/app/(admin)`](./src/app/(admin))
  - [`src/components/admin`](./src/components/admin)
- Auth:
  - [`src/auth.js`](./src/auth.js)
  - [`proxy.js`](./proxy.js)
- Sanity:
  - [`src/sanity`](./src/sanity)
  - [`sanity.config.js`](./sanity.config.js)
- Vercel/domain helpers:
  - [`src/lib/platform/vercel.js`](./src/lib/platform/vercel.js)

## Non-Negotiables

### Preserve the Austin Solar homepage

- The `austin-solar-pros` root route must continue to render the designed homepage from [`src/App.jsx`](./src/App.jsx).
- Do not silently replace it with the generic multi-tenant renderer.
- Do not rewrite its content or design direction unless explicitly requested.

### Styling rules

- Do not add CSS modules.
- Prefer:
  - Tailwind semantic utilities like `bg-primary`, `text-primary-foreground`, `border-border`, `bg-card`
  - semantic global classes for repeated primitives and behaviors in [`src/styles/globals.css`](./src/styles/globals.css)
- Avoid arbitrary-value utility strings that inline raw CSS variable references for theme values.
- If a pattern is reused, extract it into:
  - a shared component
  - or a short semantic global class

### Theme system

- The theme is driven by CSS variables in [`src/styles/globals.css`](./src/styles/globals.css).
- Tailwind semantic tokens should resolve through standard names:
  - `--background`
  - `--foreground`
  - `--primary`
  - `--primary-foreground`
  - `--secondary`
  - `--secondary-foreground`
  - `--muted`
  - `--muted-foreground`
  - `--accent`
  - `--accent-foreground`
  - `--border`
  - `--input`
  - `--ring`
- If colors need to change, update the variables first, not scattered component classes.

### Fonts

- Body/UI font: `Manrope`
- Display serif token: `--font-display`
- Be careful changing the display family name: the outlined hero text depends on the current configured family token.

## Platform Rules

### Multi-tenant behavior

- Host-based resolution lives in [`src/lib/platform/content.js`](./src/lib/platform/content.js).
- Redirect-only domains should stay redirect-only.
- Per-domain metadata, sitemap, robots, and JSON-LD should remain tenant-aware.

### Admin behavior

- `/dashboard`, `/analytics`, `/publish`, and `/domains` are protected routes.
- `/studio` should resolve to the single canonical Sanity-hosted Studio, not a separate embedded editor.
- Do not remove auth checks from admin routes or admin APIs.
- The admin UI should stay neutral and not inherit the orange public-site palette.

### Sanity behavior

- Sanity is the intended CMS.
- Fixture data exists as a development fallback, not the long-term content source of truth.
- The only Studio we use is the Sanity-hosted deployment.
- Local and Vercel `/studio` routes should redirect to that canonical Studio URL.

### Analytics behavior

- Avoid fake KPI reporting.
- Prefer real instrumentation readiness, provider status, and clear placeholders over invented metrics.

### Vercel behavior

- Vercel project is linked locally through `.vercel/project.json`.
- Domain management in the admin depends on live env vars:
  - `VERCEL_TOKEN`
  - `VERCEL_PROJECT_ID`
  - `VERCEL_TEAM_ID` and/or `VERCEL_TEAM_SLUG`

## Working Preferences

- Keep the public solar page visually stable.
- Prefer small, reversible changes.
- When touching shared primitives, verify both:
  - public solar page behavior
  - admin shadcn/Tailwind usage
- Run `pnpm build` after meaningful UI or routing changes.

## Environment Variables

Expected env vars are documented in [`.env.example`](./.env.example).

Important production-sensitive values:

- `AUTH_SECRET`
- `AUTH_ADMIN_EMAIL`
- `AUTH_ADMIN_PASSWORD`
- `SANITY_API_WRITE_TOKEN`
- `VERCEL_TOKEN`

Never print secret values back into chat or commit them.

## Skills To Use In This Repo

When relevant, use the local project skills in:

- [`.codex/skills/alp-platform`](./.codex/skills/alp-platform/SKILL.md)
- [`.codex/skills/alp-solar-homepage`](./.codex/skills/alp-solar-homepage/SKILL.md)
- [`.codex/skills/alp-theme-system`](./.codex/skills/alp-theme-system/SKILL.md)
