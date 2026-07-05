import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HIERARCHIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type HierarchizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HierarchizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HierarchizabilityRolloutCheck[]
  guidance: string
}

export type HierarchizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHierarchizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateHierarchizabilityRollout(
  input: HierarchizabilityRolloutInput,
): HierarchizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const hierarchizabilityTableCoverageComplete =
    input.existingHierarchizabilityTableCount === CRITICAL_HIERARCHIZABILITY_TABLES.length

  const checks: HierarchizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL hierarchizability checks can reach the database.'
            : 'Production hierarchizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'hierarchizability_signal_table_coverage',
      label: 'Hierarchizability signal table coverage',
      status: hierarchizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Hierarchizability signal table coverage is only enforced in production.'
          : hierarchizabilityTableCoverageComplete
            ? `${input.existingHierarchizabilityTableCount}/${CRITICAL_HIERARCHIZABILITY_TABLES.length} hierarchizability signal tables are present.`
            : `${input.existingHierarchizabilityTableCount}/${CRITICAL_HIERARCHIZABILITY_TABLES.length} hierarchizability signal tables were found.`,
    },
    {
      name: 'meter_usage_hierarchizability',
      label: 'Meter usage hierarchizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage hierarchizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage hierarchizability signals.'
            : 'Production hierarchizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_hierarchizability',
      label: 'Usage event hierarchizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event hierarchizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event hierarchizability signals.'
            : 'Production hierarchizability rollout requires a usage_events table.',
    },
    {
      name: 'hierarchization_readiness_signal',
      label: 'Hierarchization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          hierarchizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Hierarchization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              hierarchizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support hierarchization readiness.'
            : 'Production hierarchizability rollout requires PostgreSQL connectivity, hierarchizability tables, meter usage hierarchizability, usage event hierarchizability, and full signal coverage.',
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
        ? 'Production hierarchizability rollout checks passed. Hierarchizability coverage and hierarchization readiness signal signals are healthy.'
        : 'Production hierarchizability rollout is not ready. Resolve failed checks before relying on production hierarchizability tooling.',
  }
}
