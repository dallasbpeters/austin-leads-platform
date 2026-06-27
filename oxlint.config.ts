import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import react from 'ultracite/oxlint/react'
import next from 'ultracite/oxlint/next'
import vitest from 'ultracite/oxlint/vitest'

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: core.ignorePatterns,
  rules: {
    // Opinionated style rule with no autofixer. It forces alphabetical object
    // keys, which fights the conventional Sanity schema ordering
    // (name → title → type → …) used throughout this codebase.
    'sort-keys': 'off',
  },
})
