import type { ApiEnv } from '../config/env.js'

export const CRITICAL_STABILITY_TABLES = [
  'schema_migrations',
  'runs',
  'artifacts',
] as const

export type StabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type StabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: StabilityRolloutCheck[]
  guidance: string
}

export type StabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingStabilityTableCount: number
  pendingMigrationCount: number
  artifactsTableExists: boolean
}

export function evaluateStabilityRollout(
  input: StabilityRolloutInput,
): StabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const stabilityTableCoverageComplete =
    input.existingStabilityTableCount === CRITICAL_STABILITY_TABLES.length

  const checks: StabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL stability checks can reach the database.'
            : 'Production stability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'stability_signal_table_coverage',
      label: 'Stability signal table coverage',
      status:
        stabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Stability signal table coverage is only enforced in production.'
          : stabilityTableCoverageComplete
            ? `${input.existingStabilityTableCount}/${CRITICAL_STABILITY_TABLES.length} stability signal tables are present.`
            : `${input.existingStabilityTableCount}/${CRITICAL_STABILITY_TABLES.length} stability signal tables were found.`,
    },
    {
      name: 'schema_migration_stability',
      label: 'Schema migration stability',
      status:
        input.pendingMigrationCount === 0 || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pending migration enforcement is only required in production.'
          : input.pendingMigrationCount === 0
            ? 'All SQL migrations are applied before stability rollout.'
            : `${input.pendingMigrationCount} migration(s) must be applied before stability rollout.`,
    },
    {
      name: 'artifact_persistence_stability',
      label: 'Artifact persistence stability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact persistence stability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for persisted output stability signals.'
            : 'Production stability rollout requires an artifacts table.',
    },
    {
      name: 'drift_readiness_signal',
      label: 'Drift readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          stabilityTableCoverageComplete &&
          input.pendingMigrationCount === 0 &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Drift readiness is only enforced in production.'
          : input.postgresConnectivity &&
              stabilityTableCoverageComplete &&
              input.pendingMigrationCount === 0 &&
              input.artifactsTableExists
            ? 'Applied migrations, run outcomes, and persisted artifacts support drift readiness.'
            : 'Production stability rollout requires PostgreSQL connectivity, stability tables, applied migrations, and artifact persistence.',
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
        ? 'Production stability rollout checks passed. Stability coverage and drift readiness signals are healthy.'
        : 'Production stability rollout is not ready. Resolve failed checks before relying on production stability tooling.',
  }
}
