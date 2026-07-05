import type { ApiEnv } from '../config/env.js'

export const CRITICAL_WARMIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type WarmizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type WarmizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: WarmizabilityRolloutCheck[]
  guidance: string
}

export type WarmizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingWarmizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateWarmizabilityRollout(
  input: WarmizabilityRolloutInput,
): WarmizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const warmizabilityTableCoverageComplete =
    input.existingWarmizabilityTableCount === CRITICAL_WARMIZABILITY_TABLES.length

  const checks: WarmizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL warmizability checks can reach the database.'
            : 'Production warmizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'warmizability_signal_table_coverage',
      label: 'Warmizability signal table coverage',
      status: warmizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Warmizability signal table coverage is only enforced in production.'
          : warmizabilityTableCoverageComplete
            ? `${input.existingWarmizabilityTableCount}/${CRITICAL_WARMIZABILITY_TABLES.length} warmizability signal tables are present.`
            : `${input.existingWarmizabilityTableCount}/${CRITICAL_WARMIZABILITY_TABLES.length} warmizability signal tables were found.`,
    },
    {
      name: 'meter_usage_warmizability',
      label: 'Meter usage warmizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage warmizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage warmizability signals.'
            : 'Production warmizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_warmizability',
      label: 'Usage event warmizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event warmizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event warmizability signals.'
            : 'Production warmizability rollout requires a usage_events table.',
    },
    {
      name: 'warmization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          warmizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              warmizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support warmization readiness.'
            : 'Production warmizability rollout requires PostgreSQL connectivity, warmizability tables, meter usage warmizability, usage event warmizability, and full signal coverage.',
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
        ? 'Production warmizability rollout checks passed. Warmizability coverage and distributization readiness signal signals are healthy.'
        : 'Production warmizability rollout is not ready. Resolve failed checks before relying on production warmizability tooling.',
  }
}
