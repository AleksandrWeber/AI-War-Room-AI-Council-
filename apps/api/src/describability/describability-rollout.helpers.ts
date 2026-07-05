import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DESCRIBABILITY_TABLES = [
  'run_workflows',
  'agent_outputs',
  'moderator_syntheses',
] as const

export type DescribabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DescribabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DescribabilityRolloutCheck[]
  guidance: string
}

export type DescribabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDescribabilityTableCount: number
  runWorkflowsTableExists: boolean
  agentOutputsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateDescribabilityRollout(
  input: DescribabilityRolloutInput,
): DescribabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const describabilityTableCoverageComplete =
    input.existingDescribabilityTableCount === CRITICAL_DESCRIBABILITY_TABLES.length

  const checks: DescribabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL describability checks can reach the database.'
            : 'Production describability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'describability_signal_table_coverage',
      label: 'Describability signal table coverage',
      status: describabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Describability signal table coverage is only enforced in production.'
          : describabilityTableCoverageComplete
            ? `${input.existingDescribabilityTableCount}/${CRITICAL_DESCRIBABILITY_TABLES.length} describability signal tables are present.`
            : `${input.existingDescribabilityTableCount}/${CRITICAL_DESCRIBABILITY_TABLES.length} describability signal tables were found.`,
    },
    {
      name: 'workflow_describability',
      label: 'Workflow describability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow describability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow describability signals.'
            : 'Production describability rollout requires a run_workflows table.',
    },
    {
      name: 'agent_output_describability',
      label: 'Agent output describability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output describability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output describability signals.'
            : 'Production describability rollout requires a agent_outputs table.',
    },
    {
      name: 'description_readiness_signal',
      label: 'Description readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          describabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.agentOutputsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Description readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              describabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.agentOutputsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Run workflows, agent outputs, and moderator syntheses support description readiness.'
            : 'Production describability rollout requires PostgreSQL connectivity, describability tables, workflow describability, agent output describability, and full signal coverage.',
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
        ? 'Production describability rollout checks passed. Describability coverage and description readiness signal signals are healthy.'
        : 'Production describability rollout is not ready. Resolve failed checks before relying on production describability tooling.',
  }
}
