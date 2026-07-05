import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONTROLLABILITY_TABLES = [
  'idempotency_keys',
  'workspace_usage_limits',
  'usage_events',
] as const

export type ControllabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ControllabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ControllabilityRolloutCheck[]
  guidance: string
}

export type ControllabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingControllabilityTableCount: number
  idempotencyKeysTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateControllabilityRollout(
  input: ControllabilityRolloutInput,
): ControllabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const controllabilityTableCoverageComplete =
    input.existingControllabilityTableCount === CRITICAL_CONTROLLABILITY_TABLES.length

  const checks: ControllabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL controllability checks can reach the database.'
            : 'Production controllability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'controllability_signal_table_coverage',
      label: 'Controllability signal table coverage',
      status: controllabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Controllability signal table coverage is only enforced in production.'
          : controllabilityTableCoverageComplete
            ? `${input.existingControllabilityTableCount}/${CRITICAL_CONTROLLABILITY_TABLES.length} controllability signal tables are present.`
            : `${input.existingControllabilityTableCount}/${CRITICAL_CONTROLLABILITY_TABLES.length} controllability signal tables were found.`,
    },
    {
      name: 'idempotency_key_controllability',
      label: 'Idempotency key controllability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key controllability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key controllability signals.'
            : 'Production controllability rollout requires a idempotency_keys table.',
    },
    {
      name: 'workspace_limit_controllability',
      label: 'Workspace limit controllability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit controllability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit controllability signals.'
            : 'Production controllability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'control_readiness_signal',
      label: 'Control readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          controllabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Control readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              controllabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists
            ? 'Idempotency keys, workspace usage limits, and usage events support control readiness.'
            : 'Production controllability rollout requires PostgreSQL connectivity, controllability tables, idempotency key controllability, workspace limit controllability, and full signal coverage.',
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
        ? 'Production controllability rollout checks passed. Controllability coverage and control readiness signal signals are healthy.'
        : 'Production controllability rollout is not ready. Resolve failed checks before relying on production controllability tooling.',
  }
}
