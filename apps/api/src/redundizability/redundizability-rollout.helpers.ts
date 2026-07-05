import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REDUNDIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type RedundizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RedundizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RedundizabilityRolloutCheck[]
  guidance: string
}

export type RedundizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRedundizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateRedundizabilityRollout(
  input: RedundizabilityRolloutInput,
): RedundizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const redundizabilityTableCoverageComplete =
    input.existingRedundizabilityTableCount === CRITICAL_REDUNDIZABILITY_TABLES.length

  const checks: RedundizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL redundizability checks can reach the database.'
            : 'Production redundizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'redundizability_signal_table_coverage',
      label: 'Redundizability signal table coverage',
      status: redundizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Redundizability signal table coverage is only enforced in production.'
          : redundizabilityTableCoverageComplete
            ? `${input.existingRedundizabilityTableCount}/${CRITICAL_REDUNDIZABILITY_TABLES.length} redundizability signal tables are present.`
            : `${input.existingRedundizabilityTableCount}/${CRITICAL_REDUNDIZABILITY_TABLES.length} redundizability signal tables were found.`,
    },
    {
      name: 'meter_usage_redundizability',
      label: 'Meter usage redundizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage redundizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage redundizability signals.'
            : 'Production redundizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_redundizability',
      label: 'Usage event redundizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event redundizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event redundizability signals.'
            : 'Production redundizability rollout requires a usage_events table.',
    },
    {
      name: 'redundization_readiness_signal',
      label: 'Redundization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          redundizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Redundization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              redundizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support redundization readiness.'
            : 'Production redundizability rollout requires PostgreSQL connectivity, redundizability tables, meter usage redundizability, usage event redundizability, and full signal coverage.',
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
        ? 'Production redundizability rollout checks passed. Redundizability coverage and redundization readiness signal signals are healthy.'
        : 'Production redundizability rollout is not ready. Resolve failed checks before relying on production redundizability tooling.',
  }
}
