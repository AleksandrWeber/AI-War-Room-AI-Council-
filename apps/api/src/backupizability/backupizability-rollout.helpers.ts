import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BACKUPIZABILITY_TABLES = [
  'billing_meter_usage_reports',
  'usage_events',
  'workspace_usage_limits',
] as const

export type BackupizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BackupizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BackupizabilityRolloutCheck[]
  guidance: string
}

export type BackupizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBackupizabilityTableCount: number
  billingMeterUsageReportsTableExists: boolean
  usageEventsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateBackupizabilityRollout(
  input: BackupizabilityRolloutInput,
): BackupizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const backupizabilityTableCoverageComplete =
    input.existingBackupizabilityTableCount === CRITICAL_BACKUPIZABILITY_TABLES.length

  const checks: BackupizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL backupizability checks can reach the database.'
            : 'Production backupizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'backupizability_signal_table_coverage',
      label: 'Backupizability signal table coverage',
      status: backupizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Backupizability signal table coverage is only enforced in production.'
          : backupizabilityTableCoverageComplete
            ? `${input.existingBackupizabilityTableCount}/${CRITICAL_BACKUPIZABILITY_TABLES.length} backupizability signal tables are present.`
            : `${input.existingBackupizabilityTableCount}/${CRITICAL_BACKUPIZABILITY_TABLES.length} backupizability signal tables were found.`,
    },
    {
      name: 'meter_usage_backupizability',
      label: 'Meter usage backupizability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage backupizability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage backupizability signals.'
            : 'Production backupizability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'usage_event_backupizability',
      label: 'Usage event backupizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event backupizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event backupizability signals.'
            : 'Production backupizability rollout requires a usage_events table.',
    },
    {
      name: 'backupization_readiness_signal',
      label: 'Distributization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          backupizabilityTableCoverageComplete &&
          input.billingMeterUsageReportsTableExists &&
          input.usageEventsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Distributization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              backupizabilityTableCoverageComplete &&
              input.billingMeterUsageReportsTableExists &&
              input.usageEventsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing meter usage reports, usage events, and workspace usage limits support backupization readiness.'
            : 'Production backupizability rollout requires PostgreSQL connectivity, backupizability tables, meter usage backupizability, usage event backupizability, and full signal coverage.',
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
        ? 'Production backupizability rollout checks passed. Backupizability coverage and distributization readiness signal signals are healthy.'
        : 'Production backupizability rollout is not ready. Resolve failed checks before relying on production backupizability tooling.',
  }
}
