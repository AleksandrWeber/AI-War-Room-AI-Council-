import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NACKIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type NackizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NackizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NackizabilityRolloutCheck[]
  guidance: string
}

export type NackizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNackizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateNackizabilityRollout(
  input: NackizabilityRolloutInput,
): NackizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const nackizabilityTableCoverageComplete =
    input.existingNackizabilityTableCount === CRITICAL_NACKIZABILITY_TABLES.length

  const checks: NackizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL nackizability checks can reach the database.'
            : 'Production nackizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'nackizability_signal_table_coverage',
      label: 'Nackizability signal table coverage',
      status: nackizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Nackizability signal table coverage is only enforced in production.'
          : nackizabilityTableCoverageComplete
            ? `${input.existingNackizabilityTableCount}/${CRITICAL_NACKIZABILITY_TABLES.length} nackizability signal tables are present.`
            : `${input.existingNackizabilityTableCount}/${CRITICAL_NACKIZABILITY_TABLES.length} nackizability signal tables were found.`,
    },
    {
      name: 'meter_usage_nackizability',
      label: 'Meter usage nackizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage nackizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage nackizability signals.'
            : 'Production nackizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_nackizability',
      label: 'Usage event nackizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event nackizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event nackizability signals.'
            : 'Production nackizability rollout requires a usage_events table.',
    },
    {
      name: 'nackization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          nackizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              nackizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support nackization readiness.'
            : 'Production nackizability rollout requires PostgreSQL connectivity, nackizability tables, meter usage nackizability, usage event nackizability, and full signal coverage.',
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
        ? 'Production nackizability rollout checks passed. Nackizability coverage and distributization readiness signal signals are healthy.'
        : 'Production nackizability rollout is not ready. Resolve failed checks before relying on production nackizability tooling.',
  }
}
