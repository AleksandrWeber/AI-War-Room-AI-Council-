import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDITLINEIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type AuditlineizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuditlineizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuditlineizabilityRolloutCheck[]
  guidance: string
}

export type AuditlineizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuditlineizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAuditlineizabilityRollout(
  input: AuditlineizabilityRolloutInput,
): AuditlineizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const auditlineizabilityTableCoverageComplete =
    input.existingAuditlineizabilityTableCount === CRITICAL_AUDITLINEIZABILITY_TABLES.length

  const checks: AuditlineizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL auditlineizability checks can reach the database.'
            : 'Production auditlineizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'auditlineizability_signal_table_coverage',
      label: 'Auditlineizability signal table coverage',
      status: auditlineizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Auditlineizability signal table coverage is only enforced in production.'
          : auditlineizabilityTableCoverageComplete
            ? `${input.existingAuditlineizabilityTableCount}/${CRITICAL_AUDITLINEIZABILITY_TABLES.length} auditlineizability signal tables are present.`
            : `${input.existingAuditlineizabilityTableCount}/${CRITICAL_AUDITLINEIZABILITY_TABLES.length} auditlineizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_auditlineizability',
      label: 'Billing invoice auditlineizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice auditlineizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice auditlineizability signals.'
            : 'Production auditlineizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_auditlineizability',
      label: 'Billing record auditlineizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record auditlineizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record auditlineizability signals.'
            : 'Production auditlineizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          auditlineizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              auditlineizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production auditlineizability rollout requires PostgreSQL connectivity, auditlineizability tables, billing invoice auditlineizability, billing record auditlineizability, and full signal coverage.',
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
        ? 'Production auditlineizability rollout checks passed. Auditlineizability coverage and containerization readiness signal signals are healthy.'
        : 'Production auditlineizability rollout is not ready. Resolve failed checks before relying on production auditlineizability tooling.',
  }
}
