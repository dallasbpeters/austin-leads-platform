import { defineConfig } from 'shaders/config'

export default defineConfig({
  // Components are imported from 'shaders/react'
  framework: 'react',
  // Shaders project this codebase is connected to
  project: '557bb40d-a1f3-4db1-9a91-cbec231d1d82',
  // Where `npx shaders install` writes component files
  outDir: 'src/components/shaders',
})
