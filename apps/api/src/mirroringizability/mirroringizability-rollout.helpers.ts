import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MIRRORINGIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type MirroringizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MirroringizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MirroringizabilityRolloutCheck[]
  guidance: string
}

export type MirroringizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMirroringizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateMirroringizabilityRollout(
  input: MirroringizabilityRolloutInput,
): MirroringizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const mirroringizabilityTableCoverageComplete =
    input.existingMirroringizabilityTableCount === CRITICAL_MIRRORINGIZABILITY_TABLES.length

  const checks: MirroringizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL mirroringizability checks can reach the database.'
            : 'Production mirroringizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'mirroringizability_signal_table_coverage',
      label: 'Mirroringizability signal table coverage',
      status: mirroringizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Mirroringizability signal table coverage is only enforced in production.'
          : mirroringizabilityTableCoverageComplete
            ? `${input.existingMirroringizabilityTableCount}/${CRITICAL_MIRRORINGIZABILITY_TABLES.length} mirroringizability signal tables are present.`
            : `${input.existingMirroringizabilityTableCount}/${CRITICAL_MIRRORINGIZABILITY_TABLES.length} mirroringizability signal tables were found.`,
    },
    {
      name: 'meter_usage_mirroringizability',
      label: 'Meter usage mirroringizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage mirroringizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage mirroringizability signals.'
            : 'Production mirroringizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_mirroringizability',
      label: 'Usage event mirroringizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event mirroringizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event mirroringizability signals.'
            : 'Production mirroringizability rollout requires a usage_events table.',
    },
    {
      name: 'mirroringization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          mirroringizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              mirroringizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support mirroringization readiness.'
            : 'Production mirroringizability rollout requires PostgreSQL connectivity, mirroringizability tables, meter usage mirroringizability, usage event mirroringizability, and full signal coverage.',
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
        ? 'Production mirroringizability rollout checks passed. Mirroringizability coverage and distributization readiness signal signals are healthy.'
        : 'Production mirroringizability rollout is not ready. Resolve failed checks before relying on production mirroringizability tooling.',
  }
}
