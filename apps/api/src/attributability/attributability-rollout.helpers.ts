import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ATTRIBUTABILITY_TABLES = [
  'agent_outputs',
  'moderator_syntheses',
  'artifacts',
] as const

export type AttributabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AttributabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AttributabilityRolloutCheck[]
  guidance: string
}

export type AttributabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAttributabilityTableCount: number
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateAttributabilityRollout(
  input: AttributabilityRolloutInput,
): AttributabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const attributabilityTableCoverageComplete =
    input.existingAttributabilityTableCount === CRITICAL_ATTRIBUTABILITY_TABLES.length

  const checks: AttributabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL attributability checks can reach the database.'
            : 'Production attributability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'attributability_signal_table_coverage',
      label: 'Attributability signal table coverage',
      status: attributabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Attributability signal table coverage is only enforced in production.'
          : attributabilityTableCoverageComplete
            ? `${input.existingAttributabilityTableCount}/${CRITICAL_ATTRIBUTABILITY_TABLES.length} attributability signal tables are present.`
            : `${input.existingAttributabilityTableCount}/${CRITICAL_ATTRIBUTABILITY_TABLES.length} attributability signal tables were found.`,
    },
    {
      name: 'agent_output_attributability',
      label: 'Agent output attributability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output attributability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output attributability signals.'
            : 'Production attributability rollout requires a agent_outputs table.',
    },
    {
      name: 'synthesis_attributability',
      label: 'Synthesis attributability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis attributability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis attributability signals.'
            : 'Production attributability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'attribution_readiness_signal',
      label: 'Attribution readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          attributabilityTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Attribution readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              attributabilityTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists &&
              input.artifactsTableExists
            ? 'Agent outputs, moderator syntheses, and persisted artifacts support attribution readiness.'
            : 'Production attributability rollout requires PostgreSQL connectivity, attributability tables, agent output attributability, synthesis attributability, and full signal coverage.',
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
        ? 'Production attributability rollout checks passed. Attributability coverage and attribution readiness signal signals are healthy.'
        : 'Production attributability rollout is not ready. Resolve failed checks before relying on production attributability tooling.',
  }
}
