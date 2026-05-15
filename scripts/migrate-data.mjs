import pg from 'pg'

/*
 * One-shot data migration from the old Neon database to the new Supabase
 * Postgres. Idempotent (re-runnable): every INSERT uses
 * `ON CONFLICT (<pk>) DO UPDATE` so the source-of-truth in Neon overwrites
 * any drift on the target. Safe to keep around for a while in case the
 * Supabase side gets nuked.
 *
 * Source env vars (Neon, picked from `.env.development.local`):
 *   POSTGRES_URL_NON_POOLING   (preferred — direct, no pooler)
 *   POSTGRES_URL
 *
 * Target env vars (Supabase):
 *   STORAGEDB_POSTGRES_URL_NON_POOLING (preferred — session pool, supports DDL)
 *   STORAGEDB_POSTGRES_URL
 *
 * Tables are migrated in FK-safe order, but none of them have explicit
 * cross-table FKs today; this ordering is just for readability.
 */

const TABLES = [
  { name: 'platform_users', pk: 'id', jsonb: [] },
  { name: 'domain_records', pk: 'domain', jsonb: ['dns_instructions'] },
  { name: 'lead_routing_settings', pk: 'id', jsonb: [] },
  { name: 'lead_submissions', pk: 'id', jsonb: ['metadata'] },
  { name: 'christmas_slots', pk: 'id', jsonb: [] },
  { name: 'christmas_jobs', pk: 'id', jsonb: [] },
]

function sanitize(url) {
  if (!url) return url
  return url
    .replace(/([?&])sslmode=[^&]*/g, '$1')
    .replace(/([?&])supa=[^&]*/g, '$1')
    .replace(/([?&])pgbouncer=[^&]*/g, '$1')
    .replace(/\?&/, '?')
    .replace(/[?&]+$/, '')
}

function getNeonUrl() {
  return process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || ''
}

function getSupabaseUrl() {
  return (
    process.env.STORAGEDB_POSTGRES_URL_NON_POOLING ||
    process.env.STORAGEDB_POSTGRES_URL ||
    process.env.DATABASE_URL ||
    ''
  )
}

async function connect(label, url) {
  if (!url) throw new Error(`${label} connection string is not set.`)
  const pool = new pg.Pool({
    connectionString: sanitize(url),
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 10_000,
  })
  const ping = await pool.query('SELECT current_database() db')
  console.log(`  ${label}: connected to ${ping.rows[0].db}`)
  return pool
}

async function getColumns(pool, tableName) {
  const result = await pool.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position`,
    [tableName],
  )
  return result.rows.map((row) => row.column_name)
}

async function migrateTable(source, target, { name, pk, jsonb }) {
  const sourceColumns = await getColumns(source, name)
  const targetColumns = await getColumns(target, name)
  if (sourceColumns.length === 0) {
    console.log(`  ${name}: source table missing in Neon, skipping`)
    return { name, copied: 0, skipped: true }
  }
  if (targetColumns.length === 0) {
    throw new Error(`${name}: target table missing in Supabase`)
  }

  const sharedColumns = sourceColumns.filter((column) => targetColumns.includes(column))
  if (!sharedColumns.includes(pk)) {
    throw new Error(`${name}: primary key '${pk}' is missing from source/target`)
  }

  const selectSql = `SELECT ${sharedColumns.map((column) => `"${column}"`).join(', ')} FROM "${name}"`
  const { rows } = await source.query(selectSql)
  if (rows.length === 0) {
    console.log(`  ${name}: source empty`)
    return { name, copied: 0 }
  }

  let copied = 0
  for (const row of rows) {
    const placeholders = sharedColumns.map((column, index) => {
      const placeholder = `$${index + 1}`
      return jsonb.includes(column) ? `${placeholder}::jsonb` : placeholder
    })
    const updateAssignments = sharedColumns
      .filter((column) => column !== pk)
      .map((column) => `"${column}" = EXCLUDED."${column}"`)
      .join(', ')

    const insertSql = `
      INSERT INTO "${name}" (${sharedColumns.map((column) => `"${column}"`).join(', ')})
      VALUES (${placeholders.join(', ')})
      ON CONFLICT ("${pk}") DO UPDATE SET ${updateAssignments || `"${pk}" = EXCLUDED."${pk}"`}
    `

    const values = sharedColumns.map((column) => {
      const value = row[column]
      if (value && typeof value === 'object' && !(value instanceof Date) && jsonb.includes(column)) {
        return JSON.stringify(value)
      }
      return value
    })

    await target.query(insertSql, values)
    copied += 1
  }

  console.log(`  ${name}: copied ${copied} row${copied === 1 ? '' : 's'}`)
  return { name, copied }
}

async function main() {
  console.log('Connecting…')
  const neon = await connect('Neon  ', getNeonUrl())
  const supabase = await connect('Supabase', getSupabaseUrl())

  console.log('\nMigrating tables…')
  const results = []
  for (const table of TABLES) {
    results.push(await migrateTable(neon, supabase, table))
  }

  console.log('\nFinal row counts on Supabase:')
  for (const table of TABLES) {
    const { rows } = await supabase.query(`SELECT COUNT(*)::int AS n FROM "${table.name}"`)
    console.log(`  ${table.name}: ${rows[0].n}`)
  }

  await Promise.all([neon.end(), supabase.end()])
  console.log('\nDone.')
  console.log(JSON.stringify({ ok: true, results }, null, 2))
}

main().catch((error) => {
  console.error('\nMigration failed:', error.message || error)
  if (error.code) console.error('  code:', error.code)
  if (error.detail) console.error('  detail:', error.detail)
  process.exit(1)
})
