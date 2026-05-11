# Dead Code Audit Report

**Scan date**: 2026-05-10  
**Codebase**: `/Users/dallas/Development/austin-leads-platform`  
**Scope**: ESLint (`typescript-eslint` + `js/recommended`) on `src/**/*.{js,jsx,ts,tsx,mjs}` — excludes `.agents/`, `.codex/`, `.next/`, `scripts/` per ESLint config  

**Total ESLint dead-code signals (initial)**: 2  
**Remediated in this pass**: 2  

---

## Summary by category

| Category | Initial | Notes |
|----------|---------|--------|
| CSS (`src/styles/*.css` class tokens → substring match in `src/**` + root HTML) | 47 likely-unused class tokens (of 115 extracted) | See **CSS class usage** below; method has caveats |
| Slim | — | N/A for this repo |
| React / Next (unused imports / vars) | 2 | Resolved below |

---

## CSS class usage (automated)

**How**: `scripts/css-class-usage-audit.mjs` scans `src/styles/*.css`, extracts `.class-name` tokens from selectors (comments stripped; `@keyframes` bodies skipped), then checks whether each token appears **anywhere as a substring** in:

- `src/**/*.{jsx,tsx,js,ts,mjs,html,md}`
- `index.html`, `dashboard.html`, `publish.html` at repo root  

**Re-run**:

```bash
node scripts/css-class-usage-audit.mjs
```

**Caveats (read before deleting CSS)**:

1. **Portable Text / CMS HTML** — Classes authored only inside Sanity (or other CMS) strings will not appear in `src/` and look “unused.”
2. **Dynamic class names** — `cn(\`bg-primary-${tone}\`)`, template maps, etc., may omit the full token from static text (false unused).
3. **Substring collisions** — Rare: a token might match inside an unrelated string (low risk for tokens like `bg-primary-500`).
4. **Tailwind/source churn** — `@import 'tailwindcss'` pulls in utilities not enumerated here; this audit only covers **explicit `.class` rules** in your checked-in CSS files.

**Orphan stylesheet**: `src/styles/supreme.css` defines `@font-face` for **Supreme** but is **not** `@import`’d from `globals.css` or elsewhere — likely dead unless loaded dynamically (worth confirming before delete).

### Likely-unused classes (47)

All definitions traced to **`src/styles/globals.css`** — mostly legacy palette utilities (`bg-primary-*`), hover/outline/shadow helpers, `google-sans*` modifiers, `btn--full`, and `solar-*` layout helpers.

| Class token |
|-------------|
| `accent-color-primary`, `bg-blue-400`, `bg-button-secondary`, `bg-orange-soft` |
| `bg-primary-100` … `bg-primary-900` (full ladder), `bg-secondary-300`, `bg-secondary-700`, `bg-secondary-800` |
| `bg-surface`, `bg-tertiary`, `bg-tertiary-100`, `bg-tertiary-300`, `bg-tertiary-700`, `bg-tertiary-alt` |
| `border-color-button-secondary`, `border-color-secondary` |
| `btn--full` |
| `google-sans`, `google-sans-normal`, `google-sans-medium`, `google-sans-bold` |
| `hover-bg-button-secondary`, `hover-shadow-color-primary`, `hover-shadow-theme-brand`, `hover-text-primary` |
| `outline-color-focus`, `shadow-color-primary`, `shadow-color-sm`, `shadow-color-xl`, `shadow-theme-brand` |
| `solar-grid-bg`, `solar-range`, `solar-shell`, `solar-shell-narrow` |
| `text-primary-300`, `text-primary-700`, `text-slate-400`, `text-slate-800`, `text-slate-950` |

**Suggested cleanup**: Remove or consolidate blocks in `globals.css` `@layer components` only after spot-checking grep/CMS usage for tokens you care about.

---

## React & Next.js

### Automated findings (ESLint)

| File | Issue | Action |
|------|--------|--------|
| `src/components/StripeCheckout.tsx` | Unused import `useRef` from `react` (`@typescript-eslint/no-unused-vars`) | Removed `useRef` from import list |
| `src/components/ui/tooltip.jsx` | Unused import `import * as React from "react"` (`no-unused-vars`) | Removed unused `React` import (automatic JSX runtime) |

### Verification

```bash
pnpm exec eslint "src/**/*.{js,jsx,ts,tsx,mjs}"
```

Exit **0** after the fixes above.

---

## Not performed (recommended follow-up)

These match the spirit of the dead-code skill but need explicit tooling or human review:

1. **Unused exports / unreachable modules** — Add something like [`knip`](https://github.com/webpro/knip) or [`ts-prune`](https://github.com/nadeesha/ts-prune) and run against `tsconfig.json` (watch for Next.js entry points and dynamic imports — many false positives otherwise).
2. **Unused npm dependencies** — Same tooling (`knip`) can flag unused `dependencies` / `devDependencies`.
3. **Deeper CSS** — Extend the audit script to ignore tokens present only in theme `@theme` blocks vs `@layer components`, or scan built `.next/static/css` if you need Tailwind-generated utilities.
4. **Orphaned routes** — Manual review of `src/app/**` against product requirements; automated “unused route” detection is unreliable with middleware/proxy and multi-tenant routing.

---

## Skill workflow status (Linear / branch / sub-agents)

Per `.claude/skills/dead-code/SKILL.md`, the full pipeline also includes:

- Creating a **Linear** issue and labeled branch  
- Item-by-item **approval** in chat  
- Cleanup **sub-agents** and deleting this report after merge  

**Not executed in this pass** — no Linear issue or git branch was created. If you want that flow, say so with your Linear team/project preference and we can wire the next audit through `plugin-linear-linear` and a dedicated branch.

---

## Next steps (pick any)

1. Keep this file as a record; open a Linear ticket manually using the table above if you track debt there.  
2. Add `pnpm run lint` (wrapping the ESLint command) to CI so unused imports regress visibly.  
3. Run **knip** (or similar) for a second-phase export/unused-file report — review output before deleting anything.  
4. Triage the **47 CSS tokens** above (grep + CMS check), then delete unused `@layer components` blocks in batches and run `pnpm build`.
