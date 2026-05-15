import { getSql } from '../db/pool.js'

// ─── Schema setup ────────────────────────────────────────────────────────────

export async function ensureChristmasTables() {
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS christmas_slots (
      id           TEXT PRIMARY KEY,
      install_date DATE NOT NULL UNIQUE,
      season_year  INT  NOT NULL DEFAULT 2025,
      capacity     INT  NOT NULL DEFAULT 6,
      is_active    BOOLEAN NOT NULL DEFAULT TRUE,
      notes        TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Guard: add columns that may be missing if table was created before this schema version
  await sql`ALTER TABLE christmas_slots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  await sql`ALTER TABLE christmas_slots ADD COLUMN IF NOT EXISTS season_year INT NOT NULL DEFAULT 2026`
  // Migrate any rows that were saved with the old default of 2025
  await sql`UPDATE christmas_slots SET season_year = 2026 WHERE season_year = 2025`

  await sql`
    CREATE TABLE IF NOT EXISTS christmas_jobs (
      id                      TEXT PRIMARY KEY,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- Customer
      full_name               TEXT NOT NULL,
      email                   TEXT NOT NULL,
      phone                   TEXT,
      address                 TEXT NOT NULL,

      -- Booking
      install_date            DATE NOT NULL,
      package_slug            TEXT NOT NULL DEFAULT 'unknown',

      -- Stripe
      stripe_session_id       TEXT UNIQUE,
      stripe_payment_intent_id TEXT,

      -- Payment tracking
      deposit_amount_cents    INT  NOT NULL DEFAULT 15000,
      deposit_status          TEXT NOT NULL DEFAULT 'pending',
      balance_amount_cents    INT,
      balance_status          TEXT NOT NULL DEFAULT 'unpaid',

      -- Job status & crew
      status                  TEXT NOT NULL DEFAULT 'booked',
      crew                    TEXT,
      notes                   TEXT,
      site_slug               TEXT NOT NULL DEFAULT 'txchristmaslights'
    )
  `

  // Guard: add columns that may be missing from older schema
  await sql`ALTER TABLE christmas_jobs ADD COLUMN IF NOT EXISTS phone TEXT`
  await sql`ALTER TABLE christmas_jobs ADD COLUMN IF NOT EXISTS crew  TEXT`
}

// ─── Slots ───────────────────────────────────────────────────────────────────

export async function deleteSlot(installDate) {
  const sql = getSql()
  await sql`DELETE FROM christmas_slots WHERE install_date = ${installDate}::DATE`
}

export async function upsertSlot({
  installDate,
  capacity,
  isActive = true,
  notes = null,
  seasonYear = 2026,
}) {
  const sql = getSql()
  const id = installDate // use date as natural key

  const [row] = await sql`
    INSERT INTO christmas_slots (id, install_date, capacity, is_active, notes, season_year)
    VALUES (${id}, ${installDate}, ${capacity}, ${isActive}, ${notes}, ${seasonYear})
    ON CONFLICT (install_date) DO UPDATE SET
      capacity   = EXCLUDED.capacity,
      is_active  = EXCLUDED.is_active,
      notes      = EXCLUDED.notes
    RETURNING *
  `
  return normalizeDateRow(row)
}

function normalizeDateRow(row) {
  if (!row) return row
  return {
    ...row,
    install_date:
      row.install_date instanceof Date
        ? row.install_date.toISOString().split('T')[0]
        : String(row.install_date ?? '').split('T')[0],
  }
}

export async function listSlots(seasonYear = 2026) {
  const sql = getSql()
  const rows = await sql`
    SELECT
      s.*,
      COUNT(j.id) FILTER (WHERE j.status != 'cancelled')::INT AS booked_count
    FROM christmas_slots s
    LEFT JOIN christmas_jobs j ON j.install_date = s.install_date
    WHERE s.season_year = ${seasonYear}
    GROUP BY s.id
    ORDER BY s.install_date ASC
  `
  return rows.map(normalizeDateRow)
}

export async function updateSlot(installDate, updates) {
  const sql = getSql()
  const { capacity, isActive, notes } = updates

  const [row] = await sql`
    UPDATE christmas_slots
    SET
      capacity   = COALESCE(${capacity ?? null}, capacity),
      is_active  = COALESCE(${isActive ?? null}, is_active),
      notes      = COALESCE(${notes ?? null}, notes),
      updated_at = NOW()
    WHERE install_date = ${installDate}
    RETURNING *
  `
  return normalizeDateRow(row)
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export async function createJob({
  fullName,
  email,
  address,
  installDate,
  packageSlug = 'unknown',
  stripeSessionId,
  stripePaymentIntentId,
  depositAmountCents = 15000,
  siteSlug = 'txchristmaslights',
}) {
  const sql = getSql()
  const id = crypto.randomUUID()

  const [row] = await sql`
    INSERT INTO christmas_jobs (
      id, full_name, email, address, install_date, package_slug,
      stripe_session_id, stripe_payment_intent_id,
      deposit_amount_cents, deposit_status, site_slug
    ) VALUES (
      ${id}, ${fullName}, ${email}, ${address}, ${installDate}, ${packageSlug},
      ${stripeSessionId || null}, ${stripePaymentIntentId || null},
      ${depositAmountCents}, 'paid', ${siteSlug}
    )
    RETURNING *
  `
  return row
}

export async function listJobs({ status = 'all', installDate = null, limit = 100 } = {}) {
  const sql = getSql()

  const rows = await sql`
    SELECT *
    FROM christmas_jobs
    WHERE (${status} = 'all' OR status = ${status})
      AND (${installDate}::TEXT IS NULL OR install_date = ${installDate}::DATE)
    ORDER BY install_date ASC, created_at DESC
    LIMIT ${Math.min(limit, 500)}
  `
  return rows
}

export async function getJobById(id) {
  const sql = getSql()
  const [row] = await sql`SELECT * FROM christmas_jobs WHERE id = ${id} LIMIT 1`
  return row || null
}

export async function getJobByStripeSessionId(sessionId) {
  const sql = getSql()
  const [row] = await sql`
    SELECT * FROM christmas_jobs WHERE stripe_session_id = ${sessionId} LIMIT 1
  `
  return row || null
}

export async function updateJob(id, updates) {
  const sql = getSql()
  const {
    fullName,
    email,
    phone,
    address,
    installDate,
    packageSlug,
    status,
    crew,
    notes,
    depositStatus,
    balanceAmountCents,
    balanceStatus,
    stripePaymentIntentId,
  } = updates

  const [row] = await sql`
    UPDATE christmas_jobs
    SET
      full_name                 = COALESCE(${fullName ?? null}, full_name),
      email                     = COALESCE(${email ?? null}, email),
      phone                     = COALESCE(${phone ?? null}, phone),
      address                   = COALESCE(${address ?? null}, address),
      install_date              = COALESCE(${installDate ?? null}::DATE, install_date),
      package_slug              = COALESCE(${packageSlug ?? null}, package_slug),
      status                    = COALESCE(${status ?? null}, status),
      crew                      = COALESCE(${crew ?? null}, crew),
      notes                     = COALESCE(${notes ?? null}, notes),
      deposit_status            = COALESCE(${depositStatus ?? null}, deposit_status),
      balance_amount_cents      = COALESCE(${balanceAmountCents ?? null}, balance_amount_cents),
      balance_status            = COALESCE(${balanceStatus ?? null}, balance_status),
      stripe_payment_intent_id  = COALESCE(${stripePaymentIntentId ?? null}, stripe_payment_intent_id),
      updated_at                = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return row || null
}

export async function deleteJob(id) {
  const sql = getSql()
  await sql`DELETE FROM christmas_jobs WHERE id = ${id}`
}

export async function getJobsOverview() {
  const sql = getSql()
  const [counts] = await sql`
    SELECT
      COUNT(*)::INT                                                        AS total,
      COUNT(*) FILTER (WHERE status = 'booked')::INT                      AS booked,
      COUNT(*) FILTER (WHERE status = 'confirmed')::INT                   AS confirmed,
      COUNT(*) FILTER (WHERE status = 'installed')::INT                   AS installed,
      COUNT(*) FILTER (WHERE status = 'completed')::INT                   AS completed,
      COUNT(*) FILTER (WHERE status = 'cancelled')::INT                   AS cancelled,
      COALESCE(SUM(deposit_amount_cents) FILTER (WHERE deposit_status = 'paid'), 0)::INT AS deposits_collected_cents,
      COUNT(*) FILTER (WHERE balance_status = 'unpaid' AND status != 'cancelled')::INT  AS balances_outstanding
    FROM christmas_jobs
    WHERE site_slug = 'txchristmaslights'
  `
  return (
    counts || {
      total: 0,
      booked: 0,
      confirmed: 0,
      installed: 0,
      completed: 0,
      cancelled: 0,
      deposits_collected_cents: 0,
      balances_outstanding: 0,
    }
  )
}
