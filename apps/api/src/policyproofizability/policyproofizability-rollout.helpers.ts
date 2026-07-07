import type { ApiEnv } from '../config/env.js'

export const CRITICAL_POLICYPROOFIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type PolicyproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PolicyproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PolicyproofizabilityRolloutCheck[]
  guidance: string
}

export type PolicyproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPolicyproofizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePolicyproofizabilityRollout(
  input: PolicyproofizabilityRolloutInput,
): PolicyproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const policyproofizabilityTableCoverageComplete =
    input.existingPolicyproofizabilityTableCount === CRITICAL_POLICYPROOFIZABILITY_TABLES.length

  const checks: PolicyproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL policyproofizability checks can reach the database.'
            : 'Production policyproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'policyproofizability_signal_table_coverage',
      label: 'Policyproofizability signal table coverage',
      status: policyproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Policyproofizability signal table coverage is only enforced in production.'
          : policyproofizabilityTableCoverageComplete
            ? `${input.existingPolicyproofizabilityTableCount}/${CRITICAL_POLICYPROOFIZABILITY_TABLES.length} policyproofizability signal tables are present.`
            : `${input.existingPolicyproofizabilityTableCount}/${CRITICAL_POLICYPROOFIZABILITY_TABLES.length} policyproofizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_policyproofizability',
      label: 'Billing invoice policyproofizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice policyproofizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice policyproofizability signals.'
            : 'Production policyproofizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_policyproofizability',
      label: 'Billing record policyproofizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record policyproofizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record policyproofizability signals.'
            : 'Production policyproofizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          policyproofizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              policyproofizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production policyproofizability rollout requires PostgreSQL connectivity, policyproofizability tables, billing invoice policyproofizability, billing record policyproofizability, and full signal coverage.',
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
        ? 'Production policyproofizability rollout checks passed. Policyproofizability coverage and containerization readiness signal signals are healthy.'
        : 'Production policyproofizability rollout is not ready. Resolve failed checks before relying on production policyproofizability tooling.',
  }
}
