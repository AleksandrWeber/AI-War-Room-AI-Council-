import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REPEATABILITY_TABLES = [
  'artifacts',
  'run_workflows',
  'billing_notifications',
] as const

export type RepeatabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RepeatabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RepeatabilityRolloutCheck[]
  guidance: string
}

export type RepeatabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRepeatabilityTableCount: number
  artifactsTableExists: boolean
  runWorkflowsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateRepeatabilityRollout(
  input: RepeatabilityRolloutInput,
): RepeatabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const repeatabilityTableCoverageComplete =
    input.existingRepeatabilityTableCount === CRITICAL_REPEATABILITY_TABLES.length

  const checks: RepeatabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL repeatability checks can reach the database.'
            : 'Production repeatability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'repeatability_signal_table_coverage',
      label: 'Repeatability signal table coverage',
      status: repeatabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Repeatability signal table coverage is only enforced in production.'
          : repeatabilityTableCoverageComplete
            ? `${input.existingRepeatabilityTableCount}/${CRITICAL_REPEATABILITY_TABLES.length} repeatability signal tables are present.`
            : `${input.existingRepeatabilityTableCount}/${CRITICAL_REPEATABILITY_TABLES.length} repeatability signal tables were found.`,
    },
    {
      name: 'artifact_repeatability',
      label: 'Artifact repeatability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact repeatability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact repeatability signals.'
            : 'Production repeatability rollout requires a artifacts table.',
    },
    {
      name: 'workflow_repeatability',
      label: 'Workflow repeatability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow repeatability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow repeatability signals.'
            : 'Production repeatability rollout requires a run_workflows table.',
    },
    {
      name: 'repetition_readiness_signal',
      label: 'Repetition readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          repeatabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.runWorkflowsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Repetition readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              repeatabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.runWorkflowsTableExists &&
              input.billingNotificationsTableExists
            ? 'Artifacts, run workflows, and billing notifications support repetition readiness.'
            : 'Production repeatability rollout requires PostgreSQL connectivity, repeatability tables, artifact repeatability, workflow repeatability, and full signal coverage.',
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
        ? 'Production repeatability rollout checks passed. Repeatability coverage and repetition readiness signal signals are healthy.'
        : 'Production repeatability rollout is not ready. Resolve failed checks before relying on production repeatability tooling.',
  }
}
