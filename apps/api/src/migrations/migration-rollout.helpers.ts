import type { ApiEnv } from '../config/env.js'

export type MigrationRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MigrationRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MigrationRolloutCheck[]
  guidance: string
}

export type MigrationRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  schemaMigrationsTableExists: boolean
  postgresConnectivity: boolean
  availableMigrationCount: number
  pendingMigrationCount: number
}

export function evaluateMigrationRollout(
  input: MigrationRolloutInput,
): MigrationRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'

  const checks: MigrationRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL migration status checks can reach the database.'
            : 'Production migration rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'schema_migrations_table',
      label: 'Schema migrations table',
      status: input.schemaMigrationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Schema migrations table is only enforced in production.'
          : input.schemaMigrationsTableExists
            ? 'schema_migrations table exists for tracking applied migrations.'
            : 'Production migration rollout requires a schema_migrations table.',
    },
    {
      name: 'migration_file_inventory',
      label: 'Migration file inventory',
      status: input.availableMigrationCount > 0 ? 'pass' : 'fail',
      detail:
        input.availableMigrationCount > 0
          ? `${input.availableMigrationCount} SQL migration file(s) are available on disk.`
          : 'No SQL migration files were found in the migrations directory.',
    },
    {
      name: 'pending_migrations',
      label: 'Pending migrations',
      status:
        input.pendingMigrationCount === 0 || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pending migration enforcement is only required in production.'
          : input.pendingMigrationCount === 0
            ? 'All available SQL migrations are applied.'
            : `${input.pendingMigrationCount} migration(s) are still pending.`,
    },
    {
      name: 'production_migration_coverage',
      label: 'Production migration coverage',
      status:
        !isProduction ||
        (input.availableMigrationCount > 0 && input.pendingMigrationCount === 0)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Production migration coverage is only enforced in production.'
          : input.pendingMigrationCount === 0
            ? 'Production database migration coverage is complete.'
            : 'Production migration rollout requires all SQL migrations to be applied.',
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    checks,
    guidance:
      status === 'ready'
        ? 'Database migration rollout checks passed. Schema migrations are ready for production.'
        : 'Database migration rollout is not ready. Resolve failed checks before relying on production migration tooling.',
  }
}
