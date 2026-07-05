import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CARACTERIZABILITY_TABLES = [
  'run_workflows',
  'agent_outputs',
  'moderator_syntheses',
] as const

export type CaracterizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CaracterizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CaracterizabilityRolloutCheck[]
  guidance: string
}

export type CaracterizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCaracterizabilityTableCount: number
  runWorkflowsTableExists: boolean
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateCaracterizabilityRollout(
  input: CaracterizabilityRolloutInput,
): CaracterizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const caracterizabilityTableCoverageComplete =
    input.existingCaracterizabilityTableCount === CRITICAL_CARACTERIZABILITY_TABLES.length

  const checks: CaracterizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL caracterizability checks can reach the database.'
            : 'Production caracterizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'caracterizability_signal_table_coverage',
      label: 'Caracterizability signal table coverage',
      status: caracterizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Caracterizability signal table coverage is only enforced in production.'
          : caracterizabilityTableCoverageComplete
            ? `${input.existingCaracterizabilityTableCount}/${CRITICAL_CARACTERIZABILITY_TABLES.length} caracterizability signal tables are present.`
            : `${input.existingCaracterizabilityTableCount}/${CRITICAL_CARACTERIZABILITY_TABLES.length} caracterizability signal tables were found.`,
    },
    {
      name: 'workflow_caracterizability',
      label: 'Workflow caracterizability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow caracterizability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow caracterizability signals.'
            : 'Production caracterizability rollout requires a run_workflows table.',
    },
    {
      name: 'agent_output_caracterizability',
      label: 'Agent output caracterizability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output caracterizability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output caracterizability signals.'
            : 'Production caracterizability rollout requires a agent_outputs table.',
    },
    {
      name: 'characterization_readiness_signal',
      label: 'Characterization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          caracterizabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Characterization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              caracterizabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Run workflows, agent outputs, and moderator syntheses support characterization readiness.'
            : 'Production caracterizability rollout requires PostgreSQL connectivity, caracterizability tables, workflow caracterizability, agent output caracterizability, and full signal coverage.',
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
        ? 'Production caracterizability rollout checks passed. Caracterizability coverage and characterization readiness signal signals are healthy.'
        : 'Production caracterizability rollout is not ready. Resolve failed checks before relying on production caracterizability tooling.',
  }
}
