import { execFileSync } from 'node:child_process'

const DEFAULT_PORTS = [3000, 3334]

function getPidsForPort(port) {
  try {
    const output = execFileSync('lsof', ['-ti', `tcp:${port}`], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    return output
      ? output
          .split('\n')
          .map((value) => Number.parseInt(value, 10))
          .filter((value) => Number.isInteger(value) && value !== process.pid)
      : []
  } catch {
    return []
  }
}

function killPid(pid, signal) {
  try {
    process.kill(pid, signal)
    return true
  } catch {
    return false
  }
}

export function stopDevServers(ports = DEFAULT_PORTS) {
  const pids = [...new Set(ports.flatMap(getPidsForPort))]

  if (!pids.length) {
    console.log(`No local Next/Sanity dev servers found on ports ${ports.join(', ')}.`)
    return
  }

  console.log(`Stopping local dev servers on ports ${ports.join(', ')}: ${pids.join(', ')}`)

  for (const pid of pids) {
    killPid(pid, 'SIGTERM')
  }

  setTimeout(() => {
    for (const pid of pids) {
      killPid(pid, 'SIGKILL')
    }
  }, 500)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  stopDevServers()
}
