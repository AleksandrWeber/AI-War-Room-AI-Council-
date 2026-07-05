import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MARKETABILITY_TABLES = [
  'workspace_memberships',
  'billing_meter_usage_reports',
  'usage_events',
] as const

export type MarketabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MarketabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MarketabilityRolloutCheck[]
  guidance: string
}

export type MarketabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMarketabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateMarketabilityRollout(
  input: MarketabilityRolloutInput,
): MarketabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const marketabilityTableCoverageComplete =
    input.existingMarketabilityTableCount === CRITICAL_MARKETABILITY_TABLES.length

  const checks: MarketabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL marketability checks can reach the database.'
            : 'Production marketability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'marketability_signal_table_coverage',
      label: 'Marketability signal table coverage',
      status: marketabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Marketability signal table coverage is only enforced in production.'
          : marketabilityTableCoverageComplete
            ? `${input.existingMarketabilityTableCount}/${CRITICAL_MARKETABILITY_TABLES.length} marketability signal tables are present.`
            : `${input.existingMarketabilityTableCount}/${CRITICAL_MARKETABILITY_TABLES.length} marketability signal tables were found.`,
    },
    {
      name: 'membership_marketability',
      label: 'Membership marketability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership marketability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership marketability signals.'
            : 'Production marketability rollout requires a workspace_memberships table.',
    },
    {
      name: 'meter_usage_marketability',
      label: 'Meter usage marketability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage marketability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage marketability signals.'
            : 'Production marketability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'marketability_readiness_signal',
      label: 'Marketability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          marketabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Marketability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              marketabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists
            ? 'Workspace memberships, meter usage reports, and usage events support marketability readiness.'
            : 'Production marketability rollout requires PostgreSQL connectivity, marketability tables, membership marketability, meter usage marketability, and full signal coverage.',
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
        ? 'Production marketability rollout checks passed. Marketability coverage and marketability readiness signal signals are healthy.'
        : 'Production marketability rollout is not ready. Resolve failed checks before relying on production marketability tooling.',
  }
}
