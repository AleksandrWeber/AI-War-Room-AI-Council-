import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RELIABILITY_TABLES = [
  'idempotency_keys',
  'model_health_events',
  'runs',
] as const

export type ReliabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReliabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReliabilityRolloutCheck[]
  guidance: string
}

export type ReliabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReliabilityTableCount: number
  modelHealthEventTableExists: boolean
  usesRedisBackedReservation: boolean
  redisConnectivity: boolean
  supportsDuplicateRequestProtection: boolean
}

export function evaluateReliabilityRollout(
  input: ReliabilityRolloutInput,
): ReliabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const reliabilityTableCoverageComplete =
    input.existingReliabilityTableCount === CRITICAL_RELIABILITY_TABLES.length

  const checks: ReliabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL reliability checks can reach the database.'
            : 'Production reliability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'reliability_signal_table_coverage',
      label: 'Reliability signal table coverage',
      status:
        reliabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Reliability signal table coverage is only enforced in production.'
          : reliabilityTableCoverageComplete
            ? `${input.existingReliabilityTableCount}/${CRITICAL_RELIABILITY_TABLES.length} reliability signal tables are present.`
            : `${input.existingReliabilityTableCount}/${CRITICAL_RELIABILITY_TABLES.length} reliability signal tables were found.`,
    },
    {
      name: 'model_health_reliability_signals',
      label: 'Model health reliability signals',
      status:
        input.modelHealthEventTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health reliability signals are only enforced in production.'
          : input.modelHealthEventTableExists
            ? 'model_health_events table is available for reliability fault signals.'
            : 'Production reliability rollout requires a model_health_events table.',
    },
    {
      name: 'idempotency_fault_tolerance',
      label: 'Idempotency fault tolerance',
      status:
        input.supportsDuplicateRequestProtection &&
        (!input.usesRedisBackedReservation ||
          input.redisConnectivity ||
          !isProduction)
          ? 'pass'
          : 'fail',
      detail:
        !input.supportsDuplicateRequestProtection
          ? 'Duplicate request protection is not configured.'
          : !input.usesRedisBackedReservation
            ? 'Idempotency fault tolerance is validated when Redis reservations are enabled.'
            : input.redisConnectivity
              ? 'Redis-backed idempotency reservations protect against duplicate run requests.'
              : 'Production reliability rollout requires reachable Redis idempotency reservations.',
    },
    {
      name: 'fault_tolerance_readiness_signal',
      label: 'Fault tolerance readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          reliabilityTableCoverageComplete &&
          input.modelHealthEventTableExists &&
          input.supportsDuplicateRequestProtection &&
          (!input.usesRedisBackedReservation || input.redisConnectivity))
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Fault tolerance readiness is only enforced in production.'
          : input.postgresConnectivity &&
              reliabilityTableCoverageComplete &&
              input.modelHealthEventTableExists &&
              input.supportsDuplicateRequestProtection &&
              (!input.usesRedisBackedReservation || input.redisConnectivity)
            ? 'Run outcomes, model health events, and idempotency protections support fault tolerance readiness.'
            : 'Production reliability rollout requires PostgreSQL connectivity, reliability tables, model health signals, and idempotency fault tolerance.',
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
        ? 'Production reliability rollout checks passed. Reliability coverage and fault tolerance readiness signals are healthy.'
        : 'Production reliability rollout is not ready. Resolve failed checks before relying on production reliability tooling.',
  }
}
