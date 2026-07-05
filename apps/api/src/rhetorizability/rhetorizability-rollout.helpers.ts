import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RHETORIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type RhetorizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RhetorizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RhetorizabilityRolloutCheck[]
  guidance: string
}

export type RhetorizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRhetorizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateRhetorizabilityRollout(
  input: RhetorizabilityRolloutInput,
): RhetorizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const rhetorizabilityTableCoverageComplete =
    input.existingRhetorizabilityTableCount === CRITICAL_RHETORIZABILITY_TABLES.length

  const checks: RhetorizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL rhetorizability checks can reach the database.'
            : 'Production rhetorizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'rhetorizability_signal_table_coverage',
      label: 'Rhetorizability signal table coverage',
      status: rhetorizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Rhetorizability signal table coverage is only enforced in production.'
          : rhetorizabilityTableCoverageComplete
            ? `${input.existingRhetorizabilityTableCount}/${CRITICAL_RHETORIZABILITY_TABLES.length} rhetorizability signal tables are present.`
            : `${input.existingRhetorizabilityTableCount}/${CRITICAL_RHETORIZABILITY_TABLES.length} rhetorizability signal tables were found.`,
    },
    {
      name: 'meter_usage_rhetorizability',
      label: 'Meter usage rhetorizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage rhetorizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage rhetorizability signals.'
            : 'Production rhetorizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_rhetorizability',
      label: 'Usage event rhetorizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event rhetorizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event rhetorizability signals.'
            : 'Production rhetorizability rollout requires a usage_events table.',
    },
    {
      name: 'rhetorization_readiness_signal',
      label: 'Rhetorization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          rhetorizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Rhetorization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              rhetorizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support rhetorization readiness.'
            : 'Production rhetorizability rollout requires PostgreSQL connectivity, rhetorizability tables, meter usage rhetorizability, usage event rhetorizability, and full signal coverage.',
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
        ? 'Production rhetorizability rollout checks passed. Rhetorizability coverage and rhetorization readiness signal signals are healthy.'
        : 'Production rhetorizability rollout is not ready. Resolve failed checks before relying on production rhetorizability tooling.',
  }
}
