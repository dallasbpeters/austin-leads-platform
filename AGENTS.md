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
  - [`src/app/(site)/[[...slug]]/page.jsx`](<./src/app/(site)/[[...slug]]/page.jsx>)
  - [`src/components/platform/PublicSite.jsx`](./src/components/platform/PublicSite.jsx)
  - [`src/lib/platform/content.js`](./src/lib/platform/content.js)
  - [`src/lib/platform/fixtures.js`](./src/lib/platform/fixtures.js)
- Admin routes:
  - [`src/app/(admin)`](<./src/app/(admin)>)
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
- **Sanity document assistant** (optional): [`src/app/api/chat/route.js`](./src/app/api/chat/route.js) is **`POST /api/chat`** for **authenticated** users only—it connects Agent Context MCP to an LLM so editors can reason over **Sanity documents and schema** (GROQ tools, etc.). It is **not** a public floating chat. Studio registers `sanity.agentContext` via `@sanity/agent-context` in [`sanity.config.js`](./sanity.config.js). Env: [`.env.example`](./.env.example) (`SANITY_API_READ_TOKEN`, `SANITY_CONTEXT_MCP_URL`, `GROQ_API_KEY` and/or `ANTHROPIC_API_KEY`). Tune Instructions / `groqFilter` in Studio or use the `dial-your-context` skill.
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

## Learned User Preferences

- Always update both fixture data AND Sanity documents when changing content — reseeds overwrite Sanity data if fixtures are stale.
- Use `<Fragment key={...}>` (imported from `'react'`) instead of `<>` for keyed JSX list items; bare fragments cannot receive `key` props.
- Content updates made only in Sanity will be lost on the next reseed if the fixture is not also updated.
- Use one CSS-variable pattern across all per-domain theme files (e.g. `--font-sans`, `--color-primary`); do not introduce context-scoped names like `--font-admin`. Themes switch the values, not the variable names.
- Keep Sanity section schemas tightly in sync with their rendering component — trim schema fields the component does not read (e.g. [`src/components/CostsSection.jsx`](./src/components/CostsSection.jsx) vs its `pageType` section block).
- Theme variables must outrank Tailwind/shadcn `@layer components`; if a `--color-*` or `--font-*` looks undefined at runtime, check `@layer` ordering in [`src/styles/globals.css`](./src/styles/globals.css) before adding overrides.
- Components in [`src/components/platform/sections/`](./src/components/platform/sections/) must be thin forwarders to the canonical homepage component (e.g. `HeroSection.jsx` → `<Hero heroSection={section} />`). Never duplicate or fork section logic into the platform sections directory — fix the canonical component and let the section forward props.

## Learned Workspace Facts

- Sanity Studio dev server runs on `localhost:3334`; its auth is browser `localStorage`, separate from CLI auth at `~/.config/sanity/config.json`. When Studio appears read-only, sign out and back in from the Studio UI — do not check API tokens.
- `POST /api/sites` creates both a Sanity site doc (`_id: site-{slug}`) and a homepage doc (`type: 'page'`); every array item in a Sanity document requires a unique `_key` field.
- Domains admin API flows: `GET/PATCH /api/domains/[domain]`, `POST /api/sites`, `POST /api/domains` handle the three domain creation paths.
- Sanity Visual Editing (`VisualEditing` from `next-sanity`) overlay attributes (`editAttributes`) must only be spread on the single top-level wrapper div in `PublicSite.jsx` — never re-spread on section component root elements or any inner div. Duplicate spreads create nested overlays that intercept pointer events and silently break form inputs, selects, and other interactive elements.
- `deskTool` (from `sanity/desk`) is deprecated; use `structureTool` (from `sanity/structure`) instead.
- Page-level hero fields in the Sanity `page` schema are unused; section documents control all actual page content.
- Portable Text / rich text is used for body and paragraph fields; render `<PortableText>` output with `<div>` block wrappers (not `<p>`) to avoid invalid HTML nesting in Next.js.
- Per-domain theme CSS files live in [`src/styles/`](./src/styles/) and follow the `<domain-slug>-theme.css` pattern (e.g. `txchristmas-theme.css`, `texassolarandroofing-theme.css`). All theme files share the same CSS-variable shape so themes are switched, not redefined.
- Admin layout lives at [`src/app/(admin)/layout.jsx`](<./src/app/(admin)/layout.jsx>) and acts as a typical Next.js root layout; do not reintroduce a wrapper `AdminShell` component.
- Custom Sanity Presentation navigators live in [`src/sanity/components/`](./src/sanity/components/); multi-site preview URLs must be site-aware (preview host derives from the active site, not a hardcoded primary).
- Mapbox GL JS paint properties do not support modern CSS color spaces (lab(), oklch()) — always convert theme colors to sRGB hex/rgb() before passing to map layer paint configs. The correct env var for the Mapbox public token is `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
- `stegaClean` must be imported from `next-sanity` (not `@sanity/client/stega`); Sanity select/dropdown field values and hex color strings are stega-encoded at runtime and must be cleaned before use as map keys, object lookups, or any non-rendered context.
