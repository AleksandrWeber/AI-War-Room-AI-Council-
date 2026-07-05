import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISTINGUISHABILITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'run_workflows',
] as const

export type DistinguishabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DistinguishabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DistinguishabilityRolloutCheck[]
  guidance: string
}

export type DistinguishabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDistinguishabilityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  runWorkflowsTableExists: boolean
}

export function evaluateDistinguishabilityRollout(
  input: DistinguishabilityRolloutInput,
): DistinguishabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const distinguishabilityTableCoverageComplete =
    input.existingDistinguishabilityTableCount === CRITICAL_DISTINGUISHABILITY_TABLES.length

  const checks: DistinguishabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL distinguishability checks can reach the database.'
            : 'Production distinguishability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'distinguishability_signal_table_coverage',
      label: 'Distinguishability signal table coverage',
      status: distinguishabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Distinguishability signal table coverage is only enforced in production.'
          : distinguishabilityTableCoverageComplete
            ? `${input.existingDistinguishabilityTableCount}/${CRITICAL_DISTINGUISHABILITY_TABLES.length} distinguishability signal tables are present.`
            : `${input.existingDistinguishabilityTableCount}/${CRITICAL_DISTINGUISHABILITY_TABLES.length} distinguishability signal tables were found.`,
    },
    {
      name: 'synthesis_distinguishability',
      label: 'Synthesis distinguishability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis distinguishability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis distinguishability signals.'
            : 'Production distinguishability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_distinguishability',
      label: 'Agent output distinguishability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output distinguishability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output distinguishability signals.'
            : 'Production distinguishability rollout requires a agent_outputs table.',
    },
    {
      name: 'differentiation_readiness_signal',
      label: 'Differentiation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          distinguishabilityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.runWorkflowsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Differentiation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              distinguishabilityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.runWorkflowsTableExists
            ? 'Moderator syntheses, agent outputs, and run workflows support differentiation readiness.'
            : 'Production distinguishability rollout requires PostgreSQL connectivity, distinguishability tables, synthesis distinguishability, agent output distinguishability, and full signal coverage.',
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
        ? 'Production distinguishability rollout checks passed. Distinguishability coverage and differentiation readiness signal signals are healthy.'
        : 'Production distinguishability rollout is not ready. Resolve failed checks before relying on production distinguishability tooling.',
  }
}
