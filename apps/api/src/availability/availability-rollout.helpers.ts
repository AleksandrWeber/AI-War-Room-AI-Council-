import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AVAILABILITY_TABLES = [
  'workspaces',
  'runs',
  'usage_events',
] as const

export type AvailabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AvailabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AvailabilityRolloutCheck[]
  guidance: string
}

export type AvailabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAvailabilityTableCount: number
  apiHealthStatusOk: boolean
  dependencyUptimeReady: boolean
  healthyDependencyCount: number
  totalDependencyCount: number
}

export function evaluateAvailabilityRollout(
  input: AvailabilityRolloutInput,
): AvailabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const availabilityTableCoverageComplete =
    input.existingAvailabilityTableCount === CRITICAL_AVAILABILITY_TABLES.length

  const checks: AvailabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL availability checks can reach the database.'
            : 'Production availability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'availability_signal_table_coverage',
      label: 'Availability signal table coverage',
      status:
        availabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Availability signal table coverage is only enforced in production.'
          : availabilityTableCoverageComplete
            ? `${input.existingAvailabilityTableCount}/${CRITICAL_AVAILABILITY_TABLES.length} availability signal tables are present.`
            : `${input.existingAvailabilityTableCount}/${CRITICAL_AVAILABILITY_TABLES.length} availability signal tables were found.`,
    },
    {
      name: 'api_health_endpoint',
      label: 'API health endpoint',
      status: input.apiHealthStatusOk ? 'pass' : 'fail',
      detail: input.apiHealthStatusOk
        ? 'API health endpoint responds successfully.'
        : 'Production availability rollout requires a healthy API health endpoint.',
    },
    {
      name: 'dependency_uptime_signals',
      label: 'Dependency uptime signals',
      status:
        input.dependencyUptimeReady || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Dependency uptime is only enforced in production.'
          : input.dependencyUptimeReady
            ? `${input.healthyDependencyCount}/${input.totalDependencyCount} deployment dependencies are healthy.`
            : `${input.healthyDependencyCount}/${input.totalDependencyCount} deployment dependencies are healthy.`,
    },
    {
      name: 'uptime_readiness_signal',
      label: 'Uptime readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          availabilityTableCoverageComplete &&
          input.apiHealthStatusOk &&
          input.dependencyUptimeReady)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Uptime readiness is only enforced in production.'
          : input.postgresConnectivity &&
              availabilityTableCoverageComplete &&
              input.apiHealthStatusOk &&
              input.dependencyUptimeReady
            ? 'Workspace signals, API health, and dependency uptime support uptime readiness.'
            : 'Production availability rollout requires PostgreSQL connectivity, availability tables, API health, and healthy dependencies.',
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
        ? 'Production availability rollout checks passed. Availability coverage and uptime readiness signals are healthy.'
        : 'Production availability rollout is not ready. Resolve failed checks before relying on production availability tooling.',
  }
}
