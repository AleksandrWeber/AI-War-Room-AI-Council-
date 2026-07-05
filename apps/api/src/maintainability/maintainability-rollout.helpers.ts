import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MAINTAINABILITY_TABLES = [
  'schema_migrations',
  'model_health_events',
  'usage_events',
] as const

export type MaintainabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MaintainabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MaintainabilityRolloutCheck[]
  guidance: string
}

export type MaintainabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMaintainabilityTableCount: number
  pendingMigrationCount: number
  modelHealthEventTableExists: boolean
  apiHealthStatusOk: boolean
}

export function evaluateMaintainabilityRollout(
  input: MaintainabilityRolloutInput,
): MaintainabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const maintainabilityTableCoverageComplete =
    input.existingMaintainabilityTableCount ===
    CRITICAL_MAINTAINABILITY_TABLES.length

  const checks: MaintainabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL maintainability checks can reach the database.'
            : 'Production maintainability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'maintainability_signal_table_coverage',
      label: 'Maintainability signal table coverage',
      status:
        maintainabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Maintainability signal table coverage is only enforced in production.'
          : maintainabilityTableCoverageComplete
            ? `${input.existingMaintainabilityTableCount}/${CRITICAL_MAINTAINABILITY_TABLES.length} maintainability signal tables are present.`
            : `${input.existingMaintainabilityTableCount}/${CRITICAL_MAINTAINABILITY_TABLES.length} maintainability signal tables were found.`,
    },
    {
      name: 'migration_operability',
      label: 'Migration operability',
      status:
        input.pendingMigrationCount === 0 || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pending migration enforcement is only required in production.'
          : input.pendingMigrationCount === 0
            ? 'All SQL migrations are applied before maintainability rollout.'
            : `${input.pendingMigrationCount} migration(s) must be applied before maintainability rollout.`,
    },
    {
      name: 'model_health_maintainability',
      label: 'Model health maintainability',
      status: input.modelHealthEventTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health maintainability is only enforced in production.'
          : input.modelHealthEventTableExists
            ? 'model_health_events table is available for provider maintainability signals.'
            : 'Production maintainability rollout requires a model_health_events table.',
    },
    {
      name: 'operability_readiness_signal',
      label: 'Operability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          maintainabilityTableCoverageComplete &&
          input.pendingMigrationCount === 0 &&
          input.modelHealthEventTableExists &&
          input.apiHealthStatusOk)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Operability readiness is only enforced in production.'
          : input.postgresConnectivity &&
              maintainabilityTableCoverageComplete &&
              input.pendingMigrationCount === 0 &&
              input.modelHealthEventTableExists &&
              input.apiHealthStatusOk
            ? 'Applied migrations, model health events, usage telemetry, and API health support operability readiness.'
            : 'Production maintainability rollout requires PostgreSQL connectivity, maintainability tables, applied migrations, model health coverage, and healthy API endpoints.',
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
        ? 'Production maintainability rollout checks passed. Maintainability coverage and operability readiness signals are healthy.'
        : 'Production maintainability rollout is not ready. Resolve failed checks before relying on production maintainability tooling.',
  }
}
