/*
 * Starts Next and Sanity Studio together.
 *
 *   pnpm dev                 -> Next on 3000, Studio on 3334
 *   pnpm dev --port 3733     -> Next on 3733 (Ship Studio passes this)
 *   PORT=4000 pnpm dev       -> same as --port 4000
 *   pnpm dev --studio-port N -> Studio on N
 *
 * The chosen ports flow into both processes: Next learns where the Studio is,
 * and the Studio learns where to point its live preview.
 */
import { spawn } from 'node:child_process'

import { stopDevServers } from './stop-dev.mjs'

function readFlag(name, fallback) {
  const index = process.argv.indexOf(`--${name}`)
  if (index !== -1 && process.argv[index + 1]) {
    return Number.parseInt(process.argv[index + 1], 10)
  }
  const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`))
  if (inline) {
    return Number.parseInt(inline.split('=')[1], 10)
  }
  return fallback
}

const nextPort = readFlag('port', Number.parseInt(process.env.PORT || '3000', 10))
const studioPort = readFlag('studio-port', Number.parseInt(process.env.SANITY_STUDIO_PORT || '3334', 10))

const env = {
  ...process.env,
  PORT: String(nextPort),
  NEXT_PUBLIC_LOCAL_SANITY_STUDIO_URL: `http://localhost:${studioPort}`,
  SANITY_STUDIO_PREVIEW_ORIGIN: `http://localhost:${nextPort}`,
}

stopDevServers([nextPort, studioPort])

await new Promise((resolve) => setTimeout(resolve, 800))

console.log(`Next on http://localhost:${nextPort}  ·  Studio on http://localhost:${studioPort}`)

const commands = [
  { name: 'next', args: ['run', 'dev:next', '--port', String(nextPort)] },
  { name: 'studio', args: ['run', 'studio:dev', '--port', String(studioPort)] },
]

const children = commands.map(({ name, args }) => {
  const child = spawn('pnpm', args, { stdio: 'inherit', env })

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`${name} exited with signal ${signal}`)
    } else if (code && code !== 0) {
      console.log(`${name} exited with code ${code}`)
    }
  })

  return child
})

let shuttingDown = false

function shutdown(signal = 'SIGTERM') {
  if (shuttingDown) {
    return
  }

  shuttingDown = true

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal)
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGKILL')
      }
    }
  }, 500)
}

process.on('SIGINT', () => {
  shutdown('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  shutdown('SIGTERM')
  process.exit(0)
})

for (const child of children) {
  child.on('exit', (code) => {
    if (!shuttingDown && code && code !== 0) {
      shutdown('SIGTERM')
      process.exit(code)
    }
  })
}

await new Promise(() => {})
