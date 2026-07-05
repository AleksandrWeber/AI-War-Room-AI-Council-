import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NCOMPACTIONIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type NcompactionizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NcompactionizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NcompactionizabilityRolloutCheck[]
  guidance: string
}

export type NcompactionizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNcompactionizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateNcompactionizabilityRollout(
  input: NcompactionizabilityRolloutInput,
): NcompactionizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const ncompactionizabilityTableCoverageComplete =
    input.existingNcompactionizabilityTableCount === CRITICAL_NCOMPACTIONIZABILITY_TABLES.length

  const checks: NcompactionizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL ncompactionizability checks can reach the database.'
            : 'Production ncompactionizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'ncompactionizability_signal_table_coverage',
      label: 'Ncompactionizability signal table coverage',
      status: ncompactionizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Ncompactionizability signal table coverage is only enforced in production.'
          : ncompactionizabilityTableCoverageComplete
            ? `${input.existingNcompactionizabilityTableCount}/${CRITICAL_NCOMPACTIONIZABILITY_TABLES.length} ncompactionizability signal tables are present.`
            : `${input.existingNcompactionizabilityTableCount}/${CRITICAL_NCOMPACTIONIZABILITY_TABLES.length} ncompactionizability signal tables were found.`,
    },
    {
      name: 'meter_usage_ncompactionizability',
      label: 'Meter usage ncompactionizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage ncompactionizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage ncompactionizability signals.'
            : 'Production ncompactionizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_ncompactionizability',
      label: 'Usage event ncompactionizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event ncompactionizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event ncompactionizability signals.'
            : 'Production ncompactionizability rollout requires a usage_events table.',
    },
    {
      name: 'ncompactionization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          ncompactionizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              ncompactionizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support ncompactionization readiness.'
            : 'Production ncompactionizability rollout requires PostgreSQL connectivity, ncompactionizability tables, meter usage ncompactionizability, usage event ncompactionizability, and full signal coverage.',
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
        ? 'Production ncompactionizability rollout checks passed. Ncompactionizability coverage and distributization readiness signal signals are healthy.'
        : 'Production ncompactionizability rollout is not ready. Resolve failed checks before relying on production ncompactionizability tooling.',
  }
}
