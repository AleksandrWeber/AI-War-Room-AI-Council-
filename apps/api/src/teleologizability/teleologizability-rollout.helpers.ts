import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TELEOLOGIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type TeleologizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TeleologizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TeleologizabilityRolloutCheck[]
  guidance: string
}

export type TeleologizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTeleologizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTeleologizabilityRollout(
  input: TeleologizabilityRolloutInput,
): TeleologizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const teleologizabilityTableCoverageComplete =
    input.existingTeleologizabilityTableCount === CRITICAL_TELEOLOGIZABILITY_TABLES.length

  const checks: TeleologizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL teleologizability checks can reach the database.'
            : 'Production teleologizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'teleologizability_signal_table_coverage',
      label: 'Teleologizability signal table coverage',
      status: teleologizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Teleologizability signal table coverage is only enforced in production.'
          : teleologizabilityTableCoverageComplete
            ? `${input.existingTeleologizabilityTableCount}/${CRITICAL_TELEOLOGIZABILITY_TABLES.length} teleologizability signal tables are present.`
            : `${input.existingTeleologizabilityTableCount}/${CRITICAL_TELEOLOGIZABILITY_TABLES.length} teleologizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_teleologizability',
      label: 'Billing webhook teleologizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook teleologizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook teleologizability signals.'
            : 'Production teleologizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_teleologizability',
      label: 'Billing record teleologizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record teleologizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record teleologizability signals.'
            : 'Production teleologizability rollout requires a billing_records table.',
    },
    {
      name: 'teleologization_readiness_signal',
      label: 'Teleologization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          teleologizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Teleologization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              teleologizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support teleologization readiness.'
            : 'Production teleologizability rollout requires PostgreSQL connectivity, teleologizability tables, billing webhook teleologizability, billing record teleologizability, and full signal coverage.',
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
        ? 'Production teleologizability rollout checks passed. Teleologizability coverage and teleologization readiness signal signals are healthy.'
        : 'Production teleologizability rollout is not ready. Resolve failed checks before relying on production teleologizability tooling.',
  }
}
