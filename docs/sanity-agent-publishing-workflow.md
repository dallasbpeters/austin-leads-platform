# Sanity Agent Publishing Workflow

This project treats Sanity Studio as the editorial source of truth.

The recommended workflow is:

The intended workflow is:

1. Re-enable a stable Sanity-side drafting tool or document action.
2. Choose the target site and content type.
3. Enter the title, slug, brief, and any source notes.
4. Create a real draft document first.
5. Let Sanity Agent update that draft in-place using the publishing instructions in [`src/sanity/agent/publishingInstructions.js`](../src/sanity/agent/publishingInstructions.js).
6. Editors review, refine, and publish in Studio.

## Why this workflow

- It keeps Sanity as the only real CMS surface.
- It avoids a second editor UI in `/publish`.
- It lets the agent work against an existing schema-valid draft instead of inventing fields from scratch.
- It fits better with Presentation and Visual Editing.

## Required environment variables

App:

- `SANITY_API_WRITE_TOKEN`
- `SANITY_AGENT_SCHEMA_ID`

Studio:

- `SANITY_STUDIO_PREVIEW_ORIGIN`
- `SANITY_AGENT_SCHEMA_ID`

## Current status

The shared drafting pieces are in the repo, but the custom Studio tool is currently disabled in `sanity.config.js` while the Studio-side integration is stabilized.

The available pieces are:

- schema-aware draft helpers
- Sanity Agent instructions
- deployed schema id
- app/server-side draft creation helper if needed

## Instruction design

The publishing instructions are intentionally opinionated:

- Texas homeowner audience
- direct, grounded tone
- no hype
- no generic SEO filler
- no use of the phrase `the useful conversation`

They also require a sectioned document structure:

- hero
- story
- highlights
- FAQ

## Current recommendation

Use Sanity Agent for draft generation and keep the admin app focused on operations:

- leads
- CRM
- domains
- launch checklist
- analytics readiness

Do not treat `/publish` as the primary publishing surface until it is rebuilt around the Sanity-first flow.
