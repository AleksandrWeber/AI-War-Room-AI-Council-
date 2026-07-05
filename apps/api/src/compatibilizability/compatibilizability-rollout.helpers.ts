import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPATIBILIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type CompatibilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompatibilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompatibilizabilityRolloutCheck[]
  guidance: string
}

export type CompatibilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompatibilizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateCompatibilizabilityRollout(
  input: CompatibilizabilityRolloutInput,
): CompatibilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compatibilizabilityTableCoverageComplete =
    input.existingCompatibilizabilityTableCount === CRITICAL_COMPATIBILIZABILITY_TABLES.length

  const checks: CompatibilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compatibilizability checks can reach the database.'
            : 'Production compatibilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compatibilizability_signal_table_coverage',
      label: 'Compatibilizability signal table coverage',
      status: compatibilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compatibilizability signal table coverage is only enforced in production.'
          : compatibilizabilityTableCoverageComplete
            ? `${input.existingCompatibilizabilityTableCount}/${CRITICAL_COMPATIBILIZABILITY_TABLES.length} compatibilizability signal tables are present.`
            : `${input.existingCompatibilizabilityTableCount}/${CRITICAL_COMPATIBILIZABILITY_TABLES.length} compatibilizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_compatibilizability',
      label: 'Billing webhook compatibilizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook compatibilizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook compatibilizability signals.'
            : 'Production compatibilizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_compatibilizability',
      label: 'Billing record compatibilizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record compatibilizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record compatibilizability signals.'
            : 'Production compatibilizability rollout requires a billing_records table.',
    },
    {
      name: 'compatibilization_readiness_signal',
      label: 'Compatibilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compatibilizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Compatibilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compatibilizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production compatibilizability rollout requires PostgreSQL connectivity, compatibilizability tables, billing webhook compatibilizability, billing record compatibilizability, and full signal coverage.',
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
        ? 'Production compatibilizability rollout checks passed. Compatibilizability coverage and compatibilization readiness signal signals are healthy.'
        : 'Production compatibilizability rollout is not ready. Resolve failed checks before relying on production compatibilizability tooling.',
  }
}
