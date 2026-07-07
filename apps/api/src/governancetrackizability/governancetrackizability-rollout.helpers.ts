import type { ApiEnv } from '../config/env.js'

export const CRITICAL_GOVERNANCETRACKIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type GovernancetrackizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type GovernancetrackizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: GovernancetrackizabilityRolloutCheck[]
  guidance: string
}

export type GovernancetrackizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingGovernancetrackizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateGovernancetrackizabilityRollout(
  input: GovernancetrackizabilityRolloutInput,
): GovernancetrackizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const governancetrackizabilityTableCoverageComplete =
    input.existingGovernancetrackizabilityTableCount === CRITICAL_GOVERNANCETRACKIZABILITY_TABLES.length

  const checks: GovernancetrackizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL governancetrackizability checks can reach the database.'
            : 'Production governancetrackizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'governancetrackizability_signal_table_coverage',
      label: 'Governancetrackizability signal table coverage',
      status: governancetrackizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Governancetrackizability signal table coverage is only enforced in production.'
          : governancetrackizabilityTableCoverageComplete
            ? `${input.existingGovernancetrackizabilityTableCount}/${CRITICAL_GOVERNANCETRACKIZABILITY_TABLES.length} governancetrackizability signal tables are present.`
            : `${input.existingGovernancetrackizabilityTableCount}/${CRITICAL_GOVERNANCETRACKIZABILITY_TABLES.length} governancetrackizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_governancetrackizability',
      label: 'Billing invoice governancetrackizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice governancetrackizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice governancetrackizability signals.'
            : 'Production governancetrackizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_governancetrackizability',
      label: 'Billing record governancetrackizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record governancetrackizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record governancetrackizability signals.'
            : 'Production governancetrackizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          governancetrackizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              governancetrackizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production governancetrackizability rollout requires PostgreSQL connectivity, governancetrackizability tables, billing invoice governancetrackizability, billing record governancetrackizability, and full signal coverage.',
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
        ? 'Production governancetrackizability rollout checks passed. Governancetrackizability coverage and containerization readiness signal signals are healthy.'
        : 'Production governancetrackizability rollout is not ready. Resolve failed checks before relying on production governancetrackizability tooling.',
  }
}
