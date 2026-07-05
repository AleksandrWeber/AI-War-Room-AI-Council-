import type { ApiEnv } from '../config/env.js'

export const CRITICAL_UNICASTIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type UnicastizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type UnicastizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: UnicastizabilityRolloutCheck[]
  guidance: string
}

export type UnicastizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingUnicastizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateUnicastizabilityRollout(
  input: UnicastizabilityRolloutInput,
): UnicastizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const unicastizabilityTableCoverageComplete =
    input.existingUnicastizabilityTableCount === CRITICAL_UNICASTIZABILITY_TABLES.length

  const checks: UnicastizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL unicastizability checks can reach the database.'
            : 'Production unicastizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'unicastizability_signal_table_coverage',
      label: 'Unicastizability signal table coverage',
      status: unicastizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Unicastizability signal table coverage is only enforced in production.'
          : unicastizabilityTableCoverageComplete
            ? `${input.existingUnicastizabilityTableCount}/${CRITICAL_UNICASTIZABILITY_TABLES.length} unicastizability signal tables are present.`
            : `${input.existingUnicastizabilityTableCount}/${CRITICAL_UNICASTIZABILITY_TABLES.length} unicastizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_unicastizability',
      label: 'Billing webhook unicastizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook unicastizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook unicastizability signals.'
            : 'Production unicastizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_unicastizability',
      label: 'Billing record unicastizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record unicastizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record unicastizability signals.'
            : 'Production unicastizability rollout requires a billing_records table.',
    },
    {
      name: 'unicastization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          unicastizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              unicastizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production unicastizability rollout requires PostgreSQL connectivity, unicastizability tables, billing webhook unicastizability, billing record unicastizability, and full signal coverage.',
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
        ? 'Production unicastizability rollout checks passed. Unicastizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production unicastizability rollout is not ready. Resolve failed checks before relying on production unicastizability tooling.',
  }
}
