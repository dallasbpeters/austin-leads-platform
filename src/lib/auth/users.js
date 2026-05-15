import bcrypt from 'bcryptjs'

import { getSql } from '../db/pool.js'

/*
 * Platform admin users — persisted in Postgres (Supabase / Neon-compatible).
 *
 * The legacy env-var admin (AUTH_ADMIN_EMAIL / AUTH_ADMIN_PASSWORD) is still
 * supported by `src/auth.js` as a break-glass bootstrap account; DB-backed
 * users live alongside it and are the ones managed from the /users admin UI.
 */

const BCRYPT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 8
const VALID_ROLES = new Set(['admin'])

export function normalizeEmail(value) {
  return value?.toString().trim().toLowerCase() ?? ''
}

export function isValidEmail(value) {
  const email = normalizeEmail(value)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return null
}

function normalizeRole(role) {
  const value = String(role ?? 'admin').toLowerCase()
  return VALID_ROLES.has(value) ? value : 'admin'
}

function toPublicUser(row) {
  if (!row) return null
  // Never leak password_hash.
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? null,
    role: row.role,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  }
}

/*
 * Postgres `CREATE TABLE IF NOT EXISTS` is NOT race-safe: when two concurrent
 * connections hit it on a missing table they can both try to insert into
 * `pg_type`, and one loses with `duplicate key value violates unique
 * constraint "pg_type_typname_nsp_index"`. We:
 *   1) Memoize the work as a single in-flight promise per process, and
 *   2) Swallow that specific race error (the other connection won, table now
 *      exists, so we're good).
 */
let ensurePromise = null

async function runEnsure() {
  const sql = getSql()
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS platform_users (
        id            TEXT PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name          TEXT,
        role          TEXT NOT NULL DEFAULT 'admin',
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS platform_users_email_lower_idx ON platform_users (LOWER(email))`
  } catch (err) {
    const message = String(err?.message ?? '')
    const isPgTypeRace =
      err?.code === '23505' && (message.includes('pg_type_typname_nsp_index') || message.includes('pg_class'))
    if (!isPgTypeRace) throw err
  }
}

export function ensurePlatformUsersTable() {
  if (!ensurePromise) {
    ensurePromise = runEnsure().catch((err) => {
      // Reset on failure so a future call gets a real chance to retry.
      ensurePromise = null
      throw err
    })
  }
  return ensurePromise
}

export async function listUsers() {
  const sql = getSql()
  const rows = await sql`
    SELECT id, email, name, role, is_active, created_at, updated_at
    FROM platform_users
    ORDER BY created_at ASC
  `
  return rows.map(toPublicUser)
}

export async function getUserById(id) {
  if (!id) return null
  const sql = getSql()
  const [row] = await sql`
    SELECT id, email, name, role, is_active, created_at, updated_at
    FROM platform_users
    WHERE id = ${id}
    LIMIT 1
  `
  return toPublicUser(row)
}

async function getUserRowByEmail(email) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null
  const sql = getSql()
  const [row] = await sql`
    SELECT id, email, password_hash, name, role, is_active, created_at, updated_at
    FROM platform_users
    WHERE LOWER(email) = ${normalized}
    LIMIT 1
  `
  return row ?? null
}

export async function countActiveAdmins() {
  const sql = getSql()
  const [{ count }] = await sql`
    SELECT COUNT(*)::INT AS count
    FROM platform_users
    WHERE role = 'admin' AND is_active = TRUE
  `
  return count
}

export async function createUser({ email, password, name = null, role = 'admin', isActive = true }) {
  if (!isValidEmail(email)) throw new Error('A valid email is required.')
  const pwError = validatePassword(password)
  if (pwError) throw new Error(pwError)

  const normalizedEmail = normalizeEmail(email)
  const existing = await getUserRowByEmail(normalizedEmail)
  if (existing) throw new Error('A user with that email already exists.')

  const sql = getSql()
  const id = crypto.randomUUID()
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  const [row] = await sql`
    INSERT INTO platform_users (id, email, password_hash, name, role, is_active)
    VALUES (${id}, ${normalizedEmail}, ${hash}, ${name || null}, ${normalizeRole(role)}, ${Boolean(isActive)})
    RETURNING id, email, name, role, is_active, created_at, updated_at
  `
  return toPublicUser(row)
}

export async function updateUserFields(id, updates) {
  const existing = await getUserById(id)
  if (!existing) throw new Error('User not found.')

  let nextEmail = existing.email
  if (updates.email !== undefined && updates.email !== null) {
    if (!isValidEmail(updates.email)) throw new Error('A valid email is required.')
    const normalized = normalizeEmail(updates.email)
    if (normalized !== existing.email) {
      const collision = await getUserRowByEmail(normalized)
      if (collision && collision.id !== id) {
        throw new Error('A user with that email already exists.')
      }
      nextEmail = normalized
    }
  }

  const nextName = updates.name === undefined ? existing.name : updates.name || null
  const nextRole = updates.role === undefined ? existing.role : normalizeRole(updates.role)
  const nextActive = updates.isActive === undefined ? existing.isActive : Boolean(updates.isActive)

  if (existing.role === 'admin' && existing.isActive && (!nextActive || nextRole !== 'admin')) {
    const activeAdmins = await countActiveAdmins()
    if (activeAdmins <= 1) {
      throw new Error('Cannot deactivate or demote the last active admin.')
    }
  }

  const sql = getSql()
  const [row] = await sql`
    UPDATE platform_users
    SET
      email      = ${nextEmail},
      name       = ${nextName},
      role       = ${nextRole},
      is_active  = ${nextActive},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, email, name, role, is_active, created_at, updated_at
  `
  return toPublicUser(row)
}

export async function setUserPassword(id, password) {
  const pwError = validatePassword(password)
  if (pwError) throw new Error(pwError)
  const existing = await getUserById(id)
  if (!existing) throw new Error('User not found.')

  const sql = getSql()
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  await sql`
    UPDATE platform_users
    SET password_hash = ${hash}, updated_at = NOW()
    WHERE id = ${id}
  `
  return true
}

export async function deleteUser(id) {
  const existing = await getUserById(id)
  if (!existing) throw new Error('User not found.')

  if (existing.role === 'admin' && existing.isActive) {
    const activeAdmins = await countActiveAdmins()
    if (activeAdmins <= 1) {
      throw new Error('Cannot delete the last active admin.')
    }
  }

  const sql = getSql()
  await sql`DELETE FROM platform_users WHERE id = ${id}`
  return true
}

/*
 * Used by NextAuth Credentials.authorize. Returns a public user object for
 * an active account whose password matches; otherwise null. Never throws so
 * the auth flow stays simple.
 */
export async function verifyCredentials(email, password) {
  try {
    await ensurePlatformUsersTable()
    const row = await getUserRowByEmail(email)
    if (!row || !row.is_active) return null
    const ok = await bcrypt.compare(String(password ?? ''), row.password_hash)
    if (!ok) return null
    return toPublicUser(row)
  } catch (err) {
    console.error('[auth/users] verifyCredentials error:', err)
    return null
  }
}

/**
 * OAuth (Google) sign-in: only emails with an active `platform_users` row may access the dashboard.
 */
export async function getActivePlatformUserForGoogle(email) {
  try {
    await ensurePlatformUsersTable()
    const row = await getUserRowByEmail(email)
    if (!row?.is_active) return null
    return toPublicUser(row)
  } catch (err) {
    console.error('[auth/users] getActivePlatformUserForGoogle error:', err)
    return null
  }
}
