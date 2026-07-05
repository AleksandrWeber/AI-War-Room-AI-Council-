import type {
  MigrationAdminAction,
  MigrationAdminRecord,
  MigrationAdminStats,
  MigrationInventory,
} from '@ai-war-room/schemas'

export function buildMigrationAdminRecords(
  inventory: MigrationInventory,
): MigrationAdminRecord[] {
  const appliedByVersion = new Map(
    inventory.appliedVersions.map((entry) => [entry.version, entry.appliedAt]),
  )

  return inventory.availableVersions.map((version) => ({
    version,
    status: appliedByVersion.has(version) ? 'applied' : 'pending',
    appliedAt: appliedByVersion.get(version),
  }))
}

export function buildMigrationAdminStats(
  inventory: MigrationInventory,
): MigrationAdminStats {
  return {
    totalMigrations: inventory.availableVersions.length,
    appliedCount: inventory.appliedVersions.length,
    pendingCount: inventory.pendingVersions.length,
    schemaMigrationsTableExists: inventory.schemaMigrationsTableExists,
  }
}

export function getMigrationAdminGuidance(input: {
  stats: MigrationAdminStats
}) {
  if (!input.stats.schemaMigrationsTableExists) {
    return 'Workspace owners and admins can inspect migration metrics once the schema_migrations table exists.'
  }

  if (input.stats.pendingCount > 0) {
    return 'Workspace owners and admins can inspect pending database migrations and refresh the migration summary.'
  }

  return 'Workspace owners and admins can inspect applied database migrations and refresh the migration summary.'
}

export function resolveMigrationAdminActions(): MigrationAdminAction[] {
  return ['refresh_migration_summary']
}
