import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ANALOGIZABILITY_TABLES = [
  'usage_events',
  'billing_meter_usage_reports',
  'workspace_usage_limits',
] as const

export type AnalogizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AnalogizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AnalogizabilityRolloutCheck[]
  guidance: string
}

export type AnalogizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAnalogizabilityTableCount: number
  usageEventsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateAnalogizabilityRollout(
  input: AnalogizabilityRolloutInput,
): AnalogizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const analogizabilityTableCoverageComplete =
    input.existingAnalogizabilityTableCount === CRITICAL_ANALOGIZABILITY_TABLES.length

  const checks: AnalogizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL analogizability checks can reach the database.'
            : 'Production analogizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'analogizability_signal_table_coverage',
      label: 'Analogizability signal table coverage',
      status: analogizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Analogizability signal table coverage is only enforced in production.'
          : analogizabilityTableCoverageComplete
            ? `${input.existingAnalogizabilityTableCount}/${CRITICAL_ANALOGIZABILITY_TABLES.length} analogizability signal tables are present.`
            : `${input.existingAnalogizabilityTableCount}/${CRITICAL_ANALOGIZABILITY_TABLES.length} analogizability signal tables were found.`,
    },
    {
      name: 'usage_event_analogizability',
      label: 'Usage event analogizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event analogizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event analogizability signals.'
            : 'Production analogizability rollout requires a usage_events table.',
    },
    {
      name: 'meter_usage_analogizability',
      label: 'Meter usage analogizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage analogizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage analogizability signals.'
            : 'Production analogizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'analogization_readiness_signal',
      label: 'Analogization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          analogizabilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.billingMeterUsageReportsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Analogization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              analogizabilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.billingMeterUsageReportsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Usage events, meter usage reports, and workspace usage limits support analogization readiness.'
            : 'Production analogizability rollout requires PostgreSQL connectivity, analogizability tables, usage event analogizability, meter usage analogizability, and full signal coverage.',
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
        ? 'Production analogizability rollout checks passed. Analogizability coverage and analogization readiness signal signals are healthy.'
        : 'Production analogizability rollout is not ready. Resolve failed checks before relying on production analogizability tooling.',
  }
}
