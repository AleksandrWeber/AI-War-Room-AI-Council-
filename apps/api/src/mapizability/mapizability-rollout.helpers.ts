import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MAPIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type MapizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MapizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MapizabilityRolloutCheck[]
  guidance: string
}

export type MapizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMapizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateMapizabilityRollout(
  input: MapizabilityRolloutInput,
): MapizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const mapizabilityTableCoverageComplete =
    input.existingMapizabilityTableCount === CRITICAL_MAPIZABILITY_TABLES.length

  const checks: MapizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL mapizability checks can reach the database.'
            : 'Production mapizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'mapizability_signal_table_coverage',
      label: 'Mapizability signal table coverage',
      status: mapizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Mapizability signal table coverage is only enforced in production.'
          : mapizabilityTableCoverageComplete
            ? `${input.existingMapizabilityTableCount}/${CRITICAL_MAPIZABILITY_TABLES.length} mapizability signal tables are present.`
            : `${input.existingMapizabilityTableCount}/${CRITICAL_MAPIZABILITY_TABLES.length} mapizability signal tables were found.`,
    },
    {
      name: 'meter_usage_mapizability',
      label: 'Meter usage mapizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage mapizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage mapizability signals.'
            : 'Production mapizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_mapizability',
      label: 'Usage event mapizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event mapizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event mapizability signals.'
            : 'Production mapizability rollout requires a usage_events table.',
    },
    {
      name: 'mapization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          mapizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              mapizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support mapization readiness.'
            : 'Production mapizability rollout requires PostgreSQL connectivity, mapizability tables, meter usage mapizability, usage event mapizability, and full signal coverage.',
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
        ? 'Production mapizability rollout checks passed. Mapizability coverage and distributization readiness signal signals are healthy.'
        : 'Production mapizability rollout is not ready. Resolve failed checks before relying on production mapizability tooling.',
  }
}
