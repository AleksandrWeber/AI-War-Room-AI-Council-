import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FLEXIBILITY_TABLES = [
  'run_workflows',
  'usage_events',
  'shield_scans',
] as const

export type FlexibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FlexibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FlexibilityRolloutCheck[]
  guidance: string
}

export type FlexibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFlexibilityTableCount: number
  runWorkflowsTableExists: boolean
  usageEventsTableExists: boolean
  shieldScansTableExists: boolean
}

export function evaluateFlexibilityRollout(
  input: FlexibilityRolloutInput,
): FlexibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const flexibilityTableCoverageComplete =
    input.existingFlexibilityTableCount === CRITICAL_FLEXIBILITY_TABLES.length

  const checks: FlexibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL flexibility checks can reach the database.'
            : 'Production flexibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'flexibility_signal_table_coverage',
      label: 'Flexibility signal table coverage',
      status: flexibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Flexibility signal table coverage is only enforced in production.'
          : flexibilityTableCoverageComplete
            ? `${input.existingFlexibilityTableCount}/${CRITICAL_FLEXIBILITY_TABLES.length} flexibility signal tables are present.`
            : `${input.existingFlexibilityTableCount}/${CRITICAL_FLEXIBILITY_TABLES.length} flexibility signal tables were found.`,
    },
    {
      name: 'workflow_flexibility',
      label: 'Workflow flexibility',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow flexibility is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow flexibility signals.'
            : 'Production flexibility rollout requires a run_workflows table.',
    },
    {
      name: 'usage_event_flexibility',
      label: 'Usage event flexibility',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event flexibility is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event flexibility signals.'
            : 'Production flexibility rollout requires a usage_events table.',
    },
    {
      name: 'flexibility_readiness_signal',
      label: 'Flexibility readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          flexibilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.usageEventsTableExists &&
          input.shieldScansTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Flexibility readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              flexibilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.usageEventsTableExists &&
              input.shieldScansTableExists
            ? 'Run workflows, usage events, and shield scans support flexibility readiness.'
            : 'Production flexibility rollout requires PostgreSQL connectivity, flexibility tables, workflow flexibility, usage event flexibility, and full signal coverage.',
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
        ? 'Production flexibility rollout checks passed. Flexibility coverage and flexibility readiness signal signals are healthy.'
        : 'Production flexibility rollout is not ready. Resolve failed checks before relying on production flexibility tooling.',
  }
}
