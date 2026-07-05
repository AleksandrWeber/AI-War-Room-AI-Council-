import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TUNABILITY_TABLES = [
  'usage_events',
  'workspace_usage_limits',
  'idempotency_keys',
] as const

export type TunabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TunabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TunabilityRolloutCheck[]
  guidance: string
}

export type TunabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTunabilityTableCount: number
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
  idempotencyKeysTableExists: boolean
}

export function evaluateTunabilityRollout(
  input: TunabilityRolloutInput,
): TunabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const tunabilityTableCoverageComplete =
    input.existingTunabilityTableCount === CRITICAL_TUNABILITY_TABLES.length

  const checks: TunabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL tunability checks can reach the database.'
            : 'Production tunability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'tunability_signal_table_coverage',
      label: 'Tunability signal table coverage',
      status: tunabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Tunability signal table coverage is only enforced in production.'
          : tunabilityTableCoverageComplete
            ? `${input.existingTunabilityTableCount}/${CRITICAL_TUNABILITY_TABLES.length} tunability signal tables are present.`
            : `${input.existingTunabilityTableCount}/${CRITICAL_TUNABILITY_TABLES.length} tunability signal tables were found.`,
    },
    {
      name: 'usage_event_tunability',
      label: 'Usage event tunability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event tunability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event tunability signals.'
            : 'Production tunability rollout requires a usage_events table.',
    },
    {
      name: 'workspace_limit_tunability',
      label: 'Workspace limit tunability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit tunability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit tunability signals.'
            : 'Production tunability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'tuning_readiness_signal',
      label: 'Tuning readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          tunabilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists &&
          input.idempotencyKeysTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Tuning readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              tunabilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists &&
              input.idempotencyKeysTableExists
            ? 'Usage events, workspace usage limits, and idempotency keys support tuning readiness.'
            : 'Production tunability rollout requires PostgreSQL connectivity, tunability tables, usage event tunability, workspace limit tunability, and full signal coverage.',
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
        ? 'Production tunability rollout checks passed. Tunability coverage and tuning readiness signal signals are healthy.'
        : 'Production tunability rollout is not ready. Resolve failed checks before relying on production tunability tooling.',
  }
}
