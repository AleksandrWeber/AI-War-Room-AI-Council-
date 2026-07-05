import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONSOLIDATIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type ConsolidatizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConsolidatizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConsolidatizabilityRolloutCheck[]
  guidance: string
}

export type ConsolidatizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConsolidatizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateConsolidatizabilityRollout(
  input: ConsolidatizabilityRolloutInput,
): ConsolidatizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const consolidatizabilityTableCoverageComplete =
    input.existingConsolidatizabilityTableCount === CRITICAL_CONSOLIDATIZABILITY_TABLES.length

  const checks: ConsolidatizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL consolidatizability checks can reach the database.'
            : 'Production consolidatizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'consolidatizability_signal_table_coverage',
      label: 'Consolidatizability signal table coverage',
      status: consolidatizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Consolidatizability signal table coverage is only enforced in production.'
          : consolidatizabilityTableCoverageComplete
            ? `${input.existingConsolidatizabilityTableCount}/${CRITICAL_CONSOLIDATIZABILITY_TABLES.length} consolidatizability signal tables are present.`
            : `${input.existingConsolidatizabilityTableCount}/${CRITICAL_CONSOLIDATIZABILITY_TABLES.length} consolidatizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_consolidatizability',
      label: 'Billing webhook consolidatizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook consolidatizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook consolidatizability signals.'
            : 'Production consolidatizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_consolidatizability',
      label: 'Billing record consolidatizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record consolidatizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record consolidatizability signals.'
            : 'Production consolidatizability rollout requires a billing_records table.',
    },
    {
      name: 'consolidatization_readiness_signal',
      label: 'Consolidatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          consolidatizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Consolidatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              consolidatizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support consolidatization readiness.'
            : 'Production consolidatizability rollout requires PostgreSQL connectivity, consolidatizability tables, billing webhook consolidatizability, billing record consolidatizability, and full signal coverage.',
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
        ? 'Production consolidatizability rollout checks passed. Consolidatizability coverage and consolidatization readiness signal signals are healthy.'
        : 'Production consolidatizability rollout is not ready. Resolve failed checks before relying on production consolidatizability tooling.',
  }
}
