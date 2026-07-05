import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COHERENCE_TABLES = [
  'run_workflows',
  'agent_outputs',
  'moderator_syntheses',
] as const

export type CoherenceRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CoherenceRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CoherenceRolloutCheck[]
  guidance: string
}

export type CoherenceRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCoherenceTableCount: number
  runWorkflowsTableExists: boolean
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateCoherenceRollout(
  input: CoherenceRolloutInput,
): CoherenceRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const coherenceTableCoverageComplete =
    input.existingCoherenceTableCount === CRITICAL_COHERENCE_TABLES.length

  const checks: CoherenceRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL coherence checks can reach the database.'
            : 'Production coherence rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'coherence_signal_table_coverage',
      label: 'Coherence signal table coverage',
      status: coherenceTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Coherence signal table coverage is only enforced in production.'
          : coherenceTableCoverageComplete
            ? `${input.existingCoherenceTableCount}/${CRITICAL_COHERENCE_TABLES.length} coherence signal tables are present.`
            : `${input.existingCoherenceTableCount}/${CRITICAL_COHERENCE_TABLES.length} coherence signal tables were found.`,
    },
    {
      name: 'workflow_coherence',
      label: 'Workflow coherence',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow coherence is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow coherence signals.'
            : 'Production coherence rollout requires a run_workflows table.',
    },
    {
      name: 'agent_output_coherence',
      label: 'Agent output coherence',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output coherence is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output coherence signals.'
            : 'Production coherence rollout requires a agent_outputs table.',
    },
    {
      name: 'coherence_readiness_signal',
      label: 'Coherence readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          coherenceTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Coherence readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              coherenceTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Run workflows, agent outputs, and moderator syntheses support coherence readiness.'
            : 'Production coherence rollout requires PostgreSQL connectivity, coherence tables, workflow coherence, agent output coherence, and full signal coverage.',
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
        ? 'Production coherence rollout checks passed. Coherence coverage and coherence readiness signal signals are healthy.'
        : 'Production coherence rollout is not ready. Resolve failed checks before relying on production coherence tooling.',
  }
}
