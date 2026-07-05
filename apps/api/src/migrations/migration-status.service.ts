import { Injectable } from '@nestjs/common'
import type { MigrationInventory } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { listAvailableMigrationFiles } from './migration-directory.helpers.js'

@Injectable()
export class MigrationStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async getMigrationInventory(): Promise<MigrationInventory> {
    const availableVersions = await listAvailableMigrationFiles()
    const schemaMigrationsTableExists = await this.hasSchemaMigrationsTable()
    const appliedVersions = schemaMigrationsTableExists
      ? await this.listAppliedMigrations()
      : []
    const appliedVersionNames = new Set(
      appliedVersions.map((entry) => entry.version),
    )
    const pendingVersions = availableVersions.filter(
      (version) => !appliedVersionNames.has(version),
    )

    return {
      availableVersions,
      appliedVersions,
      pendingVersions,
      schemaMigrationsTableExists,
    }
  }

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  private async hasSchemaMigrationsTable() {
    try {
      const result = await this.postgresService.query<{ exists: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = 'schema_migrations'
          ) AS exists
        `,
      )

      return result.rows[0]?.exists === true
    } catch {
      return false
    }
  }

  private async listAppliedMigrations() {
    try {
      const result = await this.postgresService.query<{
        version: string
        applied_at: Date
      }>(
        `
          SELECT version, applied_at
          FROM schema_migrations
          ORDER BY version ASC
        `,
      )

      return result.rows.map((row) => ({
        version: row.version,
        appliedAt: row.applied_at.toISOString(),
      }))
    } catch {
      return []
    }
  }
}
