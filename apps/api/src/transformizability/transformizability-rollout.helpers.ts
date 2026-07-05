import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRANSFORMIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type TransformizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TransformizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TransformizabilityRolloutCheck[]
  guidance: string
}

export type TransformizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTransformizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTransformizabilityRollout(
  input: TransformizabilityRolloutInput,
): TransformizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const transformizabilityTableCoverageComplete =
    input.existingTransformizabilityTableCount === CRITICAL_TRANSFORMIZABILITY_TABLES.length

  const checks: TransformizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL transformizability checks can reach the database.'
            : 'Production transformizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'transformizability_signal_table_coverage',
      label: 'Transformizability signal table coverage',
      status: transformizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Transformizability signal table coverage is only enforced in production.'
          : transformizabilityTableCoverageComplete
            ? `${input.existingTransformizabilityTableCount}/${CRITICAL_TRANSFORMIZABILITY_TABLES.length} transformizability signal tables are present.`
            : `${input.existingTransformizabilityTableCount}/${CRITICAL_TRANSFORMIZABILITY_TABLES.length} transformizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_transformizability',
      label: 'Billing webhook transformizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook transformizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook transformizability signals.'
            : 'Production transformizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_transformizability',
      label: 'Billing record transformizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record transformizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record transformizability signals.'
            : 'Production transformizability rollout requires a billing_records table.',
    },
    {
      name: 'transformization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          transformizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              transformizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production transformizability rollout requires PostgreSQL connectivity, transformizability tables, billing webhook transformizability, billing record transformizability, and full signal coverage.',
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
        ? 'Production transformizability rollout checks passed. Transformizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production transformizability rollout is not ready. Resolve failed checks before relying on production transformizability tooling.',
  }
}
