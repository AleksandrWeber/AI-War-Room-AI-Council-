import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ROLLBACKABILIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type RollbackabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RollbackabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RollbackabilizabilityRolloutCheck[]
  guidance: string
}

export type RollbackabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRollbackabilizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateRollbackabilizabilityRollout(
  input: RollbackabilizabilityRolloutInput,
): RollbackabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const rollbackabilizabilityTableCoverageComplete =
    input.existingRollbackabilizabilityTableCount === CRITICAL_ROLLBACKABILIZABILITY_TABLES.length

  const checks: RollbackabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL rollbackabilizability checks can reach the database.'
            : 'Production rollbackabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'rollbackabilizability_signal_table_coverage',
      label: 'Rollbackabilizability signal table coverage',
      status: rollbackabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Rollbackabilizability signal table coverage is only enforced in production.'
          : rollbackabilizabilityTableCoverageComplete
            ? `${input.existingRollbackabilizabilityTableCount}/${CRITICAL_ROLLBACKABILIZABILITY_TABLES.length} rollbackabilizability signal tables are present.`
            : `${input.existingRollbackabilizabilityTableCount}/${CRITICAL_ROLLBACKABILIZABILITY_TABLES.length} rollbackabilizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_rollbackabilizability',
      label: 'Billing webhook rollbackabilizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook rollbackabilizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook rollbackabilizability signals.'
            : 'Production rollbackabilizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_rollbackabilizability',
      label: 'Billing record rollbackabilizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record rollbackabilizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record rollbackabilizability signals.'
            : 'Production rollbackabilizability rollout requires a billing_records table.',
    },
    {
      name: 'rollbackabilization_readiness_signal',
      label: 'Rollbackabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          rollbackabilizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Rollbackabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              rollbackabilizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production rollbackabilizability rollout requires PostgreSQL connectivity, rollbackabilizability tables, billing webhook rollbackabilizability, billing record rollbackabilizability, and full signal coverage.',
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
        ? 'Production rollbackabilizability rollout checks passed. Rollbackabilizability coverage and rollbackabilization readiness signal signals are healthy.'
        : 'Production rollbackabilizability rollout is not ready. Resolve failed checks before relying on production rollbackabilizability tooling.',
  }
}
