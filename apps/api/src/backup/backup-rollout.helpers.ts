import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BACKUP_TABLES = [
  'workspaces',
  'runs',
  'artifacts',
  'usage_events',
  'schema_migrations',
] as const

export type BackupRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BackupRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BackupRolloutCheck[]
  guidance: string
}

export type BackupRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  redisBackedPersistence: boolean
  redisConnectivity: boolean
  existingCriticalTableCount: number
  pendingMigrationCount: number
}

export function evaluateBackupRollout(
  input: BackupRolloutInput,
): BackupRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const criticalTableCoverageComplete =
    input.existingCriticalTableCount === CRITICAL_BACKUP_TABLES.length

  const checks: BackupRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL backup coverage checks can reach the database.'
            : 'Production backup rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'redis_persistence_readiness',
      label: 'Redis persistence readiness',
      status:
        !input.redisBackedPersistence ||
        input.redisConnectivity ||
        !isProduction
          ? 'pass'
          : 'fail',
      detail:
        !input.redisBackedPersistence
          ? 'Redis persistence checks are skipped when Redis reservations are not enabled.'
          : !isProduction
            ? 'Redis persistence is only enforced in production.'
            : input.redisConnectivity
              ? 'Redis AOF-backed persistence is reachable for ephemeral recovery data.'
              : 'Production backup rollout requires reachable Redis persistence.',
    },
    {
      name: 'critical_table_coverage',
      label: 'Critical table coverage',
      status: criticalTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Critical table coverage is only enforced in production.'
          : criticalTableCoverageComplete
            ? `${input.existingCriticalTableCount}/${CRITICAL_BACKUP_TABLES.length} critical backup tables are present.`
            : `${input.existingCriticalTableCount}/${CRITICAL_BACKUP_TABLES.length} critical backup tables were found.`,
    },
    {
      name: 'migration_backup_prerequisite',
      label: 'Migration backup prerequisite',
      status:
        input.pendingMigrationCount === 0 || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pending migration enforcement is only required in production.'
          : input.pendingMigrationCount === 0
            ? 'All SQL migrations are applied before backup restore readiness.'
            : `${input.pendingMigrationCount} migration(s) must be applied before backup restore readiness.`,
    },
    {
      name: 'restore_readiness_signal',
      label: 'Restore readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          criticalTableCoverageComplete &&
          input.pendingMigrationCount === 0)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Restore readiness is only enforced in production.'
          : input.postgresConnectivity &&
              criticalTableCoverageComplete &&
              input.pendingMigrationCount === 0
            ? 'PostgreSQL backup coverage and migration prerequisites support restore readiness.'
            : 'Production backup rollout requires PostgreSQL connectivity, critical tables, and applied migrations.',
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
        ? 'Production backup rollout checks passed. Backup coverage and restore readiness signals are healthy.'
        : 'Production backup rollout is not ready. Resolve failed checks before relying on backup restore tooling.',
  }
}
