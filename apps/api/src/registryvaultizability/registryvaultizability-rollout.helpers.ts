import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REGISTRYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type RegistryvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RegistryvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RegistryvaultizabilityRolloutCheck[]
  guidance: string
}

export type RegistryvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRegistryvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRegistryvaultizabilityRollout(
  input: RegistryvaultizabilityRolloutInput,
): RegistryvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const registryvaultizabilityTableCoverageComplete =
    input.existingRegistryvaultizabilityTableCount === CRITICAL_REGISTRYVAULTIZABILITY_TABLES.length

  const checks: RegistryvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL registryvaultizability checks can reach the database.'
            : 'Production registryvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'registryvaultizability_signal_table_coverage',
      label: 'Registryvaultizability signal table coverage',
      status: registryvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Registryvaultizability signal table coverage is only enforced in production.'
          : registryvaultizabilityTableCoverageComplete
            ? `${input.existingRegistryvaultizabilityTableCount}/${CRITICAL_REGISTRYVAULTIZABILITY_TABLES.length} registryvaultizability signal tables are present.`
            : `${input.existingRegistryvaultizabilityTableCount}/${CRITICAL_REGISTRYVAULTIZABILITY_TABLES.length} registryvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_registryvaultizability',
      label: 'Billing invoice registryvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice registryvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice registryvaultizability signals.'
            : 'Production registryvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_registryvaultizability',
      label: 'Billing record registryvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record registryvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record registryvaultizability signals.'
            : 'Production registryvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          registryvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              registryvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production registryvaultizability rollout requires PostgreSQL connectivity, registryvaultizability tables, billing invoice registryvaultizability, billing record registryvaultizability, and full signal coverage.',
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
        ? 'Production registryvaultizability rollout checks passed. Registryvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production registryvaultizability rollout is not ready. Resolve failed checks before relying on production registryvaultizability tooling.',
  }
}
