import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SYNTACTICIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type SyntacticizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SyntacticizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SyntacticizabilityRolloutCheck[]
  guidance: string
}

export type SyntacticizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSyntacticizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateSyntacticizabilityRollout(
  input: SyntacticizabilityRolloutInput,
): SyntacticizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const syntacticizabilityTableCoverageComplete =
    input.existingSyntacticizabilityTableCount === CRITICAL_SYNTACTICIZABILITY_TABLES.length

  const checks: SyntacticizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL syntacticizability checks can reach the database.'
            : 'Production syntacticizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'syntacticizability_signal_table_coverage',
      label: 'Syntacticizability signal table coverage',
      status: syntacticizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Syntacticizability signal table coverage is only enforced in production.'
          : syntacticizabilityTableCoverageComplete
            ? `${input.existingSyntacticizabilityTableCount}/${CRITICAL_SYNTACTICIZABILITY_TABLES.length} syntacticizability signal tables are present.`
            : `${input.existingSyntacticizabilityTableCount}/${CRITICAL_SYNTACTICIZABILITY_TABLES.length} syntacticizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_syntacticizability',
      label: 'Billing webhook syntacticizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook syntacticizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook syntacticizability signals.'
            : 'Production syntacticizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_syntacticizability',
      label: 'Billing record syntacticizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record syntacticizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record syntacticizability signals.'
            : 'Production syntacticizability rollout requires a billing_records table.',
    },
    {
      name: 'syntacticization_readiness_signal',
      label: 'Syntacticization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          syntacticizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Syntacticization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              syntacticizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support syntacticization readiness.'
            : 'Production syntacticizability rollout requires PostgreSQL connectivity, syntacticizability tables, billing webhook syntacticizability, billing record syntacticizability, and full signal coverage.',
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
        ? 'Production syntacticizability rollout checks passed. Syntacticizability coverage and syntacticization readiness signal signals are healthy.'
        : 'Production syntacticizability rollout is not ready. Resolve failed checks before relying on production syntacticizability tooling.',
  }
}
