# Austin Leads Platform

Austin Leads Platform is a multi-tenant Next.js application for Texas local-service lead generation. It combines:

- a preserved custom homepage for `Texas Solar & Roofing Pros`
- a generic public renderer for the rest of the tenant pages
- a protected internal admin for operations
- Sanity as the working CMS
- lead routing, domain operations, analytics readiness, and content tooling

This repo is not a generic brochure site. It is one engine serving multiple domains, content sets, and admin workflows.

## What Is In The App

### Public site

- `/` renders the preserved Austin Solar homepage from [`src/App.jsx`](./src/App.jsx)
- the generic tenant renderer lives in [`src/components/platform/PublicSite.jsx`](./src/components/platform/PublicSite.jsx)
- catch-all public routing lives in [`src/app/(site)/[[...slug]]/page.jsx`](<./src/app/(site)/[[...slug]]/page.jsx>)
- tenant/content resolution lives in [`src/lib/platform/content.js`](./src/lib/platform/content.js)

Current public page families include:

- home and top-level pages like `/about`, `/services`, `/roofing`, `/solar`, `/hail-damage`, `/guides`
- service detail pages at `/services/[serviceSlug]`
- guide detail pages at `/guides/[guideSlug]`
- legal pages such as `/privacy-policy` and `/terms`
- hail weather lookup and storm-history mapping
- OG image generation through `/api/og`

### Admin

Protected admin routes currently include:

- `/dashboard`
- `/analytics`
- `/crm`
- `/hero-pages`
- `/publish`
- `/domains`
- `/settings`
- `/studio`

Admin navigation is defined in [`src/components/admin/AdminNav.jsx`](./src/components/admin/AdminNav.jsx).

What the admin currently does:

- `Dashboard`
  - checklist progress
  - publish queue snapshot
  - analytics readiness / GA4 snapshot
  - lead overview when Neon is configured
- `Analytics`
  - provider status
  - goals management
  - GA4 reporting when credentials exist
- `CRM`
  - lead table and right-side detail drawer
  - status, pipeline, priority, notes, owner, and follow-up editing
- `Hero Pages`
  - create hero-tier page records in Sanity
  - search Unsplash
  - attach hero image metadata
  - edit hero gradient/appearance values
- `Publish`
  - create draft jobs
  - move jobs through approve/reject/publish states
  - hand off a basic published document into Sanity
- `Domains`
  - view domain inventory
  - verify/connect flow against Vercel when credentials exist
- `Settings`
  - lead-routing settings
  - Resend sender/recipient/template configuration
- `Studio`
  - redirect to the canonical Sanity Studio

### CMS and content operations

Sanity is the intended content system.

Important files:

- config: [`sanity.config.js`](./sanity.config.js)
- env helpers: [`src/sanity/env.js`](./src/sanity/env.js)
- schema: [`src/sanity/schemaTypes`](./src/sanity/schemaTypes)
- Presentation/Visual Editing wiring: [`src/sanity/presentation.js`](./src/sanity/presentation.js), [`src/sanity/live.jsx`](./src/sanity/live.jsx)

Current content model reality:

- Sanity is live and heavily used
- some fallback fixture content still exists for bootstrapping and local safety
- service pages, guides, launch checklist, lead routing settings, and hero-page tools are all connected to Sanity
- the app still uses fixtures as a fallback layer where Sanity content is missing

### Leads and notifications

Lead capture is wired into:

- public forms
- Neon storage when configured
- admin CRM
- Resend email notifications

Key files:

- lead settings: [`src/lib/leads/settings.js`](./src/lib/leads/settings.js)
- lead API: [`src/app/api/leads/route.js`](./src/app/api/leads/route.js)
- lead mailer: [`src/lib/leads/email.js`](./src/lib/leads/email.js)
- CRM API: [`src/app/api/crm/leads`](./src/app/api/crm/leads)

Lead notifications support:

- configurable recipient
- configurable sender
- configurable subject prefix
- configurable Resend template ID

### Analytics and performance

The app already mounts:

- `@vercel/analytics`
- `@vercel/speed-insights`

GA4 reporting is partially integrated:

- client measurement is supported
- Data API reporting works when Google credentials are present
- the admin is now instrumentation-first instead of fake KPI-first

Key files:

- root layout: [`src/app/layout.jsx`](./src/app/layout.jsx)
- GA helpers: [`src/lib/analytics/google.js`](./src/lib/analytics/google.js)

### Domains and deployment operations

Vercel domain operations are wired through:

- [`src/lib/platform/vercel.js`](./src/lib/platform/vercel.js)
- [`src/app/api/domains`](./src/app/api/domains)

Without Vercel credentials, the admin shows placeholder guidance.
With live credentials, the admin is intended to verify and manage domain connections.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm dev
```

Run the local Studio:

```bash
pnpm studio:dev
```

Build:

```bash
pnpm build
```

Start production build locally:

```bash
pnpm start
```

Useful scripts:

- `pnpm seed:pages`
- `pnpm seed:guides`
- `pnpm db:setup`
- `pnpm sanity:repair-sections`
- `pnpm generate:favicons`
- `pnpm generate:service-images`

## Environment Variables

Copy [`.env.example`](./.env.example) to `.env.local`.

Important groups:

### Auth

- `AUTH_SECRET`
- `AUTH_ADMIN_NAME`
- `AUTH_ADMIN_EMAIL`
- `AUTH_ADMIN_PASSWORD`

### Sanity

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `NEXT_PUBLIC_SANITY_STUDIO_URL`
- `SANITY_API_READ_TOKEN`
- `SANITY_API_WRITE_TOKEN`
- `SANITY_STUDIO_AGENT_SCHEMA_ID`
- `SANITY_VIEWER_TOKEN`

### Resend / leads

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_LEAD_TO_EMAIL`
- `RESEND_SUBJECT_PREFIX`
- `RESEND_TEMPLATE_ID`

### Analytics / search

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `GOOGLE_ANALYTICS_PROPERTY_ID`
- `GOOGLE_SITE_VERIFICATION`

### Vercel

- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID`
- `VERCEL_TEAM_SLUG`

### Database

- Neon/Postgres connection values used by:
  - CRM / lead submissions
  - persisted domain inventory metadata
  - `pnpm db:setup`, which now creates both `lead_submissions` and `domain_records`

## Sanity Workflow

### Canonical editor surface

The canonical editor is the Sanity-hosted Studio. The app’s `/studio` route redirects there.

Local Studio is for development/testing only:

- `pnpm studio:dev` starts local Studio on `http://localhost:3334`
- the app dev server uses `http://localhost:3000`

### Reading content

The app reads content through [`src/lib/platform/content.js`](./src/lib/platform/content.js).

Current read order is effectively:

1. Sanity documents when present
2. fixture/catalog fallbacks when Sanity content is missing

### Seeding content

Seeders currently exist for:

- public pages: [`scripts/seed-public-pages.mjs`](./scripts/seed-public-pages.mjs)
- guides: [`scripts/seed-guides.mjs`](./scripts/seed-guides.mjs)

These are useful when bootstrapping content into Sanity from the current source files.

### Visual editing / Presentation

Presentation and Visual Editing are wired, but depend on:

- correct Studio configuration
- draft mode
- the route-to-document mapping in [`src/sanity/presentation.js`](./src/sanity/presentation.js)
- valid Sanity documents for the page being previewed

## Publishing Workflow Today

The current publishing flow is split between admin and Sanity.

### What `/publish` does today

The admin publish tool:

- stores jobs in the in-memory store at [`src/lib/platform/store.js`](./src/lib/platform/store.js)
- does not run a real AI provider
- does not persist jobs in a database
- creates placeholder draft output if none exists
- can publish a minimal document into Sanity through [`publishPageToSanity`](./src/lib/platform/content.js)

The publish handoff currently creates:

- a very basic document
- one hero section
- slug derived from the title

That means `/publish` is currently better described as:

- a draft-queue prototype
- a workflow contract
- not a production editorial system

### Sanity Agent drafting workflow

The project now has the underlying Sanity Agent drafting pieces prepared:

- shared draft helpers: [`src/sanity/agent/draftHelpers.js`](./src/sanity/agent/draftHelpers.js)
- publishing instructions: [`src/sanity/agent/publishingInstructions.js`](./src/sanity/agent/publishingInstructions.js)
- setup guide: [`docs/sanity-agent-publishing-workflow.md`](./docs/sanity-agent-publishing-workflow.md)

The custom Studio tool itself is not currently enabled in `sanity.config.js` because the local Studio boot path was unstable with that registration. The correct product direction is still Sanity-first drafting, but the tool should be reintroduced only after the Studio-side integration is stabilized.

### What should be published in Sanity

For production content quality, Sanity should be the final source of truth for:

- hero copy
- service pages
- guides
- FAQs
- about/team/legal content
- launch checklist data
- lead routing settings

### Recommended editorial flow

Recommended current-state workflow:

1. Use admin for operational tooling:
   - leads
   - domains
   - hero images
   - analytics readiness
   - launch checklist
2. Use the Sanity Studio `AI Drafting` tool when you want an AI-assisted first draft
3. Use Sanity Studio for page content editing and final publishing
4. Treat `/publish` as experimental until it has:
   - durable job storage
   - real provider execution
   - human review UX tied to real documents
   - better section generation than a one-section placeholder page

## Admin AI Publishing Vs Sanity-Only

### Option 1: keep the admin AI publishing feature

Pros:

- gives the team one place for operations and draft generation
- can standardize briefs, prompts, review states, and handoff
- useful if you want a future queue for service pages, location pages, and guides
- can eventually connect AI generation, review, and publishing in one internal workflow

Cons:

- current implementation is still thin and placeholder-heavy
- jobs are in memory, not durable
- generated output is not rich enough yet to trust
- duplicates editorial concerns that Sanity already handles well
- introduces another interface your team has to understand and maintain

### Option 2: remove AI publishing and use Sanity only

Pros:

- simpler mental model
- one source of truth for content
- less maintenance
- fewer opportunities for content drift between admin and CMS
- easier to train editors on one system

Cons:

- loses the future workflow surface for prompt-driven draft generation
- operational team may miss having drafts/briefs in the admin
- if you later want AI-assisted queueing, you will have to rebuild that surface

### Recommendation

Right now, do not treat `/publish` as the main publishing path.

Best near-term path:

- keep the codebase support for `/publish`
- use the Sanity Agent drafting tool in Studio as the AI-assisted path
- relabel `/publish` internally as experimental or legacy draft-assist
- use Sanity Studio as the actual editorial system

If you want less complexity immediately, you could hide `/publish` from the admin nav until it is durable enough to matter. That is a better move than pretending it is production-ready.

## Dashboard Checklist And Launch Ops

The dashboard checklist source lives in [`src/lib/platform/launchChecklist.js`](./src/lib/platform/launchChecklist.js).

It now needs to cover both:

- production go-live readiness
- exposure/distribution after launch

Recommended launch sequence:

1. Finish domain, auth, content, lead routing, and analytics readiness
2. Launch the site
3. Submit to search engines and local business platforms
4. Start distributing the content through local channels, reviews, partnerships, and paid/organic campaigns
5. Measure conversion and tighten pages based on actual lead behavior

## Current Recommended Next Steps

1. Make Sanity the final source of truth for the remaining fixture-backed pages.
2. Keep `/publish` only as a draft-assist prototype unless you fund a real queue/provider workflow.
3. Finish Vercel domain + env configuration for production.
4. Verify GA4, Search Console, sitemap, robots, and OG output on the live domain.
5. Use the dashboard checklist as the operational launch board, then expand it with exposure tasks once the domain is live.
