import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ELABORATABILITY_TABLES = [
  'run_workflows',
  'agent_outputs',
  'moderator_syntheses',
] as const

export type ElaboratabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ElaboratabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ElaboratabilityRolloutCheck[]
  guidance: string
}

export type ElaboratabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingElaboratabilityTableCount: number
  runWorkflowsTableExists: boolean
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateElaboratabilityRollout(
  input: ElaboratabilityRolloutInput,
): ElaboratabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const elaboratabilityTableCoverageComplete =
    input.existingElaboratabilityTableCount === CRITICAL_ELABORATABILITY_TABLES.length

  const checks: ElaboratabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL elaboratability checks can reach the database.'
            : 'Production elaboratability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'elaboratability_signal_table_coverage',
      label: 'Elaboratability signal table coverage',
      status: elaboratabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Elaboratability signal table coverage is only enforced in production.'
          : elaboratabilityTableCoverageComplete
            ? `${input.existingElaboratabilityTableCount}/${CRITICAL_ELABORATABILITY_TABLES.length} elaboratability signal tables are present.`
            : `${input.existingElaboratabilityTableCount}/${CRITICAL_ELABORATABILITY_TABLES.length} elaboratability signal tables were found.`,
    },
    {
      name: 'workflow_elaboratability',
      label: 'Workflow elaboratability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow elaboratability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow elaboratability signals.'
            : 'Production elaboratability rollout requires a run_workflows table.',
    },
    {
      name: 'agent_output_elaboratability',
      label: 'Agent output elaboratability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output elaboratability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output elaboratability signals.'
            : 'Production elaboratability rollout requires a agent_outputs table.',
    },
    {
      name: 'elaboration_readiness_signal',
      label: 'Elaboration readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          elaboratabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Elaboration readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              elaboratabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Run workflows, agent outputs, and moderator syntheses support elaboration readiness.'
            : 'Production elaboratability rollout requires PostgreSQL connectivity, elaboratability tables, workflow elaboratability, agent output elaboratability, and full signal coverage.',
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
        ? 'Production elaboratability rollout checks passed. Elaboratability coverage and elaboration readiness signal signals are healthy.'
        : 'Production elaboratability rollout is not ready. Resolve failed checks before relying on production elaboratability tooling.',
  }
}
