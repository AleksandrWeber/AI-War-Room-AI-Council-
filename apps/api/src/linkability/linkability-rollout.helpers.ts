import type { ApiEnv } from '../config/env.js'

export const CRITICAL_LINKABILITY_TABLES = [
  'run_workflows',
  'artifacts',
  'billing_records',
] as const

export type LinkabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LinkabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: LinkabilityRolloutCheck[]
  guidance: string
}

export type LinkabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingLinkabilityTableCount: number
  runWorkflowsTableExists: boolean
  artifactsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateLinkabilityRollout(
  input: LinkabilityRolloutInput,
): LinkabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const linkabilityTableCoverageComplete =
    input.existingLinkabilityTableCount === CRITICAL_LINKABILITY_TABLES.length

  const checks: LinkabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL linkability checks can reach the database.'
            : 'Production linkability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'linkability_signal_table_coverage',
      label: 'Linkability signal table coverage',
      status: linkabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Linkability signal table coverage is only enforced in production.'
          : linkabilityTableCoverageComplete
            ? `${input.existingLinkabilityTableCount}/${CRITICAL_LINKABILITY_TABLES.length} linkability signal tables are present.`
            : `${input.existingLinkabilityTableCount}/${CRITICAL_LINKABILITY_TABLES.length} linkability signal tables were found.`,
    },
    {
      name: 'workflow_linkability',
      label: 'Workflow linkability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow linkability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow linkability signals.'
            : 'Production linkability rollout requires a run_workflows table.',
    },
    {
      name: 'artifact_linkability',
      label: 'Artifact linkability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact linkability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact linkability signals.'
            : 'Production linkability rollout requires a artifacts table.',
    },
    {
      name: 'link_readiness_signal',
      label: 'Link readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          linkabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.artifactsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Link readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              linkabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.artifactsTableExists &&
              input.billingRecordsTableExists
            ? 'Run workflows, persisted artifacts, and billing records support link readiness.'
            : 'Production linkability rollout requires PostgreSQL connectivity, linkability tables, workflow linkability, artifact linkability, and full signal coverage.',
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
        ? 'Production linkability rollout checks passed. Linkability coverage and link readiness signal signals are healthy.'
        : 'Production linkability rollout is not ready. Resolve failed checks before relying on production linkability tooling.',
  }
}
