import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REPRODUCIBILITY_TABLES = [
  'idempotency_keys',
  'run_workflows',
  'agent_outputs',
] as const

export type ReproducibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReproducibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReproducibilityRolloutCheck[]
  guidance: string
}

export type ReproducibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReproducibilityTableCount: number
  idempotencyKeysTableExists: boolean
  runWorkflowsTableExists: boolean
  agentOutputsTableExists: boolean
}

export function evaluateReproducibilityRollout(
  input: ReproducibilityRolloutInput,
): ReproducibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const reproducibilityTableCoverageComplete =
    input.existingReproducibilityTableCount === CRITICAL_REPRODUCIBILITY_TABLES.length

  const checks: ReproducibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL reproducibility checks can reach the database.'
            : 'Production reproducibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'reproducibility_signal_table_coverage',
      label: 'Reproducibility signal table coverage',
      status: reproducibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Reproducibility signal table coverage is only enforced in production.'
          : reproducibilityTableCoverageComplete
            ? `${input.existingReproducibilityTableCount}/${CRITICAL_REPRODUCIBILITY_TABLES.length} reproducibility signal tables are present.`
            : `${input.existingReproducibilityTableCount}/${CRITICAL_REPRODUCIBILITY_TABLES.length} reproducibility signal tables were found.`,
    },
    {
      name: 'idempotency_reproducibility',
      label: 'Idempotency reproducibility',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency reproducibility is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency reproducibility signals.'
            : 'Production reproducibility rollout requires a idempotency_keys table.',
    },
    {
      name: 'workflow_reproducibility',
      label: 'Workflow reproducibility',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow reproducibility is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow reproducibility signals.'
            : 'Production reproducibility rollout requires a run_workflows table.',
    },
    {
      name: 'repeatability_readiness_signal',
      label: 'Repeatability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          reproducibilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.runWorkflowsTableExists &&
          input.agentOutputsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Repeatability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              reproducibilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.runWorkflowsTableExists &&
              input.agentOutputsTableExists
            ? 'Idempotency keys, run workflows, and agent outputs support repeatability readiness.'
            : 'Production reproducibility rollout requires PostgreSQL connectivity, reproducibility tables, idempotency reproducibility, workflow reproducibility, and full signal coverage.',
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
        ? 'Production reproducibility rollout checks passed. Reproducibility coverage and repeatability readiness signal signals are healthy.'
        : 'Production reproducibility rollout is not ready. Resolve failed checks before relying on production reproducibility tooling.',
  }
}
