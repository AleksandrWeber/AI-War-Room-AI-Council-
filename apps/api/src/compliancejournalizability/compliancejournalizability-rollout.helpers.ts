import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPLIANCEJOURNALIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type CompliancejournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompliancejournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompliancejournalizabilityRolloutCheck[]
  guidance: string
}

export type CompliancejournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompliancejournalizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCompliancejournalizabilityRollout(
  input: CompliancejournalizabilityRolloutInput,
): CompliancejournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compliancejournalizabilityTableCoverageComplete =
    input.existingCompliancejournalizabilityTableCount === CRITICAL_COMPLIANCEJOURNALIZABILITY_TABLES.length

  const checks: CompliancejournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compliancejournalizability checks can reach the database.'
            : 'Production compliancejournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compliancejournalizability_signal_table_coverage',
      label: 'Compliancejournalizability signal table coverage',
      status: compliancejournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compliancejournalizability signal table coverage is only enforced in production.'
          : compliancejournalizabilityTableCoverageComplete
            ? `${input.existingCompliancejournalizabilityTableCount}/${CRITICAL_COMPLIANCEJOURNALIZABILITY_TABLES.length} compliancejournalizability signal tables are present.`
            : `${input.existingCompliancejournalizabilityTableCount}/${CRITICAL_COMPLIANCEJOURNALIZABILITY_TABLES.length} compliancejournalizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_compliancejournalizability',
      label: 'Billing invoice compliancejournalizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice compliancejournalizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice compliancejournalizability signals.'
            : 'Production compliancejournalizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_compliancejournalizability',
      label: 'Billing record compliancejournalizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record compliancejournalizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record compliancejournalizability signals.'
            : 'Production compliancejournalizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compliancejournalizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compliancejournalizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production compliancejournalizability rollout requires PostgreSQL connectivity, compliancejournalizability tables, billing invoice compliancejournalizability, billing record compliancejournalizability, and full signal coverage.',
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
        ? 'Production compliancejournalizability rollout checks passed. Compliancejournalizability coverage and containerization readiness signal signals are healthy.'
        : 'Production compliancejournalizability rollout is not ready. Resolve failed checks before relying on production compliancejournalizability tooling.',
  }
}
