import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MEMORABILITY_TABLES = [
  'artifacts',
  'run_workflows',
  'idempotency_keys',
] as const

export type MemorabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MemorabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MemorabilityRolloutCheck[]
  guidance: string
}

export type MemorabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMemorabilityTableCount: number
  artifactsTableExists: boolean
  runWorkflowsTableExists: boolean
  idempotencyKeysTableExists: boolean
}

export function evaluateMemorabilityRollout(
  input: MemorabilityRolloutInput,
): MemorabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const memorabilityTableCoverageComplete =
    input.existingMemorabilityTableCount === CRITICAL_MEMORABILITY_TABLES.length

  const checks: MemorabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL memorability checks can reach the database.'
            : 'Production memorability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'memorability_signal_table_coverage',
      label: 'Memorability signal table coverage',
      status: memorabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Memorability signal table coverage is only enforced in production.'
          : memorabilityTableCoverageComplete
            ? `${input.existingMemorabilityTableCount}/${CRITICAL_MEMORABILITY_TABLES.length} memorability signal tables are present.`
            : `${input.existingMemorabilityTableCount}/${CRITICAL_MEMORABILITY_TABLES.length} memorability signal tables were found.`,
    },
    {
      name: 'artifact_memorability',
      label: 'Artifact memorability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact memorability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact memorability signals.'
            : 'Production memorability rollout requires a artifacts table.',
    },
    {
      name: 'workflow_memorability',
      label: 'Workflow memorability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow memorability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow memorability signals.'
            : 'Production memorability rollout requires a run_workflows table.',
    },
    {
      name: 'memory_readiness_signal',
      label: 'Memory readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          memorabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.runWorkflowsTableExists &&
          input.idempotencyKeysTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Memory readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              memorabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.runWorkflowsTableExists &&
              input.idempotencyKeysTableExists
            ? 'Artifacts, run workflows, and idempotency keys support memory readiness.'
            : 'Production memorability rollout requires PostgreSQL connectivity, memorability tables, artifact memorability, workflow memorability, and full signal coverage.',
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
        ? 'Production memorability rollout checks passed. Memorability coverage and memory readiness signal signals are healthy.'
        : 'Production memorability rollout is not ready. Resolve failed checks before relying on production memorability tooling.',
  }
}
