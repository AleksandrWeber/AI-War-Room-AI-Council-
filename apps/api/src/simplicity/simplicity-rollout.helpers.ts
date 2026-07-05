import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SIMPLICITY_TABLES = [
  'run_workflows',
  'idempotency_keys',
  'usage_events',
] as const

export type SimplicityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SimplicityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SimplicityRolloutCheck[]
  guidance: string
}

export type SimplicityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSimplicityTableCount: number
  runWorkflowsTableExists: boolean
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateSimplicityRollout(
  input: SimplicityRolloutInput,
): SimplicityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const simplicityTableCoverageComplete =
    input.existingSimplicityTableCount === CRITICAL_SIMPLICITY_TABLES.length

  const checks: SimplicityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL simplicity checks can reach the database.'
            : 'Production simplicity rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'simplicity_signal_table_coverage',
      label: 'Simplicity signal table coverage',
      status: simplicityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Simplicity signal table coverage is only enforced in production.'
          : simplicityTableCoverageComplete
            ? `${input.existingSimplicityTableCount}/${CRITICAL_SIMPLICITY_TABLES.length} simplicity signal tables are present.`
            : `${input.existingSimplicityTableCount}/${CRITICAL_SIMPLICITY_TABLES.length} simplicity signal tables were found.`,
    },
    {
      name: 'workflow_simplicity',
      label: 'Workflow simplicity',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow simplicity is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow simplicity signals.'
            : 'Production simplicity rollout requires a run_workflows table.',
    },
    {
      name: 'idempotency_key_simplicity',
      label: 'Idempotency key simplicity',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key simplicity is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key simplicity signals.'
            : 'Production simplicity rollout requires a idempotency_keys table.',
    },
    {
      name: 'simplicity_readiness_signal',
      label: 'Simplicity readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          simplicityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Simplicity readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              simplicityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists
            ? 'Run workflows, idempotency keys, and usage events support simplicity readiness.'
            : 'Production simplicity rollout requires PostgreSQL connectivity, simplicity tables, workflow simplicity, idempotency key simplicity, and full signal coverage.',
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
        ? 'Production simplicity rollout checks passed. Simplicity coverage and simplicity readiness signal signals are healthy.'
        : 'Production simplicity rollout is not ready. Resolve failed checks before relying on production simplicity tooling.',
  }
}
