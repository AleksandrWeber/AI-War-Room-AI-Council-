import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NCOMPACTIONIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type RebalanceizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RebalanceizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RebalanceizabilityRolloutCheck[]
  guidance: string
}

export type RebalanceizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRebalanceizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateRebalanceizabilityRollout(
  input: RebalanceizabilityRolloutInput,
): RebalanceizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const rebalanceizabilityTableCoverageComplete =
    input.existingRebalanceizabilityTableCount === CRITICAL_NCOMPACTIONIZABILITY_TABLES.length

  const checks: RebalanceizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL rebalanceizability checks can reach the database.'
            : 'Production rebalanceizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'rebalanceizability_signal_table_coverage',
      label: 'Rebalanceizability signal table coverage',
      status: rebalanceizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Rebalanceizability signal table coverage is only enforced in production.'
          : rebalanceizabilityTableCoverageComplete
            ? `${input.existingRebalanceizabilityTableCount}/${CRITICAL_NCOMPACTIONIZABILITY_TABLES.length} rebalanceizability signal tables are present.`
            : `${input.existingRebalanceizabilityTableCount}/${CRITICAL_NCOMPACTIONIZABILITY_TABLES.length} rebalanceizability signal tables were found.`,
    },
    {
      name: 'meter_usage_rebalanceizability',
      label: 'Meter usage rebalanceizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage rebalanceizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage rebalanceizability signals.'
            : 'Production rebalanceizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_rebalanceizability',
      label: 'Usage event rebalanceizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event rebalanceizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event rebalanceizability signals.'
            : 'Production rebalanceizability rollout requires a usage_events table.',
    },
    {
      name: 'rebalanceization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          rebalanceizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              rebalanceizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support rebalanceization readiness.'
            : 'Production rebalanceizability rollout requires PostgreSQL connectivity, rebalanceizability tables, meter usage rebalanceizability, usage event rebalanceizability, and full signal coverage.',
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
        ? 'Production rebalanceizability rollout checks passed. Rebalanceizability coverage and distributization readiness signal signals are healthy.'
        : 'Production rebalanceizability rollout is not ready. Resolve failed checks before relying on production rebalanceizability tooling.',
  }
}
