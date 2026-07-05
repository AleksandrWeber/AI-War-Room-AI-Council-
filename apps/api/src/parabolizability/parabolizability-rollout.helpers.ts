import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PARABOLIZABILITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'artifacts',
] as const

export type ParabolizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ParabolizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ParabolizabilityRolloutCheck[]
  guidance: string
}

export type ParabolizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingParabolizabilityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateParabolizabilityRollout(
  input: ParabolizabilityRolloutInput,
): ParabolizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const parabolizabilityTableCoverageComplete =
    input.existingParabolizabilityTableCount === CRITICAL_PARABOLIZABILITY_TABLES.length

  const checks: ParabolizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL parabolizability checks can reach the database.'
            : 'Production parabolizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'parabolizability_signal_table_coverage',
      label: 'Parabolizability signal table coverage',
      status: parabolizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Parabolizability signal table coverage is only enforced in production.'
          : parabolizabilityTableCoverageComplete
            ? `${input.existingParabolizabilityTableCount}/${CRITICAL_PARABOLIZABILITY_TABLES.length} parabolizability signal tables are present.`
            : `${input.existingParabolizabilityTableCount}/${CRITICAL_PARABOLIZABILITY_TABLES.length} parabolizability signal tables were found.`,
    },
    {
      name: 'synthesis_parabolizability',
      label: 'Synthesis parabolizability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis parabolizability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis parabolizability signals.'
            : 'Production parabolizability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_parabolizability',
      label: 'Agent output parabolizability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output parabolizability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output parabolizability signals.'
            : 'Production parabolizability rollout requires a agent_outputs table.',
    },
    {
      name: 'parabolization_readiness_signal',
      label: 'Parabolization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          parabolizabilityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Parabolization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              parabolizabilityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.artifactsTableExists
            ? 'Moderator syntheses, agent outputs, and persisted artifacts support parabolization readiness.'
            : 'Production parabolizability rollout requires PostgreSQL connectivity, parabolizability tables, synthesis parabolizability, agent output parabolizability, and full signal coverage.',
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
        ? 'Production parabolizability rollout checks passed. Parabolizability coverage and parabolization readiness signal signals are healthy.'
        : 'Production parabolizability rollout is not ready. Resolve failed checks before relying on production parabolizability tooling.',
  }
}
