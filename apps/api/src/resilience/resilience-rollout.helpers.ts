import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RESILIENCE_TABLES = [
  'runs',
  'run_workflows',
  'schema_migrations',
] as const

export type ResilienceRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ResilienceRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ResilienceRolloutCheck[]
  guidance: string
}

export type ResilienceRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingResilienceTableCount: number
  redisBackedRecoverySignals: boolean
  redisConnectivity: boolean
  pendingMigrationCount: number
}

export function evaluateResilienceRollout(
  input: ResilienceRolloutInput,
): ResilienceRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const resilienceTableCoverageComplete =
    input.existingResilienceTableCount === CRITICAL_RESILIENCE_TABLES.length

  const checks: ResilienceRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL resilience checks can reach the database.'
            : 'Production resilience rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'resilience_signal_table_coverage',
      label: 'Resilience signal table coverage',
      status:
        resilienceTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Resilience signal table coverage is only enforced in production.'
          : resilienceTableCoverageComplete
            ? `${input.existingResilienceTableCount}/${CRITICAL_RESILIENCE_TABLES.length} resilience signal tables are present.`
            : `${input.existingResilienceTableCount}/${CRITICAL_RESILIENCE_TABLES.length} resilience signal tables were found.`,
    },
    {
      name: 'redis_recovery_signals',
      label: 'Redis recovery signals',
      status:
        !input.redisBackedRecoverySignals ||
        input.redisConnectivity ||
        !isProduction
          ? 'pass'
          : 'fail',
      detail:
        !input.redisBackedRecoverySignals
          ? 'Redis recovery signals are validated when Redis-backed buffers are enabled.'
          : input.redisConnectivity
            ? 'Redis-backed stream and reservation buffers are reachable for recovery signals.'
            : 'Production resilience rollout requires reachable Redis connectivity.',
    },
    {
      name: 'migration_recovery_prerequisite',
      label: 'Migration recovery prerequisite',
      status:
        input.pendingMigrationCount === 0 || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pending migration enforcement is only required in production.'
          : input.pendingMigrationCount === 0
            ? 'All SQL migrations are applied before recovery readiness.'
            : `${input.pendingMigrationCount} migration(s) must be applied before recovery readiness.`,
    },
    {
      name: 'recovery_readiness_signal',
      label: 'Recovery readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          resilienceTableCoverageComplete &&
          input.pendingMigrationCount === 0 &&
          (!input.redisBackedRecoverySignals || input.redisConnectivity))
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Recovery readiness is only enforced in production.'
          : input.postgresConnectivity &&
              resilienceTableCoverageComplete &&
              input.pendingMigrationCount === 0 &&
              (!input.redisBackedRecoverySignals || input.redisConnectivity)
            ? 'Run workflows, applied migrations, and Redis recovery buffers support recovery readiness.'
            : 'Production resilience rollout requires PostgreSQL connectivity, resilience tables, applied migrations, and Redis recovery signals.',
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
        ? 'Production resilience rollout checks passed. Resilience coverage and recovery readiness signals are healthy.'
        : 'Production resilience rollout is not ready. Resolve failed checks before relying on production resilience tooling.',
  }
}
