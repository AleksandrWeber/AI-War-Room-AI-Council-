import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RECOVERABILITY_TABLES = [
  'runs',
  'run_workflows',
  'idempotency_keys',
] as const

export type RecoverabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RecoverabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RecoverabilityRolloutCheck[]
  guidance: string
}

export type RecoverabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRecoverabilityTableCount: number
  runWorkflowsTableExists: boolean
  redisBackedRecoverySignals: boolean
  redisConnectivity: boolean
  supportsDuplicateRequestProtection: boolean
}

export function evaluateRecoverabilityRollout(
  input: RecoverabilityRolloutInput,
): RecoverabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const recoverabilityTableCoverageComplete =
    input.existingRecoverabilityTableCount ===
    CRITICAL_RECOVERABILITY_TABLES.length

  const checks: RecoverabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL recoverability checks can reach the database.'
            : 'Production recoverability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'recoverability_signal_table_coverage',
      label: 'Recoverability signal table coverage',
      status:
        recoverabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Recoverability signal table coverage is only enforced in production.'
          : recoverabilityTableCoverageComplete
            ? `${input.existingRecoverabilityTableCount}/${CRITICAL_RECOVERABILITY_TABLES.length} recoverability signal tables are present.`
            : `${input.existingRecoverabilityTableCount}/${CRITICAL_RECOVERABILITY_TABLES.length} recoverability signal tables were found.`,
    },
    {
      name: 'run_workflow_recovery',
      label: 'Run workflow recovery',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Run workflow recovery is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow recovery signals.'
            : 'Production recoverability rollout requires a run_workflows table.',
    },
    {
      name: 'stream_recovery_signals',
      label: 'Stream recovery signals',
      status:
        !input.redisBackedRecoverySignals ||
        input.redisConnectivity ||
        !isProduction
          ? 'pass'
          : 'fail',
      detail:
        !input.redisBackedRecoverySignals
          ? 'Stream recovery signals are validated when Redis-backed buffers are enabled.'
          : input.redisConnectivity
            ? 'Redis-backed stream buffers are reachable for recovery signals.'
            : 'Production recoverability rollout requires reachable Redis stream recovery buffers.',
    },
    {
      name: 'recovery_readiness_signal',
      label: 'Recovery readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          recoverabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.supportsDuplicateRequestProtection &&
          (!input.redisBackedRecoverySignals || input.redisConnectivity))
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Recovery readiness is only enforced in production.'
          : input.postgresConnectivity &&
              recoverabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.supportsDuplicateRequestProtection &&
              (!input.redisBackedRecoverySignals || input.redisConnectivity)
            ? 'Run workflows, idempotency recovery, and stream buffers support recovery readiness.'
            : 'Production recoverability rollout requires PostgreSQL connectivity, recoverability tables, workflow recovery, idempotency protection, and stream recovery signals.',
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
        ? 'Production recoverability rollout checks passed. Recoverability coverage and recovery readiness signals are healthy.'
        : 'Production recoverability rollout is not ready. Resolve failed checks before relying on production recoverability tooling.',
  }
}
