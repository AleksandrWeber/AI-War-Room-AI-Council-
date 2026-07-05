import type { ApiEnv } from '../config/env.js'

export const CRITICAL_FANOUTIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type FanoutizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type FanoutizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: FanoutizabilityRolloutCheck[]
  guidance: string
}

export type FanoutizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingFanoutizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateFanoutizabilityRollout(
  input: FanoutizabilityRolloutInput,
): FanoutizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const fanoutizabilityTableCoverageComplete =
    input.existingFanoutizabilityTableCount === CRITICAL_FANOUTIZABILITY_TABLES.length

  const checks: FanoutizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL fanoutizability checks can reach the database.'
            : 'Production fanoutizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'fanoutizability_signal_table_coverage',
      label: 'Fanoutizability signal table coverage',
      status: fanoutizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Fanoutizability signal table coverage is only enforced in production.'
          : fanoutizabilityTableCoverageComplete
            ? `${input.existingFanoutizabilityTableCount}/${CRITICAL_FANOUTIZABILITY_TABLES.length} fanoutizability signal tables are present.`
            : `${input.existingFanoutizabilityTableCount}/${CRITICAL_FANOUTIZABILITY_TABLES.length} fanoutizability signal tables were found.`,
    },
    {
      name: 'meter_usage_fanoutizability',
      label: 'Meter usage fanoutizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage fanoutizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage fanoutizability signals.'
            : 'Production fanoutizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_fanoutizability',
      label: 'Usage event fanoutizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event fanoutizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event fanoutizability signals.'
            : 'Production fanoutizability rollout requires a usage_events table.',
    },
    {
      name: 'fanoutization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          fanoutizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              fanoutizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support fanoutization readiness.'
            : 'Production fanoutizability rollout requires PostgreSQL connectivity, fanoutizability tables, meter usage fanoutizability, usage event fanoutizability, and full signal coverage.',
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
        ? 'Production fanoutizability rollout checks passed. Fanoutizability coverage and distributization readiness signal signals are healthy.'
        : 'Production fanoutizability rollout is not ready. Resolve failed checks before relying on production fanoutizability tooling.',
  }
}
