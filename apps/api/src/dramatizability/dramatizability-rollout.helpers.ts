import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DRAMATIZABILITY_TABLES = [
  'artifacts',
  'agent_outputs',
  'moderator_syntheses',
] as const

export type DramatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DramatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DramatizabilityRolloutCheck[]
  guidance: string
}

export type DramatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDramatizabilityTableCount: number
  artifactsTableExists: boolean
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateDramatizabilityRollout(
  input: DramatizabilityRolloutInput,
): DramatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const dramatizabilityTableCoverageComplete =
    input.existingDramatizabilityTableCount === CRITICAL_DRAMATIZABILITY_TABLES.length

  const checks: DramatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL dramatizability checks can reach the database.'
            : 'Production dramatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'dramatizability_signal_table_coverage',
      label: 'Dramatizability signal table coverage',
      status: dramatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Dramatizability signal table coverage is only enforced in production.'
          : dramatizabilityTableCoverageComplete
            ? `${input.existingDramatizabilityTableCount}/${CRITICAL_DRAMATIZABILITY_TABLES.length} dramatizability signal tables are present.`
            : `${input.existingDramatizabilityTableCount}/${CRITICAL_DRAMATIZABILITY_TABLES.length} dramatizability signal tables were found.`,
    },
    {
      name: 'artifact_dramatizability',
      label: 'Artifact dramatizability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact dramatizability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact dramatizability signals.'
            : 'Production dramatizability rollout requires a artifacts table.',
    },
    {
      name: 'agent_output_dramatizability',
      label: 'Agent output dramatizability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output dramatizability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output dramatizability signals.'
            : 'Production dramatizability rollout requires a agent_outputs table.',
    },
    {
      name: 'dramatization_readiness_signal',
      label: 'Dramatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          dramatizabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Dramatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              dramatizabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Artifacts, agent outputs, and moderator syntheses support dramatization readiness.'
            : 'Production dramatizability rollout requires PostgreSQL connectivity, dramatizability tables, artifact dramatizability, agent output dramatizability, and full signal coverage.',
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
        ? 'Production dramatizability rollout checks passed. Dramatizability coverage and dramatization readiness signal signals are healthy.'
        : 'Production dramatizability rollout is not ready. Resolve failed checks before relying on production dramatizability tooling.',
  }
}
