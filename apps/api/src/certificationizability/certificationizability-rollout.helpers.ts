import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CERTIFICATIONIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type CertificationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CertificationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CertificationizabilityRolloutCheck[]
  guidance: string
}

export type CertificationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCertificationizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCertificationizabilityRollout(
  input: CertificationizabilityRolloutInput,
): CertificationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const certificationizabilityTableCoverageComplete =
    input.existingCertificationizabilityTableCount === CRITICAL_CERTIFICATIONIZABILITY_TABLES.length

  const checks: CertificationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL certificationizability checks can reach the database.'
            : 'Production certificationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'certificationizability_signal_table_coverage',
      label: 'Certificationizability signal table coverage',
      status: certificationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Certificationizability signal table coverage is only enforced in production.'
          : certificationizabilityTableCoverageComplete
            ? `${input.existingCertificationizabilityTableCount}/${CRITICAL_CERTIFICATIONIZABILITY_TABLES.length} certificationizability signal tables are present.`
            : `${input.existingCertificationizabilityTableCount}/${CRITICAL_CERTIFICATIONIZABILITY_TABLES.length} certificationizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_certificationizability',
      label: 'Billing invoice certificationizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice certificationizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice certificationizability signals.'
            : 'Production certificationizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_certificationizability',
      label: 'Billing record certificationizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record certificationizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record certificationizability signals.'
            : 'Production certificationizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          certificationizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              certificationizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production certificationizability rollout requires PostgreSQL connectivity, certificationizability tables, billing invoice certificationizability, billing record certificationizability, and full signal coverage.',
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
        ? 'Production certificationizability rollout checks passed. Certificationizability coverage and containerization readiness signal signals are healthy.'
        : 'Production certificationizability rollout is not ready. Resolve failed checks before relying on production certificationizability tooling.',
  }
}
