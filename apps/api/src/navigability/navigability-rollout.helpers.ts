import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NAVIGABILITY_TABLES = [
  'run_workflows',
  'moderator_syntheses',
  'billing_invoices',
] as const

export type NavigabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NavigabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NavigabilityRolloutCheck[]
  guidance: string
}

export type NavigabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNavigabilityTableCount: number
  runWorkflowsTableExists: boolean
  moderatorSynthesesTableExists: boolean
  billingInvoicesTableExists: boolean
}

export function evaluateNavigabilityRollout(
  input: NavigabilityRolloutInput,
): NavigabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const navigabilityTableCoverageComplete =
    input.existingNavigabilityTableCount === CRITICAL_NAVIGABILITY_TABLES.length

  const checks: NavigabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL navigability checks can reach the database.'
            : 'Production navigability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'navigability_signal_table_coverage',
      label: 'Navigability signal table coverage',
      status: navigabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Navigability signal table coverage is only enforced in production.'
          : navigabilityTableCoverageComplete
            ? `${input.existingNavigabilityTableCount}/${CRITICAL_NAVIGABILITY_TABLES.length} navigability signal tables are present.`
            : `${input.existingNavigabilityTableCount}/${CRITICAL_NAVIGABILITY_TABLES.length} navigability signal tables were found.`,
    },
    {
      name: 'workflow_navigability',
      label: 'Workflow navigability',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow navigability is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow navigability signals.'
            : 'Production navigability rollout requires a run_workflows table.',
    },
    {
      name: 'synthesis_navigability',
      label: 'Synthesis navigability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis navigability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis navigability signals.'
            : 'Production navigability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'navigation_readiness_signal',
      label: 'Navigation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          navigabilityTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.moderatorSynthesesTableExists &&
          input.billingInvoicesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Navigation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              navigabilityTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.moderatorSynthesesTableExists &&
              input.billingInvoicesTableExists
            ? 'Run workflows, moderator syntheses, and billing invoices support navigation readiness.'
            : 'Production navigability rollout requires PostgreSQL connectivity, navigability tables, workflow navigability, synthesis navigability, and full signal coverage.',
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
        ? 'Production navigability rollout checks passed. Navigability coverage and navigation readiness signal signals are healthy.'
        : 'Production navigability rollout is not ready. Resolve failed checks before relying on production navigability tooling.',
  }
}
