import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDITINGIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type AuditingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuditingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuditingizabilityRolloutCheck[]
  guidance: string
}

export type AuditingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuditingizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAuditingizabilityRollout(
  input: AuditingizabilityRolloutInput,
): AuditingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const auditingizabilityTableCoverageComplete =
    input.existingAuditingizabilityTableCount === CRITICAL_AUDITINGIZABILITY_TABLES.length

  const checks: AuditingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL auditingizability checks can reach the database.'
            : 'Production auditingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'auditingizability_signal_table_coverage',
      label: 'Auditingizability signal table coverage',
      status: auditingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Auditingizability signal table coverage is only enforced in production.'
          : auditingizabilityTableCoverageComplete
            ? `${input.existingAuditingizabilityTableCount}/${CRITICAL_AUDITINGIZABILITY_TABLES.length} auditingizability signal tables are present.`
            : `${input.existingAuditingizabilityTableCount}/${CRITICAL_AUDITINGIZABILITY_TABLES.length} auditingizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_auditingizability',
      label: 'Billing invoice auditingizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice auditingizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice auditingizability signals.'
            : 'Production auditingizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_auditingizability',
      label: 'Billing record auditingizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record auditingizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record auditingizability signals.'
            : 'Production auditingizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          auditingizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              auditingizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production auditingizability rollout requires PostgreSQL connectivity, auditingizability tables, billing invoice auditingizability, billing record auditingizability, and full signal coverage.',
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
        ? 'Production auditingizability rollout checks passed. Auditingizability coverage and containerization readiness signal signals are healthy.'
        : 'Production auditingizability rollout is not ready. Resolve failed checks before relying on production auditingizability tooling.',
  }
}
