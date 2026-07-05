import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RETRIEVABILITY_TABLES = [
  'shield_scans',
  'agent_outputs',
  'idempotency_keys',
] as const

export type RetrievabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RetrievabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RetrievabilityRolloutCheck[]
  guidance: string
}

export type RetrievabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRetrievabilityTableCount: number
  shieldScansTableExists: boolean
  agentOutputsTableExists: boolean
  idempotencyKeysTableExists: boolean
}

export function evaluateRetrievabilityRollout(
  input: RetrievabilityRolloutInput,
): RetrievabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const retrievabilityTableCoverageComplete =
    input.existingRetrievabilityTableCount === CRITICAL_RETRIEVABILITY_TABLES.length

  const checks: RetrievabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL retrievability checks can reach the database.'
            : 'Production retrievability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'retrievability_signal_table_coverage',
      label: 'Retrievability signal table coverage',
      status: retrievabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Retrievability signal table coverage is only enforced in production.'
          : retrievabilityTableCoverageComplete
            ? `${input.existingRetrievabilityTableCount}/${CRITICAL_RETRIEVABILITY_TABLES.length} retrievability signal tables are present.`
            : `${input.existingRetrievabilityTableCount}/${CRITICAL_RETRIEVABILITY_TABLES.length} retrievability signal tables were found.`,
    },
    {
      name: 'shield_scan_retrievability',
      label: 'Shield scan retrievability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan retrievability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan retrievability signals.'
            : 'Production retrievability rollout requires a shield_scans table.',
    },
    {
      name: 'agent_output_retrievability',
      label: 'Agent output retrievability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output retrievability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output retrievability signals.'
            : 'Production retrievability rollout requires a agent_outputs table.',
    },
    {
      name: 'retrieval_readiness_signal',
      label: 'Retrieval readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          retrievabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.agentOutputsTableExists &&
          input.idempotencyKeysTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Retrieval readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              retrievabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.agentOutputsTableExists &&
              input.idempotencyKeysTableExists
            ? 'Shield scans, agent outputs, and idempotency keys support retrieval readiness.'
            : 'Production retrievability rollout requires PostgreSQL connectivity, retrievability tables, shield scan retrievability, agent output retrievability, and full signal coverage.',
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
        ? 'Production retrievability rollout checks passed. Retrievability coverage and retrieval readiness signal signals are healthy.'
        : 'Production retrievability rollout is not ready. Resolve failed checks before relying on production retrievability tooling.',
  }
}
