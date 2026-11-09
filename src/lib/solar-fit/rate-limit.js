/*
 * A small per-visitor limit for the Google-backed routes, so one script can't
 * run up the Maps bill. It lives in memory, so it is per server instance:
 * a speed bump, not a wall.
 */
const hits = new Map()

export function overLimit(request, { name, perMinute }) {
  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim()
  const bucket = `${name}:${ip}`
  const now = Date.now()
  const recent = (hits.get(bucket) || []).filter((time) => now - time < 60_000)
  recent.push(now)
  hits.set(bucket, recent)
  if (hits.size > 5000) {
    hits.clear()
  }
  return recent.length > perMinute
}
