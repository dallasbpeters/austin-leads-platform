import { spawn } from 'node:child_process'

import { stopDevServers } from './stop-dev.mjs'

stopDevServers()

await new Promise((resolve) => setTimeout(resolve, 800))

const commands = [
  { name: 'next', args: ['run', 'dev:next'] },
  { name: 'studio', args: ['run', 'studio:dev'] },
]

const children = commands.map(({ name, args }) => {
  const child = spawn('pnpm', args, {
    stdio: 'inherit',
    env: process.env,
  })

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
