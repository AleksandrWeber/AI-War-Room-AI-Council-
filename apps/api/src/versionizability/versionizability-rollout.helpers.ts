import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VERSIONIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type VersionizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type VersionizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: VersionizabilityRolloutCheck[]
  guidance: string
}

export type VersionizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingVersionizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateVersionizabilityRollout(
  input: VersionizabilityRolloutInput,
): VersionizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const versionizabilityTableCoverageComplete =
    input.existingVersionizabilityTableCount === CRITICAL_VERSIONIZABILITY_TABLES.length

  const checks: VersionizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL versionizability checks can reach the database.'
            : 'Production versionizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'versionizability_signal_table_coverage',
      label: 'Versionizability signal table coverage',
      status: versionizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Versionizability signal table coverage is only enforced in production.'
          : versionizabilityTableCoverageComplete
            ? `${input.existingVersionizabilityTableCount}/${CRITICAL_VERSIONIZABILITY_TABLES.length} versionizability signal tables are present.`
            : `${input.existingVersionizabilityTableCount}/${CRITICAL_VERSIONIZABILITY_TABLES.length} versionizability signal tables were found.`,
    },
    {
      name: 'meter_usage_versionizability',
      label: 'Meter usage versionizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage versionizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage versionizability signals.'
            : 'Production versionizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_versionizability',
      label: 'Usage event versionizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event versionizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event versionizability signals.'
            : 'Production versionizability rollout requires a usage_events table.',
    },
    {
      name: 'versionization_readiness_signal',
      label: 'Versionization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          versionizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Versionization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              versionizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support versionization readiness.'
            : 'Production versionizability rollout requires PostgreSQL connectivity, versionizability tables, meter usage versionizability, usage event versionizability, and full signal coverage.',
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
        ? 'Production versionizability rollout checks passed. Versionizability coverage and versionization readiness signal signals are healthy.'
        : 'Production versionizability rollout is not ready. Resolve failed checks before relying on production versionizability tooling.',
  }
}
