import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MONITORABILITY_TABLES = [
  'usage_events',
  'billing_records',
  'shield_scans',
] as const

export type MonitorabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MonitorabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MonitorabilityRolloutCheck[]
  guidance: string
}

export type MonitorabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMonitorabilityTableCount: number
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
  shieldScansTableExists: boolean
}

export function evaluateMonitorabilityRollout(
  input: MonitorabilityRolloutInput,
): MonitorabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const monitorabilityTableCoverageComplete =
    input.existingMonitorabilityTableCount === CRITICAL_MONITORABILITY_TABLES.length

  const checks: MonitorabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL monitorability checks can reach the database.'
            : 'Production monitorability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'monitorability_signal_table_coverage',
      label: 'Monitorability signal table coverage',
      status: monitorabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Monitorability signal table coverage is only enforced in production.'
          : monitorabilityTableCoverageComplete
            ? `${input.existingMonitorabilityTableCount}/${CRITICAL_MONITORABILITY_TABLES.length} monitorability signal tables are present.`
            : `${input.existingMonitorabilityTableCount}/${CRITICAL_MONITORABILITY_TABLES.length} monitorability signal tables were found.`,
    },
    {
      name: 'usage_event_monitorability',
      label: 'Usage event monitorability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event monitorability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event monitorability signals.'
            : 'Production monitorability rollout requires a usage_events table.',
    },
    {
      name: 'billing_record_monitorability',
      label: 'Billing record monitorability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record monitorability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record monitorability signals.'
            : 'Production monitorability rollout requires a billing_records table.',
    },
    {
      name: 'monitoring_readiness_signal',
      label: 'Monitoring readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          monitorabilityTableCoverageComplete &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists &&
          input.shieldScansTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Monitoring readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              monitorabilityTableCoverageComplete &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists &&
              input.shieldScansTableExists
            ? 'Usage events, billing records, and shield scans support monitoring readiness.'
            : 'Production monitorability rollout requires PostgreSQL connectivity, monitorability tables, usage event monitorability, billing record monitorability, and full signal coverage.',
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
        ? 'Production monitorability rollout checks passed. Monitorability coverage and monitoring readiness signal signals are healthy.'
        : 'Production monitorability rollout is not ready. Resolve failed checks before relying on production monitorability tooling.',
  }
}
