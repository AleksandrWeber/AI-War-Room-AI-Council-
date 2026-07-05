import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONNOTABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type ConnotabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConnotabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConnotabilityRolloutCheck[]
  guidance: string
}

export type ConnotabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConnotabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateConnotabilityRollout(
  input: ConnotabilityRolloutInput,
): ConnotabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const connotabilityTableCoverageComplete =
    input.existingConnotabilityTableCount === CRITICAL_CONNOTABILITY_TABLES.length

  const checks: ConnotabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL connotability checks can reach the database.'
            : 'Production connotability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'connotability_signal_table_coverage',
      label: 'Connotability signal table coverage',
      status: connotabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Connotability signal table coverage is only enforced in production.'
          : connotabilityTableCoverageComplete
            ? `${input.existingConnotabilityTableCount}/${CRITICAL_CONNOTABILITY_TABLES.length} connotability signal tables are present.`
            : `${input.existingConnotabilityTableCount}/${CRITICAL_CONNOTABILITY_TABLES.length} connotability signal tables were found.`,
    },
    {
      name: 'meter_usage_connotability',
      label: 'Meter usage connotability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage connotability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage connotability signals.'
            : 'Production connotability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_connotability',
      label: 'Usage event connotability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event connotability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event connotability signals.'
            : 'Production connotability rollout requires a usage_events table.',
    },
    {
      name: 'connotation_readiness_signal',
      label: 'Connotation readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          connotabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Connotation readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              connotabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support connotation readiness.'
            : 'Production connotability rollout requires PostgreSQL connectivity, connotability tables, meter usage connotability, usage event connotability, and full signal coverage.',
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
        ? 'Production connotability rollout checks passed. Connotability coverage and connotation readiness signal signals are healthy.'
        : 'Production connotability rollout is not ready. Resolve failed checks before relying on production connotability tooling.',
  }
}
