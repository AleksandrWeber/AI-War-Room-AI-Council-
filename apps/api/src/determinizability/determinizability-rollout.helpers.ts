import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DETERMINIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type DeterminizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeterminizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeterminizabilityRolloutCheck[]
  guidance: string
}

export type DeterminizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDeterminizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateDeterminizabilityRollout(
  input: DeterminizabilityRolloutInput,
): DeterminizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const determinizabilityTableCoverageComplete =
    input.existingDeterminizabilityTableCount === CRITICAL_DETERMINIZABILITY_TABLES.length

  const checks: DeterminizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL determinizability checks can reach the database.'
            : 'Production determinizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'determinizability_signal_table_coverage',
      label: 'Determinizability signal table coverage',
      status: determinizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Determinizability signal table coverage is only enforced in production.'
          : determinizabilityTableCoverageComplete
            ? `${input.existingDeterminizabilityTableCount}/${CRITICAL_DETERMINIZABILITY_TABLES.length} determinizability signal tables are present.`
            : `${input.existingDeterminizabilityTableCount}/${CRITICAL_DETERMINIZABILITY_TABLES.length} determinizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_determinizability',
      label: 'Workspace limit determinizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit determinizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit determinizability signals.'
            : 'Production determinizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_determinizability',
      label: 'Usage event determinizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event determinizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event determinizability signals.'
            : 'Production determinizability rollout requires a usage_events table.',
    },
    {
      name: 'determinization_readiness_signal',
      label: 'Determinization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          determinizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Determinization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              determinizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support determinization readiness.'
            : 'Production determinizability rollout requires PostgreSQL connectivity, determinizability tables, workspace limit determinizability, usage event determinizability, and full signal coverage.',
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
        ? 'Production determinizability rollout checks passed. Determinizability coverage and determinization readiness signal signals are healthy.'
        : 'Production determinizability rollout is not ready. Resolve failed checks before relying on production determinizability tooling.',
  }
}
