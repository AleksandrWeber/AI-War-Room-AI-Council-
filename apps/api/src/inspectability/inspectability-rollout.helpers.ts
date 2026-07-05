import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INSPECTABILITY_TABLES = [
  'usage_events',
  'billing_meter_usage_reports',
  'workspace_usage_limits',
] as const

export type InspectabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InspectabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InspectabilityRolloutCheck[]
  guidance: string
}

export type InspectabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInspectabilityTableCount: number
  usageEventsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateInspectabilityRollout(
  input: InspectabilityRolloutInput,
): InspectabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const inspectabilityTableCoverageComplete =
    input.existingInspectabilityTableCount === CRITICAL_INSPECTABILITY_TABLES.length

  const checks: InspectabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL inspectability checks can reach the database.'
            : 'Production inspectability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'inspectability_signal_table_coverage',
      label: 'Inspectability signal table coverage',
      status: inspectabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Inspectability signal table coverage is only enforced in production.'
          : inspectabilityTableCoverageComplete
            ? `${input.existingInspectabilityTableCount}/${CRITICAL_INSPECTABILITY_TABLES.length} inspectability signal tables are present.`
            : `${input.existingInspectabilityTableCount}/${CRITICAL_INSPECTABILITY_TABLES.length} inspectability signal tables were found.`,
    },
    {
      name: 'usage_inspectability',
      label: 'Usage inspectability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage inspectability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage inspectability signals.'
            : 'Production inspectability rollout requires a usage_events table.',
    },
    {
      name: 'meter_usage_inspectability',
      label: 'Meter usage inspectability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage inspectability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage inspectability signals.'
            : 'Production inspectability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'review_readiness_signal',
      label: 'Review readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          inspectabilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.billingMeterUsageReportsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Review readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              inspectabilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.billingMeterUsageReportsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Usage events, meter usage reports, and workspace usage limits support review readiness.'
            : 'Production inspectability rollout requires PostgreSQL connectivity, inspectability tables, usage inspectability, meter usage inspectability, and full signal coverage.',
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
        ? 'Production inspectability rollout checks passed. Inspectability coverage and review readiness signal signals are healthy.'
        : 'Production inspectability rollout is not ready. Resolve failed checks before relying on production inspectability tooling.',
  }
}
