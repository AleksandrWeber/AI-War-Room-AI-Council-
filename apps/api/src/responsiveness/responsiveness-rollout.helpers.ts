import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RESPONSIVENESS_TABLES = [
  'usage_events',
  'billing_meter_usage_reports',
  'workspace_usage_limits',
] as const

export type ResponsivenessRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ResponsivenessRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ResponsivenessRolloutCheck[]
  guidance: string
}

export type ResponsivenessRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingResponsivenessTableCount: number
  usageEventsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateResponsivenessRollout(
  input: ResponsivenessRolloutInput,
): ResponsivenessRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const responsivenessTableCoverageComplete =
    input.existingResponsivenessTableCount === CRITICAL_RESPONSIVENESS_TABLES.length

  const checks: ResponsivenessRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL responsiveness checks can reach the database.'
            : 'Production responsiveness rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'responsiveness_signal_table_coverage',
      label: 'Responsiveness signal table coverage',
      status: responsivenessTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Responsiveness signal table coverage is only enforced in production.'
          : responsivenessTableCoverageComplete
            ? `${input.existingResponsivenessTableCount}/${CRITICAL_RESPONSIVENESS_TABLES.length} responsiveness signal tables are present.`
            : `${input.existingResponsivenessTableCount}/${CRITICAL_RESPONSIVENESS_TABLES.length} responsiveness signal tables were found.`,
    },
    {
      name: 'usage_event_responsiveness',
      label: 'Usage event responsiveness',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event responsiveness is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event responsiveness signals.'
            : 'Production responsiveness rollout requires a usage_events table.',
    },
    {
      name: 'meter_usage_responsiveness',
      label: 'Meter usage responsiveness',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage responsiveness is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage responsiveness signals.'
            : 'Production responsiveness rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'response_readiness_signal',
      label: 'Response readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          responsivenessTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.billingMeterUsageReportsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Response readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              responsivenessTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.billingMeterUsageReportsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Usage events, meter usage reports, and workspace usage limits support response readiness.'
            : 'Production responsiveness rollout requires PostgreSQL connectivity, responsiveness tables, usage event responsiveness, meter usage responsiveness, and full signal coverage.',
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
        ? 'Production responsiveness rollout checks passed. Responsiveness coverage and response readiness signal signals are healthy.'
        : 'Production responsiveness rollout is not ready. Resolve failed checks before relying on production responsiveness tooling.',
  }
}
