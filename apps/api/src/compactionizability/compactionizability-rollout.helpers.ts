import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPACTIONIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type CompactionizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompactionizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompactionizabilityRolloutCheck[]
  guidance: string
}

export type CompactionizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompactionizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateCompactionizabilityRollout(
  input: CompactionizabilityRolloutInput,
): CompactionizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compactionizabilityTableCoverageComplete =
    input.existingCompactionizabilityTableCount === CRITICAL_COMPACTIONIZABILITY_TABLES.length

  const checks: CompactionizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compactionizability checks can reach the database.'
            : 'Production compactionizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compactionizability_signal_table_coverage',
      label: 'Compactionizability signal table coverage',
      status: compactionizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compactionizability signal table coverage is only enforced in production.'
          : compactionizabilityTableCoverageComplete
            ? `${input.existingCompactionizabilityTableCount}/${CRITICAL_COMPACTIONIZABILITY_TABLES.length} compactionizability signal tables are present.`
            : `${input.existingCompactionizabilityTableCount}/${CRITICAL_COMPACTIONIZABILITY_TABLES.length} compactionizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_compactionizability',
      label: 'Billing webhook compactionizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook compactionizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook compactionizability signals.'
            : 'Production compactionizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_compactionizability',
      label: 'Billing record compactionizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record compactionizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record compactionizability signals.'
            : 'Production compactionizability rollout requires a billing_records table.',
    },
    {
      name: 'compactionization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compactionizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compactionizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production compactionizability rollout requires PostgreSQL connectivity, compactionizability tables, billing webhook compactionizability, billing record compactionizability, and full signal coverage.',
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
        ? 'Production compactionizability rollout checks passed. Compactionizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production compactionizability rollout is not ready. Resolve failed checks before relying on production compactionizability tooling.',
  }
}
