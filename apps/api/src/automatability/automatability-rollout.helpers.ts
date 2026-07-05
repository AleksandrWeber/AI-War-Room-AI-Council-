import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUTOMATABILITY_TABLES = [
  'agent_outputs',
  'run_workflows',
  'artifacts',
] as const

export type AutomatabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AutomatabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AutomatabilityRolloutCheck[]
  guidance: string
}

export type AutomatabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAutomatabilityTableCount: number
  agentOutputsTableExists: boolean
  runWorkflowsTableExists: boolean
  artifactsTableExists: boolean
}

export function evaluateAutomatabilityRollout(
  input: AutomatabilityRolloutInput,
): AutomatabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const automatabilityTableCoverageComplete =
    input.existingAutomatabilityTableCount === CRITICAL_AUTOMATABILITY_TABLES.length

  const checks: AutomatabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL automatability checks can reach the database.'
            : 'Production automatability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'automatability_signal_table_coverage',
      label: 'Automatability signal table coverage',
      status: automatabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Automatability signal table coverage is only enforced in production.'
          : automatabilityTableCoverageComplete
            ? `${input.existingAutomatabilityTableCount}/${CRITICAL_AUTOMATABILITY_TABLES.length} automatability signal tables are present.`
            : `${input.existingAutomatabilityTableCount}/${CRITICAL_AUTOMATABILITY_TABLES.length} automatability signal tables were found.`,
    },
    {
      name: 'agent_output_automatability',
      label: 'Agent output automatability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output automatability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output automatability signals.'
            : 'Production automatability rollout requires a agent_outputs table.',
    },
    {
      name: 'workflow_automatability',
      label: 'Workflow automatability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow automatability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow automatability signals.'
            : 'Production automatability rollout requires a run_workflows table.',
    },
    {
      name: 'automation_readiness_signal',
      label: 'Automation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          automatabilityTableCoverageComplete &&
          input.agentOutputsTableExists &&
          input.runWorkflowsTableExists &&
          input.artifactsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Automation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              automatabilityTableCoverageComplete &&
              input.agentOutputsTableExists &&
              input.runWorkflowsTableExists &&
              input.artifactsTableExists
            ? 'Agent outputs, run workflows, and persisted artifacts support automation readiness.'
            : 'Production automatability rollout requires PostgreSQL connectivity, automatability tables, agent output automatability, workflow automatability, and full signal coverage.',
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
        ? 'Production automatability rollout checks passed. Automatability coverage and automation readiness signal signals are healthy.'
        : 'Production automatability rollout is not ready. Resolve failed checks before relying on production automatability tooling.',
  }
}
