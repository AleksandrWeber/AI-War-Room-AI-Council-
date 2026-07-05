import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RESTOREIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type RestoreizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RestoreizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RestoreizabilityRolloutCheck[]
  guidance: string
}

export type RestoreizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRestoreizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateRestoreizabilityRollout(
  input: RestoreizabilityRolloutInput,
): RestoreizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const restoreizabilityTableCoverageComplete =
    input.existingRestoreizabilityTableCount === CRITICAL_RESTOREIZABILITY_TABLES.length

  const checks: RestoreizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL restoreizability checks can reach the database.'
            : 'Production restoreizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'restoreizability_signal_table_coverage',
      label: 'Restoreizability signal table coverage',
      status: restoreizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Restoreizability signal table coverage is only enforced in production.'
          : restoreizabilityTableCoverageComplete
            ? `${input.existingRestoreizabilityTableCount}/${CRITICAL_RESTOREIZABILITY_TABLES.length} restoreizability signal tables are present.`
            : `${input.existingRestoreizabilityTableCount}/${CRITICAL_RESTOREIZABILITY_TABLES.length} restoreizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_restoreizability',
      label: 'Billing webhook restoreizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook restoreizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook restoreizability signals.'
            : 'Production restoreizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_restoreizability',
      label: 'Billing record restoreizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record restoreizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record restoreizability signals.'
            : 'Production restoreizability rollout requires a billing_records table.',
    },
    {
      name: 'restorization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          restoreizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              restoreizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production restoreizability rollout requires PostgreSQL connectivity, restoreizability tables, billing webhook restoreizability, billing record restoreizability, and full signal coverage.',
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
        ? 'Production restoreizability rollout checks passed. Restoreizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production restoreizability rollout is not ready. Resolve failed checks before relying on production restoreizability tooling.',
  }
}
