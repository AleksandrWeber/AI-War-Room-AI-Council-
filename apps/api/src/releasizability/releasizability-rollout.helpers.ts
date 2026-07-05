import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RELEASIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type ReleasizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReleasizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReleasizabilityRolloutCheck[]
  guidance: string
}

export type ReleasizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReleasizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateReleasizabilityRollout(
  input: ReleasizabilityRolloutInput,
): ReleasizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const releasizabilityTableCoverageComplete =
    input.existingReleasizabilityTableCount === CRITICAL_RELEASIZABILITY_TABLES.length

  const checks: ReleasizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL releasizability checks can reach the database.'
            : 'Production releasizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'releasizability_signal_table_coverage',
      label: 'Releasizability signal table coverage',
      status: releasizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Releasizability signal table coverage is only enforced in production.'
          : releasizabilityTableCoverageComplete
            ? `${input.existingReleasizabilityTableCount}/${CRITICAL_RELEASIZABILITY_TABLES.length} releasizability signal tables are present.`
            : `${input.existingReleasizabilityTableCount}/${CRITICAL_RELEASIZABILITY_TABLES.length} releasizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_releasizability',
      label: 'Billing webhook releasizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook releasizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook releasizability signals.'
            : 'Production releasizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_releasizability',
      label: 'Billing record releasizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record releasizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record releasizability signals.'
            : 'Production releasizability rollout requires a billing_records table.',
    },
    {
      name: 'releasization_readiness_signal',
      label: 'Releasization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          releasizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Releasization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              releasizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production releasizability rollout requires PostgreSQL connectivity, releasizability tables, billing webhook releasizability, billing record releasizability, and full signal coverage.',
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
        ? 'Production releasizability rollout checks passed. Releasizability coverage and releasization readiness signal signals are healthy.'
        : 'Production releasizability rollout is not ready. Resolve failed checks before relying on production releasizability tooling.',
  }
}
