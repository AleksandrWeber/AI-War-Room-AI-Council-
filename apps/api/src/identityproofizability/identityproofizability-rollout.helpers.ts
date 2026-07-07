import type { ApiEnv } from '../config/env.js'

export const CRITICAL_IDENTITYPROOFIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type IdentityproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IdentityproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IdentityproofizabilityRolloutCheck[]
  guidance: string
}

export type IdentityproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIdentityproofizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateIdentityproofizabilityRollout(
  input: IdentityproofizabilityRolloutInput,
): IdentityproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const identityproofizabilityTableCoverageComplete =
    input.existingIdentityproofizabilityTableCount === CRITICAL_IDENTITYPROOFIZABILITY_TABLES.length

  const checks: IdentityproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL identityproofizability checks can reach the database.'
            : 'Production identityproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'identityproofizability_signal_table_coverage',
      label: 'Identityproofizability signal table coverage',
      status: identityproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Identityproofizability signal table coverage is only enforced in production.'
          : identityproofizabilityTableCoverageComplete
            ? `${input.existingIdentityproofizabilityTableCount}/${CRITICAL_IDENTITYPROOFIZABILITY_TABLES.length} identityproofizability signal tables are present.`
            : `${input.existingIdentityproofizabilityTableCount}/${CRITICAL_IDENTITYPROOFIZABILITY_TABLES.length} identityproofizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_identityproofizability',
      label: 'Billing invoice identityproofizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice identityproofizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice identityproofizability signals.'
            : 'Production identityproofizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_identityproofizability',
      label: 'Billing record identityproofizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record identityproofizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record identityproofizability signals.'
            : 'Production identityproofizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          identityproofizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              identityproofizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production identityproofizability rollout requires PostgreSQL connectivity, identityproofizability tables, billing invoice identityproofizability, billing record identityproofizability, and full signal coverage.',
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
        ? 'Production identityproofizability rollout checks passed. Identityproofizability coverage and containerization readiness signal signals are healthy.'
        : 'Production identityproofizability rollout is not ready. Resolve failed checks before relying on production identityproofizability tooling.',
  }
}
