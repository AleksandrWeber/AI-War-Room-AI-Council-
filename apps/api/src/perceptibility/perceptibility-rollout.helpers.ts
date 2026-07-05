import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PERCEPTIBILITY_TABLES = [
  'usage_events',
  'billing_meter_usage_reports',
  'workspace_usage_limits',
] as const

export type PerceptibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PerceptibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PerceptibilityRolloutCheck[]
  guidance: string
}

export type PerceptibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPerceptibilityTableCount: number
  usageEventsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluatePerceptibilityRollout(
  input: PerceptibilityRolloutInput,
): PerceptibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const perceptibilityTableCoverageComplete =
    input.existingPerceptibilityTableCount === CRITICAL_PERCEPTIBILITY_TABLES.length

  const checks: PerceptibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL perceptibility checks can reach the database.'
            : 'Production perceptibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'perceptibility_signal_table_coverage',
      label: 'Perceptibility signal table coverage',
      status: perceptibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Perceptibility signal table coverage is only enforced in production.'
          : perceptibilityTableCoverageComplete
            ? `${input.existingPerceptibilityTableCount}/${CRITICAL_PERCEPTIBILITY_TABLES.length} perceptibility signal tables are present.`
            : `${input.existingPerceptibilityTableCount}/${CRITICAL_PERCEPTIBILITY_TABLES.length} perceptibility signal tables were found.`,
    },
    {
      name: 'usage_event_perceptibility',
      label: 'Usage event perceptibility',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event perceptibility is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event perceptibility signals.'
            : 'Production perceptibility rollout requires a usage_events table.',
    },
    {
      name: 'meter_usage_perceptibility',
      label: 'Meter usage perceptibility',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage perceptibility is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage perceptibility signals.'
            : 'Production perceptibility rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'perception_readiness_signal',
      label: 'Perception readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          perceptibilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.billingMeterUsageReportsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Perception readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              perceptibilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.billingMeterUsageReportsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Usage events, meter usage reports, and workspace usage limits support perception readiness.'
            : 'Production perceptibility rollout requires PostgreSQL connectivity, perceptibility tables, usage event perceptibility, meter usage perceptibility, and full signal coverage.',
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
        ? 'Production perceptibility rollout checks passed. Perceptibility coverage and perception readiness signal signals are healthy.'
        : 'Production perceptibility rollout is not ready. Resolve failed checks before relying on production perceptibility tooling.',
  }
}
