import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REGISTRYJOURNALIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type RegistryjournalizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RegistryjournalizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RegistryjournalizabilityRolloutCheck[]
  guidance: string
}

export type RegistryjournalizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRegistryjournalizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRegistryjournalizabilityRollout(
  input: RegistryjournalizabilityRolloutInput,
): RegistryjournalizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const registryjournalizabilityTableCoverageComplete =
    input.existingRegistryjournalizabilityTableCount === CRITICAL_REGISTRYJOURNALIZABILITY_TABLES.length

  const checks: RegistryjournalizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL registryjournalizability checks can reach the database.'
            : 'Production registryjournalizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'registryjournalizability_signal_table_coverage',
      label: 'Registryjournalizability signal table coverage',
      status: registryjournalizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Registryjournalizability signal table coverage is only enforced in production.'
          : registryjournalizabilityTableCoverageComplete
            ? `${input.existingRegistryjournalizabilityTableCount}/${CRITICAL_REGISTRYJOURNALIZABILITY_TABLES.length} registryjournalizability signal tables are present.`
            : `${input.existingRegistryjournalizabilityTableCount}/${CRITICAL_REGISTRYJOURNALIZABILITY_TABLES.length} registryjournalizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_registryjournalizability',
      label: 'Billing invoice registryjournalizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice registryjournalizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice registryjournalizability signals.'
            : 'Production registryjournalizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_registryjournalizability',
      label: 'Billing record registryjournalizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record registryjournalizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record registryjournalizability signals.'
            : 'Production registryjournalizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          registryjournalizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              registryjournalizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production registryjournalizability rollout requires PostgreSQL connectivity, registryjournalizability tables, billing invoice registryjournalizability, billing record registryjournalizability, and full signal coverage.',
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
        ? 'Production registryjournalizability rollout checks passed. Registryjournalizability coverage and containerization readiness signal signals are healthy.'
        : 'Production registryjournalizability rollout is not ready. Resolve failed checks before relying on production registryjournalizability tooling.',
  }
}
