import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REVIEWABILITY_TABLES = [
  'artifacts',
  'agent_outputs',
  'billing_invoices',
] as const

export type ReviewabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReviewabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReviewabilityRolloutCheck[]
  guidance: string
}

export type ReviewabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReviewabilityTableCount: number
  artifactsTableExists: boolean
  agentOutputsTableExists: boolean
  billingInvoicesTableExists: boolean
}

export function evaluateReviewabilityRollout(
  input: ReviewabilityRolloutInput,
): ReviewabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const reviewabilityTableCoverageComplete =
    input.existingReviewabilityTableCount === CRITICAL_REVIEWABILITY_TABLES.length

  const checks: ReviewabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL reviewability checks can reach the database.'
            : 'Production reviewability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'reviewability_signal_table_coverage',
      label: 'Reviewability signal table coverage',
      status: reviewabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Reviewability signal table coverage is only enforced in production.'
          : reviewabilityTableCoverageComplete
            ? `${input.existingReviewabilityTableCount}/${CRITICAL_REVIEWABILITY_TABLES.length} reviewability signal tables are present.`
            : `${input.existingReviewabilityTableCount}/${CRITICAL_REVIEWABILITY_TABLES.length} reviewability signal tables were found.`,
    },
    {
      name: 'artifact_reviewability',
      label: 'Artifact reviewability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact reviewability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact reviewability signals.'
            : 'Production reviewability rollout requires a artifacts table.',
    },
    {
      name: 'agent_output_reviewability',
      label: 'Agent output reviewability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output reviewability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output reviewability signals.'
            : 'Production reviewability rollout requires a agent_outputs table.',
    },
    {
      name: 'assessment_readiness_signal',
      label: 'Assessment readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          reviewabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.agentOutputsTableExists &&
          input.billingInvoicesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Assessment readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              reviewabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.agentOutputsTableExists &&
              input.billingInvoicesTableExists
            ? 'Persisted artifacts, agent outputs, and billing invoices support assessment readiness.'
            : 'Production reviewability rollout requires PostgreSQL connectivity, reviewability tables, artifact reviewability, agent output reviewability, and full signal coverage.',
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
        ? 'Production reviewability rollout checks passed. Reviewability coverage and assessment readiness signal signals are healthy.'
        : 'Production reviewability rollout is not ready. Resolve failed checks before relying on production reviewability tooling.',
  }
}
