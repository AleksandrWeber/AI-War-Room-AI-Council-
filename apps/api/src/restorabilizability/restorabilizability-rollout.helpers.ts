import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RESTORABILIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type RestorabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RestorabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RestorabilizabilityRolloutCheck[]
  guidance: string
}

export type RestorabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRestorabilizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateRestorabilizabilityRollout(
  input: RestorabilizabilityRolloutInput,
): RestorabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const restorabilizabilityTableCoverageComplete =
    input.existingRestorabilizabilityTableCount === CRITICAL_RESTORABILIZABILITY_TABLES.length

  const checks: RestorabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL restorabilizability checks can reach the database.'
            : 'Production restorabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'restorabilizability_signal_table_coverage',
      label: 'Restorabilizability signal table coverage',
      status: restorabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Restorabilizability signal table coverage is only enforced in production.'
          : restorabilizabilityTableCoverageComplete
            ? `${input.existingRestorabilizabilityTableCount}/${CRITICAL_RESTORABILIZABILITY_TABLES.length} restorabilizability signal tables are present.`
            : `${input.existingRestorabilizabilityTableCount}/${CRITICAL_RESTORABILIZABILITY_TABLES.length} restorabilizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_restorabilizability',
      label: 'Billing webhook restorabilizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook restorabilizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook restorabilizability signals.'
            : 'Production restorabilizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_restorabilizability',
      label: 'Billing record restorabilizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record restorabilizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record restorabilizability signals.'
            : 'Production restorabilizability rollout requires a billing_records table.',
    },
    {
      name: 'restorabilization_readiness_signal',
      label: 'Restorabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          restorabilizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Restorabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              restorabilizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production restorabilizability rollout requires PostgreSQL connectivity, restorabilizability tables, billing webhook restorabilizability, billing record restorabilizability, and full signal coverage.',
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
        ? 'Production restorabilizability rollout checks passed. Restorabilizability coverage and restorabilization readiness signal signals are healthy.'
        : 'Production restorabilizability rollout is not ready. Resolve failed checks before relying on production restorabilizability tooling.',
  }
}
