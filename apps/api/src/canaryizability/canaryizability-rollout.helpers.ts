import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CANARYIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type CanaryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CanaryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CanaryizabilityRolloutCheck[]
  guidance: string
}

export type CanaryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCanaryizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateCanaryizabilityRollout(
  input: CanaryizabilityRolloutInput,
): CanaryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const canaryizabilityTableCoverageComplete =
    input.existingCanaryizabilityTableCount === CRITICAL_CANARYIZABILITY_TABLES.length

  const checks: CanaryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL canaryizability checks can reach the database.'
            : 'Production canaryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'canaryizability_signal_table_coverage',
      label: 'Canaryizability signal table coverage',
      status: canaryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Canaryizability signal table coverage is only enforced in production.'
          : canaryizabilityTableCoverageComplete
            ? `${input.existingCanaryizabilityTableCount}/${CRITICAL_CANARYIZABILITY_TABLES.length} canaryizability signal tables are present.`
            : `${input.existingCanaryizabilityTableCount}/${CRITICAL_CANARYIZABILITY_TABLES.length} canaryizability signal tables were found.`,
    },
    {
      name: 'meter_usage_canaryizability',
      label: 'Meter usage canaryizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage canaryizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage canaryizability signals.'
            : 'Production canaryizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_canaryizability',
      label: 'Usage event canaryizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event canaryizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event canaryizability signals.'
            : 'Production canaryizability rollout requires a usage_events table.',
    },
    {
      name: 'canaryization_readiness_signal',
      label: 'Canaryization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          canaryizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Canaryization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              canaryizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support canaryization readiness.'
            : 'Production canaryizability rollout requires PostgreSQL connectivity, canaryizability tables, meter usage canaryizability, usage event canaryizability, and full signal coverage.',
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
        ? 'Production canaryizability rollout checks passed. Canaryizability coverage and canaryization readiness signal signals are healthy.'
        : 'Production canaryizability rollout is not ready. Resolve failed checks before relying on production canaryizability tooling.',
  }
}
