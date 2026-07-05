import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SIGNIFIABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type SignifiabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SignifiabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SignifiabilityRolloutCheck[]
  guidance: string
}

export type SignifiabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSignifiabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateSignifiabilityRollout(
  input: SignifiabilityRolloutInput,
): SignifiabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const signifiabilityTableCoverageComplete =
    input.existingSignifiabilityTableCount === CRITICAL_SIGNIFIABILITY_TABLES.length

  const checks: SignifiabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL signifiability checks can reach the database.'
            : 'Production signifiability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'signifiability_signal_table_coverage',
      label: 'Signifiability signal table coverage',
      status: signifiabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Signifiability signal table coverage is only enforced in production.'
          : signifiabilityTableCoverageComplete
            ? `${input.existingSignifiabilityTableCount}/${CRITICAL_SIGNIFIABILITY_TABLES.length} signifiability signal tables are present.`
            : `${input.existingSignifiabilityTableCount}/${CRITICAL_SIGNIFIABILITY_TABLES.length} signifiability signal tables were found.`,
    },
    {
      name: 'billing_webhook_signifiability',
      label: 'Billing webhook signifiability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook signifiability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook signifiability signals.'
            : 'Production signifiability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_signifiability',
      label: 'Billing record signifiability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record signifiability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record signifiability signals.'
            : 'Production signifiability rollout requires a billing_records table.',
    },
    {
      name: 'signification_readiness_signal',
      label: 'Signification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          signifiabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Signification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              signifiabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support signification readiness.'
            : 'Production signifiability rollout requires PostgreSQL connectivity, signifiability tables, billing webhook signifiability, billing record signifiability, and full signal coverage.',
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
        ? 'Production signifiability rollout checks passed. Signifiability coverage and signification readiness signal signals are healthy.'
        : 'Production signifiability rollout is not ready. Resolve failed checks before relying on production signifiability tooling.',
  }
}
