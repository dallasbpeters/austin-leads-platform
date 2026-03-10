# Austin Leads Platform

Multi-tenant Next.js platform for Austin/Texas local-service domains, with one shared codebase serving multiple branded sites.

This repo is currently in an in-between state:

- the public `Austin Solar Pros` homepage is still the existing designed marketing page
- the multi-tenant platform foundation is in place for the rest of the domains
- the admin surface is protected with Auth.js
- Sanity is wired as the intended CMS
- analytics and domain tooling are partially real and partially scaffolding

The goal is not "one website." The goal is one engine that can serve many domains with different content, branding, routing, SEO metadata, and operational workflows.

## Current State

### Public site

- `http://localhost:3000/` renders the restored `Austin Solar Pros` designed homepage.
- That homepage comes from [`src/App.jsx`](./src/App.jsx).
- Public routing is handled by [`src/app/(site)/[[...slug]]/page.jsx`](./src/app/(site)/[[...slug]]/page.jsx).
- For the `austin-solar-pros` tenant with no slug, the route intentionally falls back to `App.jsx`.
- Other tenants and deeper routes use the generic multi-tenant renderer in [`src/components/platform/PublicSite.jsx`](./src/components/platform/PublicSite.jsx).

### Admin surface

- Protected routes:
  - `/dashboard`
  - `/analytics`
  - `/publish`
  - `/domains`
- Auth is implemented with Auth.js v5 beta.
- The sign-in page is `/sign-in`.
- Admin layout and shell live in:
  - [`src/app/(admin)/layout.jsx`](./src/app/(admin)/layout.jsx)
  - [`src/components/admin/AdminShell.jsx`](./src/components/admin/AdminShell.jsx)
- Route protection is handled by [`proxy.js`](./proxy.js).
- Admin API routes are also protected server-side through [`src/lib/auth/guards.js`](./src/lib/auth/guards.js).

### Sanity

- Sanity project id is currently set to `xuhfhjna`.
- Sanity env defaults are defined in:
  - [`src/sanity/env.js`](./src/sanity/env.js)
  - [`.env.example`](./.env.example)
- Schema/config files:
  - [`sanity.config.js`](./sanity.config.js)
  - [`sanity.cli.js`](./sanity.cli.js)
  - [`src/sanity/schemaTypes`](./src/sanity/schemaTypes)
- The app can read from Sanity when env vars are present.
- The publish workflow can write to Sanity when `SANITY_API_WRITE_TOKEN` is present.

Important caveat:

- The canonical Studio is the Sanity-hosted deployment, configured by `NEXT_PUBLIC_SANITY_STUDIO_URL`.
- Local and Vercel `/studio` routes redirect to that canonical Studio so there is only one editor surface.

### Analytics

- Real client-side Vercel instrumentation is mounted in [`src/app/layout.jsx`](./src/app/layout.jsx):
  - `@vercel/analytics`
  - `@vercel/speed-insights`
- The analytics admin page is now instrumentation-first.
- It does **not** fake sessions/leads/conversion data anymore.
- The analytics page currently shows:
  - provider status
  - instrumentation readiness
  - KPI/goal definitions managed in the admin UI

Analytics state and helpers live in:

- [`src/lib/platform/store.js`](./src/lib/platform/store.js)
- [`src/components/admin/AnalyticsClient.jsx`](./src/components/admin/AnalyticsClient.jsx)

What is real today:

- Vercel Analytics and Speed Insights are mounted and will begin working on Vercel deployments.
- KPI goals can be created and managed in the UI.

What is not real yet:

- there is no real reporting backend feeding sessions/leads/query metrics into the dashboard
- GA4 and Search Console are not connected unless you add their env/config later

### Domain management

- Domain inventory and verification UI exists at `/domains`.
- Domain/Vercel helpers live in:
  - [`src/lib/platform/vercel.js`](./src/lib/platform/vercel.js)
  - [`src/app/api/domains`](./src/app/api/domains)
- With no Vercel credentials configured, the page falls back to placeholder verification instructions.
- With real Vercel credentials present, the connect/verify flow is intended to call the Vercel API.

### AI publishing

- The publish UI exists at `/publish`.
- It currently supports:
  - draft job creation
  - review state transitions
  - publish action handoff to Sanity
- Core files:
  - [`src/components/admin/PublishClient.jsx`](./src/components/admin/PublishClient.jsx)
  - [`src/app/api/publish-jobs`](./src/app/api/publish-jobs)

Important caveat:

- provider execution is still placeholder-oriented
- there is no durable queue, job database, or live model-provider orchestration yet

## Run Locally

### Install

```bash
pnpm install
```

### Start dev server

```bash
pnpm dev
```

### Production build

```bash
pnpm build
pnpm start
```

Notes:

- The build currently runs with `next build --webpack`.
- Turbopack build behavior was unstable during earlier setup, so webpack is the current safe default for production builds.

## Environment Variables

Copy [`.env.example`](./.env.example) to `.env.local` and fill in what you need.

### Required for current local auth

- `AUTH_SECRET`
- `AUTH_ADMIN_NAME`
- `AUTH_ADMIN_EMAIL`
- `AUTH_ADMIN_PASSWORD`

The local admin email is currently configured in `.env.local`.

The password is intentionally only stored in `.env.local`.

Before deployment:

- rotate the password
- rotate the auth secret
- copy them into Vercel environment variables

### Sanity

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_API_WRITE_TOKEN` for write/publish actions

### Optional analytics / search configuration

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `GOOGLE_SITE_VERIFICATION`

### Optional Vercel domain management

- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID`
- `VERCEL_TEAM_SLUG`

## Important Routes

### Public

- `/` -> current `Austin Solar Pros` designed homepage
- `/:slug` -> public tenant/platform pages
- `/robots.txt`
- `/sitemap.xml`

### Admin

- `/sign-in`
- `/dashboard`
- `/analytics`
- `/publish`
- `/domains`
- `/studio`

### APIs

- `/api/auth/[...nextauth]`
- `/api/publish-jobs`
- `/api/publish-jobs/[jobId]`
- `/api/domains`
- `/api/domains/[domain]/verify`
- `/api/analytics/goals`
- `/api/analytics/goals/[goalId]`

## Architecture Notes

### Tenant/content model

The tenant/domain/page scaffolding is currently driven by fixture data:

- [`src/lib/platform/fixtures.js`](./src/lib/platform/fixtures.js)
- [`src/lib/platform/content.js`](./src/lib/platform/content.js)

This is intentional for now so the app can build and route before the CMS data layer is fully live.

Long term, the fixture layer should shrink and Sanity should become the real source of truth.

### Auth

Auth uses a single environment-backed admin account right now.

This is acceptable for a protected internal tool during early development, but not the final auth model.

Longer term options:

- role-based Auth.js users backed by a database
- SSO for internal team access
- invitation-based team management

### Admin theme

The admin shell now uses a neutral theme override in [`src/styles/globals.css`](./src/styles/globals.css) under `.admin-theme`.

This keeps the public site brand palette separate from the internal operations UI.

## Known Limitations

These are the main issues still open:

1. The public solar homepage is restored, but the rest of the public-site multi-tenant templates are still a hybrid of placeholder data and generic rendering.
2. `/publish` still needs a closer pass to match the provided `publish.html` layout as tightly as `/dashboard`.
3. `/studio` is not a live embedded Sanity Studio yet.
4. Analytics is now honest, but not fully connected to a reporting backend.
5. Domain connect/verify only becomes truly live once Vercel credentials are configured.
6. Publish jobs and analytics goals are still kept in in-memory store state, not a durable database.
7. There is no persistent model for users, teams, permissions, or audit history yet.

## Recommended Next Steps

The safest order is:

### 1. Finish public-site ownership

- keep the existing designed `Austin Solar Pros` homepage as the canonical hero site
- decide whether additional solar pages should also reuse the original design system or move to the generic renderer
- migrate any remaining "generated" public content that should be replaced with real designed content

### 2. Finish admin template parity

- bring `/publish` into closer alignment with [`publish.html`](./publish.html)
- tighten `/domains` so it visually matches the same dashboard system
- add mobile nav behavior if internal users need tablet/phone access

### 3. Make analytics truly real

- define the canonical analytics stack:
  - Vercel Analytics only
  - Vercel + GA4
  - Vercel + GA4 + Search Console
- add real tracked events for:
  - lead form submit
  - CTA click
  - quote request start
  - publish job creation
  - domain verification complete
- decide where reporting data should come from for admin dashboards

### 4. Replace in-memory admin state

- move publish jobs into a durable database table
- move analytics goals into a durable table
- move domain inventory into durable storage if it becomes operationally important

### 5. Complete Sanity integration

- resolve embedded Studio compatibility with Next 16, or run Sanity Studio separately if that is faster
- replace fixture-driven pages with real Sanity documents
- add content seeding/migration scripts for initial tenant/page setup

### 6. Finalize Vercel domain ops

- add `VERCEL_TOKEN` and project/team env vars
- test add/verify flows against the actual Vercel project
- decide whether redirects should live in app logic, Vercel config, or both

### 7. Harden authentication

- move beyond a single env-backed admin account
- add proper user persistence and roles
- add session invalidation and audit visibility if multiple operators will use the system

## What To Check Before Deployment

Before a real Vercel deployment, verify:

- the admin credentials in `.env.local` have been rotated and copied to Vercel env vars
- Sanity write token is set if publish-to-CMS is expected to work
- Vercel domain env vars are set if domain management should be live
- any optional analytics providers are configured if needed
- the public homepage at `/` is still the intended designed solar page
- `/dashboard`, `/analytics`, `/publish`, `/domains`, and `/studio` all require auth

## Current Build Status

As of the current repo state:

- `pnpm build` passes
- public root restores the designed solar homepage
- admin auth is active
- analytics instrumentation is real at the client/runtime layer
- analytics reporting is still early-stage and intentionally conservative
