import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ASSESSABILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type AssessabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AssessabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AssessabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type AssessabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAssessabilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAssessabilityvaultizabilityRollout(
  input: AssessabilityvaultizabilityRolloutInput,
): AssessabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const assessabilityvaultizabilityTableCoverageComplete =
    input.existingAssessabilityvaultizabilityTableCount === CRITICAL_ASSESSABILITYVAULTIZABILITY_TABLES.length

  const checks: AssessabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL assessabilityvaultizability checks can reach the database.'
            : 'Production assessabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'assessabilityvaultizability_signal_table_coverage',
      label: 'Assessabilityvaultizability signal table coverage',
      status: assessabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Assessabilityvaultizability signal table coverage is only enforced in production.'
          : assessabilityvaultizabilityTableCoverageComplete
            ? `${input.existingAssessabilityvaultizabilityTableCount}/${CRITICAL_ASSESSABILITYVAULTIZABILITY_TABLES.length} assessabilityvaultizability signal tables are present.`
            : `${input.existingAssessabilityvaultizabilityTableCount}/${CRITICAL_ASSESSABILITYVAULTIZABILITY_TABLES.length} assessabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_assessabilityvaultizability',
      label: 'Billing invoice assessabilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice assessabilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice assessabilityvaultizability signals.'
            : 'Production assessabilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_assessabilityvaultizability',
      label: 'Billing record assessabilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record assessabilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record assessabilityvaultizability signals.'
            : 'Production assessabilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          assessabilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              assessabilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production assessabilityvaultizability rollout requires PostgreSQL connectivity, assessabilityvaultizability tables, billing invoice assessabilityvaultizability, billing record assessabilityvaultizability, and full signal coverage.',
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
        ? 'Production assessabilityvaultizability rollout checks passed. Assessabilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production assessabilityvaultizability rollout is not ready. Resolve failed checks before relying on production assessabilityvaultizability tooling.',
  }
}
