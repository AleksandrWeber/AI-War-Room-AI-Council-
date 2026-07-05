import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTEROPERABILIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type InteroperabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InteroperabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InteroperabilizabilityRolloutCheck[]
  guidance: string
}

export type InteroperabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInteroperabilizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateInteroperabilizabilityRollout(
  input: InteroperabilizabilityRolloutInput,
): InteroperabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const interoperabilizabilityTableCoverageComplete =
    input.existingInteroperabilizabilityTableCount === CRITICAL_INTEROPERABILIZABILITY_TABLES.length

  const checks: InteroperabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL interoperabilizability checks can reach the database.'
            : 'Production interoperabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'interoperabilizability_signal_table_coverage',
      label: 'Interoperabilizability signal table coverage',
      status: interoperabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Interoperabilizability signal table coverage is only enforced in production.'
          : interoperabilizabilityTableCoverageComplete
            ? `${input.existingInteroperabilizabilityTableCount}/${CRITICAL_INTEROPERABILIZABILITY_TABLES.length} interoperabilizability signal tables are present.`
            : `${input.existingInteroperabilizabilityTableCount}/${CRITICAL_INTEROPERABILIZABILITY_TABLES.length} interoperabilizability signal tables were found.`,
    },
    {
      name: 'meter_usage_interoperabilizability',
      label: 'Meter usage interoperabilizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage interoperabilizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage interoperabilizability signals.'
            : 'Production interoperabilizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_interoperabilizability',
      label: 'Usage event interoperabilizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event interoperabilizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event interoperabilizability signals.'
            : 'Production interoperabilizability rollout requires a usage_events table.',
    },
    {
      name: 'interoperabilization_readiness_signal',
      label: 'Interoperabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          interoperabilizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Interoperabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              interoperabilizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support interoperabilization readiness.'
            : 'Production interoperabilizability rollout requires PostgreSQL connectivity, interoperabilizability tables, meter usage interoperabilizability, usage event interoperabilizability, and full signal coverage.',
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
        ? 'Production interoperabilizability rollout checks passed. Interoperabilizability coverage and interoperabilization readiness signal signals are healthy.'
        : 'Production interoperabilizability rollout is not ready. Resolve failed checks before relying on production interoperabilizability tooling.',
  }
}
