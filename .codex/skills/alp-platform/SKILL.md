---
name: alp-platform
description: Use when working on Austin Leads Platform multi-tenant routing, admin routes, Sanity integration, Vercel domain operations, SEO metadata, or host-based site resolution in this repo.
---

# Austin Leads Platform

Use this skill when working on the shared platform architecture.

## Focus areas

- host-based tenant resolution
- public route behavior outside the restored solar homepage
- admin routes and APIs
- Sanity-backed content loading and publishing
- domain verification and Vercel project integration
- sitemap, robots, JSON-LD, and metadata generation

## Key files

- [`src/app/(site)/[[...slug]]/page.jsx`](../../../src/app/(site)/[[...slug]]/page.jsx)
- [`src/components/platform/PublicSite.jsx`](../../../src/components/platform/PublicSite.jsx)
- [`src/lib/platform/content.js`](../../../src/lib/platform/content.js)
- [`src/lib/platform/fixtures.js`](../../../src/lib/platform/fixtures.js)
- [`src/lib/platform/store.js`](../../../src/lib/platform/store.js)
- [`src/lib/platform/vercel.js`](../../../src/lib/platform/vercel.js)
- [`src/app/(admin)`](../../../src/app/(admin))
- [`src/app/api`](../../../src/app/api)
- [`src/sanity`](../../../src/sanity)

## Rules

- Keep tenant-aware behavior deterministic.
- Do not break the special-case root route for `austin-solar-pros`.
- Prefer fixture fallback plus graceful degradation when Sanity or Vercel env vars are missing.
- Avoid introducing fake analytics or fake operational states when the system can instead show provider readiness.
- Keep Vercel and Sanity secrets server-side only.

## Validation

- Run `pnpm build`
- Check tenant resolution paths
- Check admin routes still require auth
- Check public metadata/sitemap/robots behavior when touched
