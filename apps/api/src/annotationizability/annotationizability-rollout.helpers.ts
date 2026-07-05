import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ANNOTATIONIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type AnnotationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AnnotationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AnnotationizabilityRolloutCheck[]
  guidance: string
}

export type AnnotationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAnnotationizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAnnotationizabilityRollout(
  input: AnnotationizabilityRolloutInput,
): AnnotationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const annotationizabilityTableCoverageComplete =
    input.existingAnnotationizabilityTableCount === CRITICAL_ANNOTATIONIZABILITY_TABLES.length

  const checks: AnnotationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL annotationizability checks can reach the database.'
            : 'Production annotationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'annotationizability_signal_table_coverage',
      label: 'Annotationizability signal table coverage',
      status: annotationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Annotationizability signal table coverage is only enforced in production.'
          : annotationizabilityTableCoverageComplete
            ? `${input.existingAnnotationizabilityTableCount}/${CRITICAL_ANNOTATIONIZABILITY_TABLES.length} annotationizability signal tables are present.`
            : `${input.existingAnnotationizabilityTableCount}/${CRITICAL_ANNOTATIONIZABILITY_TABLES.length} annotationizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_annotationizability',
      label: 'Billing invoice annotationizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice annotationizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice annotationizability signals.'
            : 'Production annotationizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_annotationizability',
      label: 'Billing record annotationizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record annotationizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record annotationizability signals.'
            : 'Production annotationizability rollout requires a billing_records table.',
    },
    {
      name: 'annotationization_readiness_signal',
      label: 'Annotationization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          annotationizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Annotationization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              annotationizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support annotationization readiness.'
            : 'Production annotationizability rollout requires PostgreSQL connectivity, annotationizability tables, billing invoice annotationizability, billing record annotationizability, and full signal coverage.',
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
        ? 'Production annotationizability rollout checks passed. Annotationizability coverage and annotationization readiness signal signals are healthy.'
        : 'Production annotationizability rollout is not ready. Resolve failed checks before relying on production annotationizability tooling.',
  }
}
