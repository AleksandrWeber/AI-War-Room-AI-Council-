import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SUBSCRIBIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type SubscribizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SubscribizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SubscribizabilityRolloutCheck[]
  guidance: string
}

export type SubscribizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSubscribizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateSubscribizabilityRollout(
  input: SubscribizabilityRolloutInput,
): SubscribizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const subscribizabilityTableCoverageComplete =
    input.existingSubscribizabilityTableCount === CRITICAL_SUBSCRIBIZABILITY_TABLES.length

  const checks: SubscribizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL subscribizability checks can reach the database.'
            : 'Production subscribizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'subscribizability_signal_table_coverage',
      label: 'Subscribizability signal table coverage',
      status: subscribizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Subscribizability signal table coverage is only enforced in production.'
          : subscribizabilityTableCoverageComplete
            ? `${input.existingSubscribizabilityTableCount}/${CRITICAL_SUBSCRIBIZABILITY_TABLES.length} subscribizability signal tables are present.`
            : `${input.existingSubscribizabilityTableCount}/${CRITICAL_SUBSCRIBIZABILITY_TABLES.length} subscribizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_subscribizability',
      label: 'Billing webhook subscribizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook subscribizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook subscribizability signals.'
            : 'Production subscribizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_subscribizability',
      label: 'Billing record subscribizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record subscribizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record subscribizability signals.'
            : 'Production subscribizability rollout requires a billing_records table.',
    },
    {
      name: 'subscribization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          subscribizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              subscribizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production subscribizability rollout requires PostgreSQL connectivity, subscribizability tables, billing webhook subscribizability, billing record subscribizability, and full signal coverage.',
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
        ? 'Production subscribizability rollout checks passed. Subscribizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production subscribizability rollout is not ready. Resolve failed checks before relying on production subscribizability tooling.',
  }
}
