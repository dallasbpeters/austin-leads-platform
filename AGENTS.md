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
  - [`src/auth.js`](./src/auth.js) — NextAuth (credentials + optional Google for dashboard); Google allowed only for emails present as active `platform_users` or `AUTH_ADMIN_EMAIL`.
  - [`src/proxy.js`](./src/proxy.js)
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
- Keep Sanity section schemas tightly in sync with their rendering component — trim schema fields the component does not read (e.g. [`src/components/CostsSection.jsx`](./src/components/CostsSection.jsx) vs its `pageType` section block). For Studio array rows, keep the block type readable in `preview.prepare` (prefix the section/item label before body excerpts; `previewText(body, …)` alone hides the type once body has content). List previews only honor `title`, `subtitle`, and `media` — put extras like formatted prices in `subtitle`, not custom return keys.
- Theme variables must outrank Tailwind/shadcn `@layer components`; if a `--color-*` or `--font-*` looks undefined at runtime, check `@layer` ordering in [`src/styles/globals.css`](./src/styles/globals.css) before adding overrides.
- Components in [`src/components/platform/sections/`](./src/components/platform/sections/) must be thin forwarders to the canonical homepage component (e.g. `HeroSection.jsx` → `<Hero heroSection={section} />`). Never duplicate or fork section logic into the platform sections directory — fix the canonical component and let the section forward props.
- Always clean up unused imports immediately after making code changes — do not leave dead import statements behind.
- Use `!= null` (not truthiness) to guard numeric field renders — a truthiness check treats `0` as falsy and silently suppresses valid zero-value output (e.g. a `$0` price never displays). Format currency on the public site to a fixed number of decimal places (e.g. USD via `toLocaleString` with `minimumFractionDigits`/`maximumFractionDigits` or `toFixed(2)`), not raw `${number}` interpolation.
- When a shared `Button` (or `asChild`/`Slot`-style primitive) renders a DOM element, omit custom props (`pill`, `fullWidth`, etc.) from the underlying tag so React does not forward unknown boolean attributes (`Received true for non-boolean attribute …`); do not stack extra `rounded-*` on pill variants (`shape="pill"` / `.btn--pill`)—utilities outrank `@layer components` and block pill styling on `<button>` and anchor renders.
- When subagent or parallel-task output is already visible in the chat UI, skip re-summarizing it; give a brief third-person completion note unless multi-task synthesis is explicitly requested.
- For Framer Motion `AnimatePresence`, give the animated child a `key` that changes when the stepped or swapped content changes (e.g. `key={step}`); otherwise React may update in place and exit/enter animations will not run.

## Learned Workspace Facts

- Sanity Studio dev server runs on `localhost:3334`; its auth is browser `localStorage`, separate from CLI auth at `~/.config/sanity/config.json`. When Studio appears read-only, sign out and back in from the Studio UI — do not check API tokens. Sanity AI Assist (the ✨ field tools in Studio) is gated by plan/billing; if Studio directs you to contact sales or an account manager, Assist is not enabled for that org—distinct from optional Agent Context (`POST /api/chat`) and Gemini image drafting.
- `POST /api/sites` creates both a Sanity site doc (`_id: site-{slug}`) and a homepage doc (`type: 'page'`); every Sanity array item requires a unique `_key` field. Domain creation flows: `POST /api/sites` (new site), `POST /api/domains` (existing site), `GET/PATCH /api/domains/[domain]` (manage existing).
- Always verify GROQ projections in `src/lib/platform/content.js` include every field the rendering component uses — missing fields silently arrive as `undefined` and conditional renders fail with no error. Pay extra attention to array projections like `items[]`, `roofingItems[]`, and `secondaryItems[]` when adding new fields. For `resolveSiteBySlug` / `/_site/` preview routing, fetch `site` documents with the **published** Sanity client even when draft mode is on (`getSanityServerClient({ preview: false })`): site configs are published data; using the draft/preview client can return null (404 on `/_site/…`) without a valid viewer token.
- Sanity Visual Editing (`VisualEditing` from `next-sanity`) overlay attributes (`editAttributes`) must only be spread on the single top-level wrapper div in `PublicSite.jsx` — never re-spread on section component root elements or any inner div. Duplicate spreads create nested overlays that intercept pointer events and silently break form inputs, selects, and other interactive elements.
- `deskTool` (from `sanity/desk`) is deprecated; use `structureTool` (from `sanity/structure`) instead. Global element resets in `globals.css` (e.g. `img`, `h1–h6`, `a`) bleed into `@sanity/ui` components rendered in the Presentation overlay; scope those resets away with `[data-ui] * { revert; }` to prevent corrupting hotspot dialogs and other Studio UI. `@planetary/sanity-plugin-preflight` (`Preflight`, `DeadLinks`, `SEOAudit`) is wired via [`src/sanity/defaultDocumentNode.js`](./src/sanity/defaultDocumentNode.js) — `structureTool({ structure, defaultDocumentNode })` in [`sanity.config.js`](./sanity.config.js) registers per-document Preflight views for `page`/`post`/`servicePage`/`locationPage`; do **not** also add it to `defineConfig({ plugins: [...] })`. Orphan `src/lib/sanity/deskStructure.ts` snippets pasted from plugin READMEs (missing `S` import, wrong folder/language) should be removed, not "fixed."
- Portable Text / rich text is used for body and paragraph fields; never render a Portable Text block array directly as a React child — use `<PortableText>` with `<div>` block wrappers in public views, or a `portableTextToPlain(blocks)` helper for plain-text admin previews.
- In Next.js 16 the proxy (formerly middleware) lives at [`src/proxy.js`](./src/proxy.js); export the request handler as **`export async function proxy`**. The `config.matcher` export is unchanged. On `route.js`/`route.jsx` **API** handlers, do not export opengraph-image-only keys (`contentType`, `alt`, `size`); those belong to the `opengraph-image` file convention—set `Content-Type` on the `Response` and keep OG dimensions in ordinary constants.
- `@sanity/client` v7 typings require **TypeScript 5.1+** (e.g. `const` type parameters). With Next.js, prefer `moduleResolution: "bundler"` over legacy `"node"`. After Stripe SDK bumps, update `apiVersion` literals in scripts to match the installed `stripe` package’s typed default.
- Per-domain theme CSS files live in [`src/styles/`](./src/styles/) and follow the `<slug>-theme.css` pattern, all sharing the same CSS-variable shape so themes are switched, not redefined. Public tenant palettes (`texas-solar-and-roofing-pros-theme.css`, `txchristmaslights-theme.css`) are **not** imported from `globals.css`; [`PublicTenantThemeStyles`](./src/components/platform/PublicTenantThemeStyles.jsx) `await import()`s exactly one per request from [`(site)/layout.jsx`](<./src/app/(site)/layout.jsx>) and [`preview/[siteSlug]`](./src/app/preview/[siteSlug]/[[...slug]]/page.jsx) so the inactive tenant's CSS is never bundled/parsed. `admin-theme.css` stays in globals for operator routes. Tenant blocks use **`[data-public-site="texas-solar-and-roofing-pros"]`** and **`[data-public-site="txchristmaslights"]`**. [`src/proxy.js`](./src/proxy.js) sets `x-alp-operator-shell` on admin/API paths; it rewrites **`/\_site/:slug/**`Presentation URLs to`?**site=`and sets`x-alp-preview-site-slug`; it also sets that header for `/preview/…` and for **`?**site=`\*\* when the request is allowed the same site override as [`site-page.js`](./src/lib/platform/site-page.js) (localhost or draft / `\_\_prerender_bypass` cookie). [`src/app/layout.jsx`](./src/app/layout.jsx) maps that header to `data-public-site`on`<html>` for public routes so Radix portals inherit the correct tokens. Admin layout is [`src/app/(admin)/layout.jsx`](<./src/app/(admin)/layout.jsx>) (standard Next.js root layout; do not reintroduce an `AdminShell`wrapper). For`txchristmaslights`, do not let Sanity `site.brand`HSL apply as inline wrapper vars—those override Christmas tokens like`--color-primary-h`; the theme CSS should own that ramp (`PublicSiteUtils.getSiteBrandStyleVars`/`siteUsesThemeOwnedHslRamp`).
- Concurrent Postgres DDL (`CREATE TABLE IF NOT EXISTS`) is not fully race-safe (e.g. Neon/serverless): parallel calls can throw `duplicate key value violates unique constraint "pg_type_typname_nsp_index"`. Memoize or serialize bootstrap DDL per process and treat that specific conflict as benign once the table exists.
- Custom Sanity Presentation navigators live in [`src/sanity/components/`](./src/sanity/components/); multi-site preview URLs must be site-aware (preview host derives from the active site, not a hardcoded primary).
- Mapbox GL JS paint properties do not support modern CSS color spaces (lab(), oklch()) — convert theme colors to sRGB hex/rgb() before map paint configs; env var `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`. Import `stegaClean` from `next-sanity` (not `@sanity/client/stega`); Sanity select values and hex colors are often stega-encoded — clean before map keys, object lookups, or other non-rendered use.
- All Postgres access goes through the centralized pool in [`src/lib/db/pool.js`](./src/lib/db/pool.js) (Next/webpack) and the parallel [`src/lib/db/pool.mjs`](./src/lib/db/pool.mjs) (Node scripts run via `node --env-file=…`). The five DB modules — [`src/lib/leads/db.js`](./src/lib/leads/db.js), [`src/lib/leads/db.mjs`](./src/lib/leads/db.mjs), [`src/lib/christmas/db.js`](./src/lib/christmas/db.js), [`src/lib/auth/users.js`](./src/lib/auth/users.js), [`src/lib/platform/domain-db.js`](./src/lib/platform/domain-db.js) — all `import { getSql, hasDatabaseUrl } from '../db/pool…'` and share one `globalThis`-cached `pg.Pool`. Connection-string resolution order: `DATABASE_URL` → `STORAGEDB_POSTGRES_URL_NON_POOLING` → `STORAGEDB_POSTGRES_URL` → legacy `POSTGRES_URL_NON_POOLING` / `POSTGRES_URL`. Production runs on **Supabase Postgres 17.6** (migrated off Neon 2026-05-15, 151 rows across 6 tables); Supabase ships self-signed certs, so the URL must have any `sslmode=`/`supa=` params stripped and `ssl: { rejectUnauthorized: false }` set explicitly — modern `pg` treats `sslmode=require` as `verify-full` and rejects otherwise. Tagged-template `sql` shim builds `$1, $2, …` placeholders from interpolations and returns `result.rows` directly, so existing call sites (`const [row] = await sql\`…\``) work unchanged. Pool config: `max: 5`, `connectionTimeoutMillis: 8000`, `idleTimeoutMillis: 30000`. Schema bootstrap via `pnpm db:setup` (runs [`scripts/setup-db.mjs`](./scripts/setup-db.mjs)) and one-shot Neon→Supabase data copy via `pnpm db:migrate-from-neon` ([`scripts/migrate-data.mjs`](./scripts/migrate-data.mjs)); both read `.env.development.local`, not `.env.local`.
- [`.sanity/runtime/app.js`](./.sanity/runtime/app.js) and [`.sanity/runtime/index.html`](./.sanity/runtime/index.html) are auto-generated on `sanity dev` (file header: `// Modifications to this file is automatically discarded`) — revert local edits with `git checkout -- .sanity/runtime/`, do not patch them. The `renderStudio` deprecation strikethrough is a TypeScript IDE quirk: only the boolean-options overload is `@deprecated`, and the generated call already uses the non-deprecated `RenderStudioOptions` object form (`{reactStrictMode, basePath}`), so no source fix is required.
- `pnpm build` runs Next.js with `--webpack`, while `pnpm dev` defaults to Turbopack in Next 16. After a Next minor bump (e.g. `16.1.6 → 16.2.6`) Turbopack can panic with template-injection invariants (`Expected to inject all imports`, `missing VAR_MODULE_GLOBAL_ERROR in template`) against stale 16.x build artifacts; stop dev and run `rm -rf .next node_modules/.cache .sanity/runtime && pnpm install && pnpm dev`. Fallback while a new Turbopack release stabilizes: `pnpm next dev --webpack` to match the build pipeline. [`scripts/dev-all.mjs`](./scripts/dev-all.mjs) (invoked by `pnpm dev`) spawns three children (`next`, `sanity`, `stripe listen --forward-to localhost:3000/api/stripe/webhook`); the Stripe child must be `{ name: 'stripe', args: ['run', 'stripe'] }` (the literal command string is in `package.json`, not the args). Before spawning, the script runs `stripe listen --print-secret`, extracts `whsec_…`, and rewrites `STRIPE_WEBHOOK_SECRET` in `.env.development.local` (idempotent — skips write if unchanged) because the Stripe CLI rotates the signing secret per session; failures are non-fatal so dev still boots.
- Admin server components that load external data (e.g. [`src/app/(admin)/crm/page.jsx`](<./src/app/(admin)/crm/page.jsx>)) must distinguish `dbConfigured` vs `leadDbReady` vs a serialized `dbError` and forward all three to the client (`CrmClient`); never bare-`catch` a DB/fetch error and reuse the "missing env var" empty state, or the UI tells users to configure something already configured. Always `console.error` the caught error server-side so the dev terminal still surfaces the real stack.
- PostHog is multi-project (one project per tenant site). Both browser SDK ([`src/app/providers.jsx`](./src/app/providers.jsx)) and server client ([`src/lib/posthog-server.ts`](./src/lib/posthog-server.ts)) resolve the API key from the per-site JSON map env var **`NEXT_PUBLIC_POSTHOG_KEYS`** keyed by site slug — never the single-project `NEXT_PUBLIC_POSTHOG_KEY` (the install wizard's default), which doesn't exist in this codebase and silently constructs `new PostHog(undefined, …)` so server events vanish. Server callers must pass the site slug explicitly: `getPostHogClient(siteSlug)`. The browser SDK's `loaded:` callback registers `site_slug` as a super-property via `instance.register({ site_slug })` so every event auto-tags the active tenant; explicit per-event `site_slug` props still override it. Browser SDK initializes once per page load (deps `[]`); soft-nav between `/_site/<slug>` routes in dev does **not** reinit the SDK — verify cross-tenant behavior with a hard reload.

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `pnpm dlx ultracite fix` before committing to ensure compliance.
