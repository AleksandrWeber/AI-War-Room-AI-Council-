import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DIAGNOSABILIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type DiagnosabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DiagnosabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DiagnosabilizabilityRolloutCheck[]
  guidance: string
}

export type DiagnosabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDiagnosabilizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDiagnosabilizabilityRollout(
  input: DiagnosabilizabilityRolloutInput,
): DiagnosabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const diagnosabilizabilityTableCoverageComplete =
    input.existingDiagnosabilizabilityTableCount === CRITICAL_DIAGNOSABILIZABILITY_TABLES.length

  const checks: DiagnosabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL diagnosabilizability checks can reach the database.'
            : 'Production diagnosabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'diagnosabilizability_signal_table_coverage',
      label: 'Diagnosabilizability signal table coverage',
      status: diagnosabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Diagnosabilizability signal table coverage is only enforced in production.'
          : diagnosabilizabilityTableCoverageComplete
            ? `${input.existingDiagnosabilizabilityTableCount}/${CRITICAL_DIAGNOSABILIZABILITY_TABLES.length} diagnosabilizability signal tables are present.`
            : `${input.existingDiagnosabilizabilityTableCount}/${CRITICAL_DIAGNOSABILIZABILITY_TABLES.length} diagnosabilizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_diagnosabilizability',
      label: 'Billing invoice diagnosabilizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice diagnosabilizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice diagnosabilizability signals.'
            : 'Production diagnosabilizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_diagnosabilizability',
      label: 'Billing record diagnosabilizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record diagnosabilizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record diagnosabilizability signals.'
            : 'Production diagnosabilizability rollout requires a billing_records table.',
    },
    {
      name: 'diagnosabilization_readiness_signal',
      label: 'Diagnosabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          diagnosabilizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Diagnosabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              diagnosabilizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support diagnosabilization readiness.'
            : 'Production diagnosabilizability rollout requires PostgreSQL connectivity, diagnosabilizability tables, billing invoice diagnosabilizability, billing record diagnosabilizability, and full signal coverage.',
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
        ? 'Production diagnosabilizability rollout checks passed. Diagnosabilizability coverage and diagnosabilization readiness signal signals are healthy.'
        : 'Production diagnosabilizability rollout is not ready. Resolve failed checks before relying on production diagnosabilizability tooling.',
  }
}
