import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LEGIBILITY_TABLES = [
  'artifacts',
  'run_workflows',
  'usage_events',
] as const

export type LegibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LegibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LegibilityRolloutCheck[]
  guidance: string
}

export type LegibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLegibilityTableCount: number
  artifactsTableExists: boolean
  runWorkflowsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateLegibilityRollout(
  input: LegibilityRolloutInput,
): LegibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const legibilityTableCoverageComplete =
    input.existingLegibilityTableCount === CRITICAL_LEGIBILITY_TABLES.length

  const checks: LegibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL legibility checks can reach the database.'
            : 'Production legibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'legibility_signal_table_coverage',
      label: 'Legibility signal table coverage',
      status: legibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Legibility signal table coverage is only enforced in production.'
          : legibilityTableCoverageComplete
            ? `${input.existingLegibilityTableCount}/${CRITICAL_LEGIBILITY_TABLES.length} legibility signal tables are present.`
            : `${input.existingLegibilityTableCount}/${CRITICAL_LEGIBILITY_TABLES.length} legibility signal tables were found.`,
    },
    {
      name: 'artifact_legibility',
      label: 'Artifact legibility',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact legibility is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact legibility signals.'
            : 'Production legibility rollout requires a artifacts table.',
    },
    {
      name: 'workflow_legibility',
      label: 'Workflow legibility',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow legibility is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow legibility signals.'
            : 'Production legibility rollout requires a run_workflows table.',
    },
    {
      name: 'legibility_readiness_signal',
      label: 'Legibility readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          legibilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.runWorkflowsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Legibility readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              legibilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.runWorkflowsTableExists &&
              input.usageEventsTableExists
            ? 'Artifacts, run workflows, and usage events support legibility readiness.'
            : 'Production legibility rollout requires PostgreSQL connectivity, legibility tables, artifact legibility, workflow legibility, and full signal coverage.',
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
        ? 'Production legibility rollout checks passed. Legibility coverage and legibility readiness signal signals are healthy.'
        : 'Production legibility rollout is not ready. Resolve failed checks before relying on production legibility tooling.',
  }
}
