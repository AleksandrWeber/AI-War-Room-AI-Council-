import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VOCABULARIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type VocabularizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type VocabularizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: VocabularizabilityRolloutCheck[]
  guidance: string
}

export type VocabularizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingVocabularizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateVocabularizabilityRollout(
  input: VocabularizabilityRolloutInput,
): VocabularizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const vocabularizabilityTableCoverageComplete =
    input.existingVocabularizabilityTableCount === CRITICAL_VOCABULARIZABILITY_TABLES.length

  const checks: VocabularizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL vocabularizability checks can reach the database.'
            : 'Production vocabularizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'vocabularizability_signal_table_coverage',
      label: 'Vocabularizability signal table coverage',
      status: vocabularizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Vocabularizability signal table coverage is only enforced in production.'
          : vocabularizabilityTableCoverageComplete
            ? `${input.existingVocabularizabilityTableCount}/${CRITICAL_VOCABULARIZABILITY_TABLES.length} vocabularizability signal tables are present.`
            : `${input.existingVocabularizabilityTableCount}/${CRITICAL_VOCABULARIZABILITY_TABLES.length} vocabularizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_vocabularizability',
      label: 'Billing invoice vocabularizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice vocabularizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice vocabularizability signals.'
            : 'Production vocabularizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_vocabularizability',
      label: 'Billing record vocabularizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record vocabularizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record vocabularizability signals.'
            : 'Production vocabularizability rollout requires a billing_records table.',
    },
    {
      name: 'vocabularization_readiness_signal',
      label: 'Vocabularization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          vocabularizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Vocabularization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              vocabularizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support vocabularization readiness.'
            : 'Production vocabularizability rollout requires PostgreSQL connectivity, vocabularizability tables, billing invoice vocabularizability, billing record vocabularizability, and full signal coverage.',
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
        ? 'Production vocabularizability rollout checks passed. Vocabularizability coverage and vocabularization readiness signal signals are healthy.'
        : 'Production vocabularizability rollout is not ready. Resolve failed checks before relying on production vocabularizability tooling.',
  }
}
