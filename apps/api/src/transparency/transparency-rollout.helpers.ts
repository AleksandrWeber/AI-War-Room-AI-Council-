import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRANSPARENCY_TABLES = [
  'run_workflows',
  'billing_notifications',
  'billing_meter_usage_reports',
] as const

export type TransparencyRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TransparencyRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TransparencyRolloutCheck[]
  guidance: string
}

export type TransparencyRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTransparencyTableCount: number
  runWorkflowsTableExists: boolean
  billingNotificationsTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
}

export function evaluateTransparencyRollout(
  input: TransparencyRolloutInput,
): TransparencyRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const transparencyTableCoverageComplete =
    input.existingTransparencyTableCount === CRITICAL_TRANSPARENCY_TABLES.length

  const checks: TransparencyRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL transparency checks can reach the database.'
            : 'Production transparency rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'transparency_signal_table_coverage',
      label: 'Transparency signal table coverage',
      status:
        transparencyTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Transparency signal table coverage is only enforced in production.'
          : transparencyTableCoverageComplete
            ? `${input.existingTransparencyTableCount}/${CRITICAL_TRANSPARENCY_TABLES.length} transparency signal tables are present.`
            : `${input.existingTransparencyTableCount}/${CRITICAL_TRANSPARENCY_TABLES.length} transparency signal tables were found.`,
    },
    {
      name: 'workflow_transparency',
      label: 'Workflow transparency',
      status: input.runWorkflowsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workflow transparency is only enforced in production.'
          : input.runWorkflowsTableExists
            ? 'run_workflows table is available for workflow transparency signals.'
            : 'Production transparency rollout requires a run_workflows table.',
    },
    {
      name: 'billing_transparency',
      label: 'Billing transparency',
      status:
        input.billingNotificationsTableExists || !isProduction
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Billing transparency is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing transparency signals.'
            : 'Production transparency rollout requires a billing_notifications table.',
    },
    {
      name: 'disclosure_readiness_signal',
      label: 'Disclosure readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          transparencyTableCoverageComplete &&
          input.runWorkflowsTableExists &&
          input.billingNotificationsTableExists &&
          input.billingMeterUsageReportsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Disclosure readiness is only enforced in production.'
          : input.postgresConnectivity &&
              transparencyTableCoverageComplete &&
              input.runWorkflowsTableExists &&
              input.billingNotificationsTableExists &&
              input.billingMeterUsageReportsTableExists
            ? 'Run workflows, billing notifications, and meter usage reports support disclosure readiness.'
            : 'Production transparency rollout requires PostgreSQL connectivity, transparency tables, workflow transparency, billing transparency, and meter usage reporting coverage.',
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
        ? 'Production transparency rollout checks passed. Transparency coverage and disclosure readiness signals are healthy.'
        : 'Production transparency rollout is not ready. Resolve failed checks before relying on production transparency tooling.',
  }
}
