import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RELEASE_TABLES = [
  'runs',
  'artifacts',
  'run_workflows',
] as const

export const API_VERSION = '0.0.0'

export type ReleaseRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReleaseRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReleaseRolloutCheck[]
  guidance: string
}

export type ReleaseRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReleaseTableCount: number
  apiVersionMetadataAvailable: boolean
  pendingMigrationCount: number
}

export function evaluateReleaseRollout(
  input: ReleaseRolloutInput,
): ReleaseRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const releaseTableCoverageComplete =
    input.existingReleaseTableCount === CRITICAL_RELEASE_TABLES.length

  const checks: ReleaseRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL release checks can reach the database.'
            : 'Production release rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'release_table_coverage',
      label: 'Release table coverage',
      status: releaseTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Release table coverage is only enforced in production.'
          : releaseTableCoverageComplete
            ? `${input.existingReleaseTableCount}/${CRITICAL_RELEASE_TABLES.length} release artifact tables are present.`
            : `${input.existingReleaseTableCount}/${CRITICAL_RELEASE_TABLES.length} release artifact tables were found.`,
    },
    {
      name: 'api_version_metadata',
      label: 'API version metadata',
      status: input.apiVersionMetadataAvailable ? 'pass' : 'fail',
      detail: input.apiVersionMetadataAvailable
        ? `API version metadata is available through GET /api/version (${API_VERSION}).`
        : 'Production release rollout requires API version metadata.',
    },
    {
      name: 'migration_release_prerequisite',
      label: 'Migration release prerequisite',
      status:
        input.pendingMigrationCount === 0 || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Pending migration enforcement is only required in production.'
          : input.pendingMigrationCount === 0
            ? 'All SQL migrations are applied before production release rollout.'
            : `${input.pendingMigrationCount} migration(s) must be applied before production release rollout.`,
    },
    {
      name: 'rollout_readiness_signal',
      label: 'Rollout readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          releaseTableCoverageComplete &&
          input.apiVersionMetadataAvailable &&
          input.pendingMigrationCount === 0)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Rollout readiness is only enforced in production.'
          : input.postgresConnectivity &&
              releaseTableCoverageComplete &&
              input.apiVersionMetadataAvailable &&
              input.pendingMigrationCount === 0
            ? 'Release artifact tables, API version metadata, and migration prerequisites support rollout readiness.'
            : 'Production release rollout requires PostgreSQL connectivity, release tables, version metadata, and applied migrations.',
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
        ? 'Production release rollout checks passed. Release coverage and rollout readiness signals are healthy.'
        : 'Production release rollout is not ready. Resolve failed checks before relying on production release tooling.',
  }
}
