import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCALABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'workspace_memberships',
] as const

export type ScalabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ScalabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ScalabilityRolloutCheck[]
  guidance: string
}

export type ScalabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingScalabilityTableCount: number
  usageLimitsTableExists: boolean
  workspaceMembershipsTableExists: boolean
  redisBackedScalabilitySignals: boolean
  redisConnectivity: boolean
}

export function evaluateScalabilityRollout(
  input: ScalabilityRolloutInput,
): ScalabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const scalabilityTableCoverageComplete =
    input.existingScalabilityTableCount === CRITICAL_SCALABILITY_TABLES.length

  const checks: ScalabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL scalability checks can reach the database.'
            : 'Production scalability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'scalability_signal_table_coverage',
      label: 'Scalability signal table coverage',
      status:
        scalabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Scalability signal table coverage is only enforced in production.'
          : scalabilityTableCoverageComplete
            ? `${input.existingScalabilityTableCount}/${CRITICAL_SCALABILITY_TABLES.length} scalability signal tables are present.`
            : `${input.existingScalabilityTableCount}/${CRITICAL_SCALABILITY_TABLES.length} scalability signal tables were found.`,
    },
    {
      name: 'usage_limit_scalability',
      label: 'Usage limit scalability',
      status: input.usageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage limit scalability is only enforced in production.'
          : input.usageLimitsTableExists
            ? 'workspace_usage_limits table is available for growth limit signals.'
            : 'Production scalability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'workspace_growth_signals',
      label: 'Workspace growth signals',
      status:
        input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace growth signals are only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for workspace growth signals.'
            : 'Production scalability rollout requires a workspace_memberships table.',
    },
    {
      name: 'growth_readiness_signal',
      label: 'Growth readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          scalabilityTableCoverageComplete &&
          input.usageLimitsTableExists &&
          input.workspaceMembershipsTableExists &&
          (!input.redisBackedScalabilitySignals || input.redisConnectivity))
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Growth readiness is only enforced in production.'
          : input.postgresConnectivity &&
              scalabilityTableCoverageComplete &&
              input.usageLimitsTableExists &&
              input.workspaceMembershipsTableExists &&
              (!input.redisBackedScalabilitySignals || input.redisConnectivity)
            ? 'Usage limits, membership growth, usage telemetry, and Redis buffers support growth readiness.'
            : 'Production scalability rollout requires PostgreSQL connectivity, scalability tables, usage limits, membership growth, and Redis scalability signals when enabled.',
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
        ? 'Production scalability rollout checks passed. Scalability coverage and growth readiness signals are healthy.'
        : 'Production scalability rollout is not ready. Resolve failed checks before relying on production scalability tooling.',
  }
}
