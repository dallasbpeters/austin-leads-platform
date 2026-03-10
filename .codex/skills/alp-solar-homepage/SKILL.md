---
name: alp-solar-homepage
description: Use when editing the restored Austin Solar Pros homepage, its section components, copy, layout, or styling. This skill is for preserving and evolving the existing designed solar homepage without replacing it with the generic tenant renderer.
---

# Austin Solar Homepage

Use this skill for the designed public solar site.

## Source files

- [`src/App.jsx`](../../../src/App.jsx)
- [`src/components/Header.jsx`](../../../src/components/Header.jsx)
- [`src/components/Hero.jsx`](../../../src/components/Hero.jsx)
- [`src/components/StorySection.jsx`](../../../src/components/StorySection.jsx)
- [`src/components/CalculatorSection.jsx`](../../../src/components/CalculatorSection.jsx)
- [`src/components/CostsSection.jsx`](../../../src/components/CostsSection.jsx)
- [`src/components/GuidesSection.jsx`](../../../src/components/GuidesSection.jsx)
- [`src/components/SnapshotSection.jsx`](../../../src/components/SnapshotSection.jsx)
- [`src/components/IncentivesSection.jsx`](../../../src/components/IncentivesSection.jsx)
- [`src/components/ResourcesSection.jsx`](../../../src/components/ResourcesSection.jsx)
- [`src/components/ConsultationSection.jsx`](../../../src/components/ConsultationSection.jsx)
- [`src/components/Footer.jsx`](../../../src/components/Footer.jsx)

## Rules

- Preserve the current visual direction unless the user explicitly asks for redesign.
- Do not replace this page with the generic platform template.
- Keep copy credible; avoid invented claims, fake teams, and filler marketing language.
- When refactoring styles, do not reintroduce CSS modules.
- Prefer shared primitives and semantic classes over long utility strings.

## Validation

- Run `pnpm build`
- Confirm `/` still resolves to the designed solar homepage
- Re-check any interactive behavior touched:
  - mobile nav
  - calculator
  - story reveal
  - hero typography
