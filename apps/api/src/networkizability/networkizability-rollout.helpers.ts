import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NETWORKIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type NetworkizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NetworkizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NetworkizabilityRolloutCheck[]
  guidance: string
}

export type NetworkizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNetworkizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateNetworkizabilityRollout(
  input: NetworkizabilityRolloutInput,
): NetworkizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const networkizabilityTableCoverageComplete =
    input.existingNetworkizabilityTableCount === CRITICAL_NETWORKIZABILITY_TABLES.length

  const checks: NetworkizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL networkizability checks can reach the database.'
            : 'Production networkizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'networkizability_signal_table_coverage',
      label: 'Networkizability signal table coverage',
      status: networkizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Networkizability signal table coverage is only enforced in production.'
          : networkizabilityTableCoverageComplete
            ? `${input.existingNetworkizabilityTableCount}/${CRITICAL_NETWORKIZABILITY_TABLES.length} networkizability signal tables are present.`
            : `${input.existingNetworkizabilityTableCount}/${CRITICAL_NETWORKIZABILITY_TABLES.length} networkizability signal tables were found.`,
    },
    {
      name: 'meter_usage_networkizability',
      label: 'Meter usage networkizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage networkizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage networkizability signals.'
            : 'Production networkizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_networkizability',
      label: 'Usage event networkizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event networkizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event networkizability signals.'
            : 'Production networkizability rollout requires a usage_events table.',
    },
    {
      name: 'networkization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          networkizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              networkizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support networkization readiness.'
            : 'Production networkizability rollout requires PostgreSQL connectivity, networkizability tables, meter usage networkizability, usage event networkizability, and full signal coverage.',
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
        ? 'Production networkizability rollout checks passed. Networkizability coverage and distributization readiness signal signals are healthy.'
        : 'Production networkizability rollout is not ready. Resolve failed checks before relying on production networkizability tooling.',
  }
}
