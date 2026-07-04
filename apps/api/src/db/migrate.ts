import { access, readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'
import { envSchema } from '../config/env.js'

const currentDirectory = dirname(fileURLToPath(import.meta.url))

if (process.argv.includes('--help')) {
  console.log(`Usage: npm run db:migrate --workspace @ai-war-room/api

Applies SQL migrations from apps/api/src/db/migrations.
Requires DATABASE_URL to point at a running PostgreSQL database.
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

async function runMigrations() {
  const env = envSchema.parse(process.env)
  const migrationDirectory = await resolveMigrationDirectory()
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  })

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    const files = (await readdir(migrationDirectory))
      .filter((file) => file.endsWith('.sql'))
      .sort()

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

void runMigrations().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
