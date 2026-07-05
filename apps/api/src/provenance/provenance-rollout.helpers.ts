import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROVENANCE_TABLES = [
  'usage_events',
  'agent_outputs',
  'artifacts',
] as const

export type ProvenanceRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProvenanceRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProvenanceRolloutCheck[]
  guidance: string
}

export type ProvenanceRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProvenanceTableCount: number
  usageEventsTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateProvenanceRollout(
  input: ProvenanceRolloutInput,
): ProvenanceRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const provenanceTableCoverageComplete =
    input.existingProvenanceTableCount === CRITICAL_PROVENANCE_TABLES.length

  const checks: ProvenanceRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL provenance checks can reach the database.'
            : 'Production provenance rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'provenance_signal_table_coverage',
      label: 'Provenance signal table coverage',
      status: provenanceTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provenance signal table coverage is only enforced in production.'
          : provenanceTableCoverageComplete
            ? `${input.existingProvenanceTableCount}/${CRITICAL_PROVENANCE_TABLES.length} provenance signal tables are present.`
            : `${input.existingProvenanceTableCount}/${CRITICAL_PROVENANCE_TABLES.length} provenance signal tables were found.`,
    },
    {
      name: 'usage_provenance',
      label: 'Usage provenance',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage provenance is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage provenance signals.'
            : 'Production provenance rollout requires a usage_events table.',
    },
    {
      name: 'agent_output_provenance',
      label: 'Agent output provenance',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output provenance is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output provenance signals.'
            : 'Production provenance rollout requires a agent_outputs table.',
    },
    {
      name: 'lineage_readiness_signal',
      label: 'Lineage readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          provenanceTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Lineage readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              provenanceTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Usage events, agent outputs, and persisted artifacts support lineage readiness.'
            : 'Production provenance rollout requires PostgreSQL connectivity, provenance tables, usage provenance, agent output provenance, and full signal coverage.',
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
        ? 'Production provenance rollout checks passed. Provenance coverage and lineage readiness signal signals are healthy.'
        : 'Production provenance rollout is not ready. Resolve failed checks before relying on production provenance tooling.',
  }
}
