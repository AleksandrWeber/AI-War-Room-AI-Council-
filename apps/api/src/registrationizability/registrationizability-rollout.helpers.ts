import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REGISTRATIONIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type RegistrationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RegistrationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RegistrationizabilityRolloutCheck[]
  guidance: string
}

export type RegistrationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRegistrationizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateRegistrationizabilityRollout(
  input: RegistrationizabilityRolloutInput,
): RegistrationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const registrationizabilityTableCoverageComplete =
    input.existingRegistrationizabilityTableCount === CRITICAL_REGISTRATIONIZABILITY_TABLES.length

  const checks: RegistrationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL registrationizability checks can reach the database.'
            : 'Production registrationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'registrationizability_signal_table_coverage',
      label: 'Registrationizability signal table coverage',
      status: registrationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Registrationizability signal table coverage is only enforced in production.'
          : registrationizabilityTableCoverageComplete
            ? `${input.existingRegistrationizabilityTableCount}/${CRITICAL_REGISTRATIONIZABILITY_TABLES.length} registrationizability signal tables are present.`
            : `${input.existingRegistrationizabilityTableCount}/${CRITICAL_REGISTRATIONIZABILITY_TABLES.length} registrationizability signal tables were found.`,
    },
    {
      name: 'meter_usage_registrationizability',
      label: 'Meter usage registrationizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage registrationizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage registrationizability signals.'
            : 'Production registrationizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_registrationizability',
      label: 'Usage event registrationizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event registrationizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event registrationizability signals.'
            : 'Production registrationizability rollout requires a usage_events table.',
    },
    {
      name: 'registrationization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          registrationizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              registrationizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support registrationization readiness.'
            : 'Production registrationizability rollout requires PostgreSQL connectivity, registrationizability tables, meter usage registrationizability, usage event registrationizability, and full signal coverage.',
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
        ? 'Production registrationizability rollout checks passed. Registrationizability coverage and distributization readiness signal signals are healthy.'
        : 'Production registrationizability rollout is not ready. Resolve failed checks before relying on production registrationizability tooling.',
  }
}
