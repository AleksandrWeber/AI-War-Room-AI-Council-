import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPLIANCECHAINIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type CompliancechainizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompliancechainizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompliancechainizabilityRolloutCheck[]
  guidance: string
}

export type CompliancechainizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompliancechainizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCompliancechainizabilityRollout(
  input: CompliancechainizabilityRolloutInput,
): CompliancechainizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compliancechainizabilityTableCoverageComplete =
    input.existingCompliancechainizabilityTableCount === CRITICAL_COMPLIANCECHAINIZABILITY_TABLES.length

  const checks: CompliancechainizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compliancechainizability checks can reach the database.'
            : 'Production compliancechainizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compliancechainizability_signal_table_coverage',
      label: 'Compliancechainizability signal table coverage',
      status: compliancechainizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compliancechainizability signal table coverage is only enforced in production.'
          : compliancechainizabilityTableCoverageComplete
            ? `${input.existingCompliancechainizabilityTableCount}/${CRITICAL_COMPLIANCECHAINIZABILITY_TABLES.length} compliancechainizability signal tables are present.`
            : `${input.existingCompliancechainizabilityTableCount}/${CRITICAL_COMPLIANCECHAINIZABILITY_TABLES.length} compliancechainizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_compliancechainizability',
      label: 'Billing invoice compliancechainizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice compliancechainizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice compliancechainizability signals.'
            : 'Production compliancechainizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_compliancechainizability',
      label: 'Billing record compliancechainizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record compliancechainizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record compliancechainizability signals.'
            : 'Production compliancechainizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compliancechainizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compliancechainizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production compliancechainizability rollout requires PostgreSQL connectivity, compliancechainizability tables, billing invoice compliancechainizability, billing record compliancechainizability, and full signal coverage.',
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
        ? 'Production compliancechainizability rollout checks passed. Compliancechainizability coverage and containerization readiness signal signals are healthy.'
        : 'Production compliancechainizability rollout is not ready. Resolve failed checks before relying on production compliancechainizability tooling.',
  }
}
