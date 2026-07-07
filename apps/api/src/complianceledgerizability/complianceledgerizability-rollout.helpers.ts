import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPLIANCELEDGERIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ComplianceledgerizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ComplianceledgerizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ComplianceledgerizabilityRolloutCheck[]
  guidance: string
}

export type ComplianceledgerizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingComplianceledgerizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateComplianceledgerizabilityRollout(
  input: ComplianceledgerizabilityRolloutInput,
): ComplianceledgerizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const complianceledgerizabilityTableCoverageComplete =
    input.existingComplianceledgerizabilityTableCount === CRITICAL_COMPLIANCELEDGERIZABILITY_TABLES.length

  const checks: ComplianceledgerizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL complianceledgerizability checks can reach the database.'
            : 'Production complianceledgerizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'complianceledgerizability_signal_table_coverage',
      label: 'Complianceledgerizability signal table coverage',
      status: complianceledgerizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Complianceledgerizability signal table coverage is only enforced in production.'
          : complianceledgerizabilityTableCoverageComplete
            ? `${input.existingComplianceledgerizabilityTableCount}/${CRITICAL_COMPLIANCELEDGERIZABILITY_TABLES.length} complianceledgerizability signal tables are present.`
            : `${input.existingComplianceledgerizabilityTableCount}/${CRITICAL_COMPLIANCELEDGERIZABILITY_TABLES.length} complianceledgerizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_complianceledgerizability',
      label: 'Billing invoice complianceledgerizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice complianceledgerizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice complianceledgerizability signals.'
            : 'Production complianceledgerizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_complianceledgerizability',
      label: 'Billing record complianceledgerizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record complianceledgerizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record complianceledgerizability signals.'
            : 'Production complianceledgerizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          complianceledgerizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              complianceledgerizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production complianceledgerizability rollout requires PostgreSQL connectivity, complianceledgerizability tables, billing invoice complianceledgerizability, billing record complianceledgerizability, and full signal coverage.',
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
        ? 'Production complianceledgerizability rollout checks passed. Complianceledgerizability coverage and containerization readiness signal signals are healthy.'
        : 'Production complianceledgerizability rollout is not ready. Resolve failed checks before relying on production complianceledgerizability tooling.',
  }
}
