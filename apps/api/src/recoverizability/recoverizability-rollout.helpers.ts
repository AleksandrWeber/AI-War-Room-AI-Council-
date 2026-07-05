import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RECOVERIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type RecoverizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RecoverizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RecoverizabilityRolloutCheck[]
  guidance: string
}

export type RecoverizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRecoverizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateRecoverizabilityRollout(
  input: RecoverizabilityRolloutInput,
): RecoverizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const recoverizabilityTableCoverageComplete =
    input.existingRecoverizabilityTableCount === CRITICAL_RECOVERIZABILITY_TABLES.length

  const checks: RecoverizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL recoverizability checks can reach the database.'
            : 'Production recoverizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'recoverizability_signal_table_coverage',
      label: 'Recoverizability signal table coverage',
      status: recoverizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Recoverizability signal table coverage is only enforced in production.'
          : recoverizabilityTableCoverageComplete
            ? `${input.existingRecoverizabilityTableCount}/${CRITICAL_RECOVERIZABILITY_TABLES.length} recoverizability signal tables are present.`
            : `${input.existingRecoverizabilityTableCount}/${CRITICAL_RECOVERIZABILITY_TABLES.length} recoverizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_recoverizability',
      label: 'Billing webhook recoverizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook recoverizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook recoverizability signals.'
            : 'Production recoverizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_recoverizability',
      label: 'Billing record recoverizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record recoverizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record recoverizability signals.'
            : 'Production recoverizability rollout requires a billing_records table.',
    },
    {
      name: 'recoverization_readiness_signal',
      label: 'Recoverization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          recoverizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Recoverization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              recoverizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production recoverizability rollout requires PostgreSQL connectivity, recoverizability tables, billing webhook recoverizability, billing record recoverizability, and full signal coverage.',
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
        ? 'Production recoverizability rollout checks passed. Recoverizability coverage and recoverization readiness signal signals are healthy.'
        : 'Production recoverizability rollout is not ready. Resolve failed checks before relying on production recoverizability tooling.',
  }
}
