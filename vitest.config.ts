import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
    passWithNoTests: true,
    server: {
      deps: {
        // Imports styled-components' default export, which only Vite's interop (not plain Node) resolves.
        inline: ['sanity-plugin-color-input'],
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
})
