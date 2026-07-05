import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONSISTENCY_TABLES = [
  'runs',
  'run_workflows',
  'idempotency_keys',
] as const

export type ConsistencyRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConsistencyRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConsistencyRolloutCheck[]
  guidance: string
}

export type ConsistencyRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConsistencyTableCount: number
  runWorkflowsTableExists: boolean
  usesRedisBackedReservation: boolean
  redisConnectivity: boolean
  supportsDuplicateRequestProtection: boolean
}

export function evaluateConsistencyRollout(
  input: ConsistencyRolloutInput,
): ConsistencyRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const consistencyTableCoverageComplete =
    input.existingConsistencyTableCount === CRITICAL_CONSISTENCY_TABLES.length

  const checks: ConsistencyRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL consistency checks can reach the database.'
            : 'Production consistency rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'consistency_signal_table_coverage',
      label: 'Consistency signal table coverage',
      status:
        consistencyTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Consistency signal table coverage is only enforced in production.'
          : consistencyTableCoverageComplete
            ? `${input.existingConsistencyTableCount}/${CRITICAL_CONSISTENCY_TABLES.length} consistency signal tables are present.`
            : `${input.existingConsistencyTableCount}/${CRITICAL_CONSISTENCY_TABLES.length} consistency signal tables were found.`,
    },
    {
      name: 'run_workflow_alignment',
      label: 'Run workflow alignment',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Run workflow alignment is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow alignment signals.'
            : 'Production consistency rollout requires a run_workflows table.',
    },
    {
      name: 'idempotency_consistency',
      label: 'Idempotency consistency',
      status:
        !isProduction ||
        (input.supportsDuplicateRequestProtection &&
          (!input.usesRedisBackedReservation || input.redisConnectivity))
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Idempotency consistency is only enforced in production.'
          : input.supportsDuplicateRequestProtection &&
              (!input.usesRedisBackedReservation || input.redisConnectivity)
            ? input.usesRedisBackedReservation
              ? 'Redis-backed idempotency reservation is reachable for duplicate request protection.'
              : 'In-memory idempotency reservation supports duplicate request protection.'
            : 'Production consistency rollout requires reachable idempotency reservation.',
    },
    {
      name: 'alignment_readiness_signal',
      label: 'Alignment readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          consistencyTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.supportsDuplicateRequestProtection &&
          (!input.usesRedisBackedReservation || input.redisConnectivity))
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Alignment readiness is only enforced in production.'
          : input.postgresConnectivity &&
              consistencyTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.supportsDuplicateRequestProtection &&
              (!input.usesRedisBackedReservation || input.redisConnectivity)
            ? 'Run outcomes, workflow alignment, and idempotency signals support alignment readiness.'
            : 'Production consistency rollout requires PostgreSQL connectivity, consistency tables, workflow alignment, and idempotency consistency.',
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
        ? 'Production consistency rollout checks passed. Consistency coverage and alignment readiness signals are healthy.'
        : 'Production consistency rollout is not ready. Resolve failed checks before relying on production consistency tooling.',
  }
}
