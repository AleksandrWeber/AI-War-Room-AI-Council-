import { access, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDirectory = dirname(fileURLToPath(import.meta.url))

export async function resolveMigrationDirectory() {
  const candidates = [
    join(process.cwd(), 'src/db/migrations'),
    join(process.cwd(), 'apps/api/src/db/migrations'),
    join(currentDirectory, '../db/migrations'),
  ]

  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Try the next common cwd layout.
    }
  }

  return null
}

export async function listAvailableMigrationFiles() {
  const migrationDirectory = await resolveMigrationDirectory()

  if (!migrationDirectory) {
    return []
  }

  return (await readdir(migrationDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort()
}
