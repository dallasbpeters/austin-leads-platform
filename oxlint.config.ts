import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import react from 'ultracite/oxlint/react'
import next from 'ultracite/oxlint/next'
import vitest from 'ultracite/oxlint/vitest'

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: core.ignorePatterns,
  rules: {
    // Opinionated *style* rules with no autofixer. oxfmt owns formatting, so these
    // can't be auto-resolved and only generate file-by-file noise that fights the
    // established conventions across this (pre-existing) codebase. Correctness rules
    // (eqeqeq, no-shadow, no-use-before-define, require-await, etc.) stay ON.

    // Forces alphabetical object keys — fights the conventional Sanity schema
    // ordering (name → title → type → …) used throughout this codebase.
    'sort-keys': 'off',
    // Function declaration vs. expression is a style preference; the codebase uses
    // `function` declarations throughout and there is no autofixer.
    'func-style': 'off',
    // Concise vs. block arrow bodies — pure style, no autofixer.
    'arrow-body-style': 'off',
    // Nested ternaries are used intentionally for compact JSX/value selection.
    'no-nested-ternary': 'off',
    'unicorn/no-nested-ternary': 'off',
    // Negated conditions are fine and often clearer here.
    'no-negated-condition': 'off',
    'unicorn/no-negated-condition': 'off',
    // Inline comments, unnamed capture groups, digit grouping, destructuring and
    // function scoping are all stylistic preferences with no autofixer.
    'no-inline-comments': 'off',
    'prefer-named-capture-group': 'off',
    'unicorn/numeric-separators-style': 'off',
    'prefer-destructuring': 'off',
    'unicorn/consistent-function-scoping': 'off',
    // Array iteration style; forEach/reduce are used intentionally.
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-array-reduce': 'off',
    // Bitwise operators are used intentionally in color/hash math (e.g. OG images).
    'no-bitwise': 'off',
    // High-noise, low-value pedantry with no autofixer that the codebase doesn't
    // follow. Not bug-catching for this app — kept off to stop file-by-file churn.
    'require-unicode-regexp': 'off', // `u` flag on ASCII regexes
    'require-await': 'off', // async route handlers without await
    'no-await-in-loop': 'off', // sequential awaits are intentional in scripts
    'no-alert': 'off', // confirm()/alert() used in admin tooling
    'no-empty-function': 'off',
    'no-useless-return': 'off',
    'promise/prefer-await-to-then': 'off',
    'unicorn/filename-case': 'off', // mixed file-naming conventions already in place
    'unicorn/prefer-array-find': 'off',
    // React: stable-reference default props and shadcn-style inline subcomponents
    // (e.g. ui/calendar) are accepted patterns here.
    'react/no-object-type-as-default-prop': 'off',
    'react/no-unstable-nested-components': 'off',
  },
})
