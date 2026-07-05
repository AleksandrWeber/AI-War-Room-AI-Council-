import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ORCHESTRABILITY_TABLES = [
  'run_workflows',
  'moderator_syntheses',
  'billing_notifications',
] as const

export type OrchestrabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OrchestrabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OrchestrabilityRolloutCheck[]
  guidance: string
}

export type OrchestrabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOrchestrabilityTableCount: number
  runWorkflowsTableExists: boolean
  moderatorSynthesesTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateOrchestrabilityRollout(
  input: OrchestrabilityRolloutInput,
): OrchestrabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const orchestrabilityTableCoverageComplete =
    input.existingOrchestrabilityTableCount === CRITICAL_ORCHESTRABILITY_TABLES.length

  const checks: OrchestrabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL orchestrability checks can reach the database.'
            : 'Production orchestrability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'orchestrability_signal_table_coverage',
      label: 'Orchestrability signal table coverage',
      status: orchestrabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Orchestrability signal table coverage is only enforced in production.'
          : orchestrabilityTableCoverageComplete
            ? `${input.existingOrchestrabilityTableCount}/${CRITICAL_ORCHESTRABILITY_TABLES.length} orchestrability signal tables are present.`
            : `${input.existingOrchestrabilityTableCount}/${CRITICAL_ORCHESTRABILITY_TABLES.length} orchestrability signal tables were found.`,
    },
    {
      name: 'workflow_orchestrability',
      label: 'Workflow orchestrability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow orchestrability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow orchestrability signals.'
            : 'Production orchestrability rollout requires a run_workflows table.',
    },
    {
      name: 'synthesis_orchestrability',
      label: 'Synthesis orchestrability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis orchestrability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis orchestrability signals.'
            : 'Production orchestrability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'orchestration_readiness_signal',
      label: 'Orchestration readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          orchestrabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.moderatorSynthesesTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Orchestration readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              orchestrabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.moderatorSynthesesTableExists &&
              input.billingNotificationsTableExists
            ? 'Run workflows, moderator syntheses, and billing notifications support orchestration readiness.'
            : 'Production orchestrability rollout requires PostgreSQL connectivity, orchestrability tables, workflow orchestrability, synthesis orchestrability, and full signal coverage.',
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
        ? 'Production orchestrability rollout checks passed. Orchestrability coverage and orchestration readiness signal signals are healthy.'
        : 'Production orchestrability rollout is not ready. Resolve failed checks before relying on production orchestrability tooling.',
  }
}
