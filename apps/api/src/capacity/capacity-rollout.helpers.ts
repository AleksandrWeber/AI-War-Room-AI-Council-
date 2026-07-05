import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CAPACITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'runs',
] as const

export type CapacityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CapacityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CapacityRolloutCheck[]
  guidance: string
}

export type CapacityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCapacityTableCount: number
  redisBackedCapacitySignals: boolean
  redisConnectivity: boolean
  usageLimitsTableExists: boolean
  streamBufferMaxLength: number
}

export function evaluateCapacityRollout(
  input: CapacityRolloutInput,
): CapacityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const capacityTableCoverageComplete =
    input.existingCapacityTableCount === CRITICAL_CAPACITY_TABLES.length
  const streamBufferReady = input.streamBufferMaxLength >= 100

  const checks: CapacityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL capacity checks can reach the database.'
            : 'Production capacity rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'capacity_signal_table_coverage',
      label: 'Capacity signal table coverage',
      status: capacityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Capacity signal table coverage is only enforced in production.'
          : capacityTableCoverageComplete
            ? `${input.existingCapacityTableCount}/${CRITICAL_CAPACITY_TABLES.length} capacity signal tables are present.`
            : `${input.existingCapacityTableCount}/${CRITICAL_CAPACITY_TABLES.length} capacity signal tables were found.`,
    },
    {
      name: 'redis_capacity_signals',
      label: 'Redis capacity signals',
      status:
        !input.redisBackedCapacitySignals ||
        input.redisConnectivity ||
        !isProduction
          ? 'pass'
          : 'fail',
      detail:
        !input.redisBackedCapacitySignals
          ? 'Redis capacity signals are validated when Redis-backed buffers are enabled.'
          : input.redisConnectivity
            ? 'Redis-backed stream and reservation buffers are reachable for capacity signals.'
            : 'Production capacity rollout requires reachable Redis connectivity.',
    },
    {
      name: 'usage_limits_capacity_enforcement',
      label: 'Usage limits capacity enforcement',
      status:
        input.usageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage limits capacity enforcement is only enforced in production.'
          : input.usageLimitsTableExists
            ? 'workspace_usage_limits table is available for capacity enforcement signals.'
            : 'Production capacity rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'scaling_readiness_signal',
      label: 'Scaling readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          capacityTableCoverageComplete &&
          streamBufferReady &&
          input.usageLimitsTableExists &&
          (!input.redisBackedCapacitySignals || input.redisConnectivity))
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Scaling readiness is only enforced in production.'
          : input.postgresConnectivity &&
              capacityTableCoverageComplete &&
              streamBufferReady &&
              input.usageLimitsTableExists &&
              (!input.redisBackedCapacitySignals || input.redisConnectivity)
            ? 'Usage limits, run load signals, stream buffers, and Redis capacity buffers support scaling readiness.'
            : 'Production capacity rollout requires PostgreSQL connectivity, capacity tables, usage limits, stream buffers, and Redis capacity signals.',
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
        ? 'Production capacity rollout checks passed. Capacity coverage and scaling readiness signals are healthy.'
        : 'Production capacity rollout is not ready. Resolve failed checks before relying on production capacity tooling.',
  }
}
