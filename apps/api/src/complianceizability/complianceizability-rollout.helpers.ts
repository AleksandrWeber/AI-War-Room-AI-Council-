import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPLIANCEIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ComplianceizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComplianceizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComplianceizabilityRolloutCheck[]
  guidance: string
}

export type ComplianceizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComplianceizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateComplianceizabilityRollout(
  input: ComplianceizabilityRolloutInput,
): ComplianceizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const complianceizabilityTableCoverageComplete =
    input.existingComplianceizabilityTableCount === CRITICAL_COMPLIANCEIZABILITY_TABLES.length

  const checks: ComplianceizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL complianceizability checks can reach the database.'
            : 'Production complianceizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'complianceizability_signal_table_coverage',
      label: 'Complianceizability signal table coverage',
      status: complianceizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Complianceizability signal table coverage is only enforced in production.'
          : complianceizabilityTableCoverageComplete
            ? `${input.existingComplianceizabilityTableCount}/${CRITICAL_COMPLIANCEIZABILITY_TABLES.length} complianceizability signal tables are present.`
            : `${input.existingComplianceizabilityTableCount}/${CRITICAL_COMPLIANCEIZABILITY_TABLES.length} complianceizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_complianceizability',
      label: 'Billing invoice complianceizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice complianceizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice complianceizability signals.'
            : 'Production complianceizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_complianceizability',
      label: 'Billing record complianceizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record complianceizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record complianceizability signals.'
            : 'Production complianceizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          complianceizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              complianceizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production complianceizability rollout requires PostgreSQL connectivity, complianceizability tables, billing invoice complianceizability, billing record complianceizability, and full signal coverage.',
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
        ? 'Production complianceizability rollout checks passed. Complianceizability coverage and containerization readiness signal signals are healthy.'
        : 'Production complianceizability rollout is not ready. Resolve failed checks before relying on production complianceizability tooling.',
  }
}
