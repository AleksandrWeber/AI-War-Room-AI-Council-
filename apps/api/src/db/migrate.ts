import { access, readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'
import { envSchema } from '../config/env.js'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const wantsHelp = process.argv.includes('--help')
const wantsStatus =
  process.argv.includes('--status') || process.argv.includes('--dry-run')

if (wantsHelp) {
  console.log(`Usage: npm run db:migrate --workspace @ai-war-room/api [--status|--dry-run]

Applies SQL migrations from apps/api/src/db/migrations.
Requires DATABASE_URL to point at a running PostgreSQL database.

Options:
  --status, --dry-run   List applied vs pending migrations without applying.
  --help                Show this message.
`)
  process.exit(0)
}

async function resolveMigrationDirectory() {
  const candidates = [
    join(process.cwd(), 'src/db/migrations'),
    join(process.cwd(), 'apps/api/src/db/migrations'),
    join(currentDirectory, '../../src/db/migrations'),
  ]

  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Try the next common cwd layout.
    }
  }

  throw new Error('Could not find apps/api SQL migrations directory.')
}

async function listMigrationFiles(migrationDirectory: string) {
  return (await readdir(migrationDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort()
}

async function ensureSchemaMigrationsTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}

async function loadAppliedVersions(pool: Pool) {
  const result = await pool.query<{ version: string }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC',
  )

  return new Set(result.rows.map((row) => row.version))
}

async function reportMigrationStatus() {
  const env = envSchema.parse(process.env)
  const migrationDirectory = await resolveMigrationDirectory()
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  })

  try {
    await ensureSchemaMigrationsTable(pool)
    const files = await listMigrationFiles(migrationDirectory)
    const applied = await loadAppliedVersions(pool)
    const pending = files.filter((file) => !applied.has(file))

    console.log(`Migration directory: ${migrationDirectory}`)
    console.log(`Applied: ${applied.size}`)
    console.log(`Pending: ${pending.length}`)

    for (const file of files) {
      console.log(`${applied.has(file) ? '[applied]' : '[pending]'} ${file}`)
    }

    if (pending.length === 0) {
      console.log('No pending migrations.')
    } else {
      console.log(
        `Dry-run only. Re-run without --status/--dry-run to apply ${pending.length} migration(s).`,
      )
    }
  } finally {
    await pool.end()
  }
}

async function runMigrations() {
  const env = envSchema.parse(process.env)
  const migrationDirectory = await resolveMigrationDirectory()
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  })

  try {
    await ensureSchemaMigrationsTable(pool)
    const files = await listMigrationFiles(migrationDirectory)

    for (const file of files) {
      const alreadyApplied = await pool.query(
        'SELECT 1 FROM schema_migrations WHERE version = $1',
        [file],
      )

      if (alreadyApplied.rowCount) {
        console.log(`Skipping migration ${file}`)
        continue
      }

      const sql = await readFile(join(migrationDirectory, file), 'utf8')

      await pool.query('BEGIN')
      try {
        await pool.query(sql)
        await pool.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [file],
        )
        await pool.query('COMMIT')
        console.log(`Applied migration ${file}`)
      } catch (error) {
        await pool.query('ROLLBACK')
        throw error
      }
    }
  } finally {
    await pool.end()
  }
}

void (wantsStatus ? reportMigrationStatus() : runMigrations()).catch(
  (error) => {
    console.error(error)
    process.exitCode = 1
  },
)
