import type { ApiEnv } from '../config/env.js'

export const CRITICAL_GENERALIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type GeneralizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type GeneralizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: GeneralizabilityRolloutCheck[]
  guidance: string
}

export type GeneralizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingGeneralizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateGeneralizabilityRollout(
  input: GeneralizabilityRolloutInput,
): GeneralizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const generalizabilityTableCoverageComplete =
    input.existingGeneralizabilityTableCount === CRITICAL_GENERALIZABILITY_TABLES.length

  const checks: GeneralizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL generalizability checks can reach the database.'
            : 'Production generalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'generalizability_signal_table_coverage',
      label: 'Generalizability signal table coverage',
      status: generalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Generalizability signal table coverage is only enforced in production.'
          : generalizabilityTableCoverageComplete
            ? `${input.existingGeneralizabilityTableCount}/${CRITICAL_GENERALIZABILITY_TABLES.length} generalizability signal tables are present.`
            : `${input.existingGeneralizabilityTableCount}/${CRITICAL_GENERALIZABILITY_TABLES.length} generalizability signal tables were found.`,
    },
    {
      name: 'meter_usage_generalizability',
      label: 'Meter usage generalizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage generalizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage generalizability signals.'
            : 'Production generalizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_generalizability',
      label: 'Usage event generalizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event generalizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event generalizability signals.'
            : 'Production generalizability rollout requires a usage_events table.',
    },
    {
      name: 'generalization_readiness_signal',
      label: 'Generalization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          generalizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Generalization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              generalizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support generalization readiness.'
            : 'Production generalizability rollout requires PostgreSQL connectivity, generalizability tables, meter usage generalizability, usage event generalizability, and full signal coverage.',
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
        ? 'Production generalizability rollout checks passed. Generalizability coverage and generalization readiness signal signals are healthy.'
        : 'Production generalizability rollout is not ready. Resolve failed checks before relying on production generalizability tooling.',
  }
}
