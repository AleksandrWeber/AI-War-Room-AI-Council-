import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ENTITLEMENTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type EntitlementizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EntitlementizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EntitlementizabilityRolloutCheck[]
  guidance: string
}

export type EntitlementizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEntitlementizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateEntitlementizabilityRollout(
  input: EntitlementizabilityRolloutInput,
): EntitlementizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const entitlementizabilityTableCoverageComplete =
    input.existingEntitlementizabilityTableCount === CRITICAL_ENTITLEMENTIZABILITY_TABLES.length

  const checks: EntitlementizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL entitlementizability checks can reach the database.'
            : 'Production entitlementizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'entitlementizability_signal_table_coverage',
      label: 'Entitlementizability signal table coverage',
      status: entitlementizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Entitlementizability signal table coverage is only enforced in production.'
          : entitlementizabilityTableCoverageComplete
            ? `${input.existingEntitlementizabilityTableCount}/${CRITICAL_ENTITLEMENTIZABILITY_TABLES.length} entitlementizability signal tables are present.`
            : `${input.existingEntitlementizabilityTableCount}/${CRITICAL_ENTITLEMENTIZABILITY_TABLES.length} entitlementizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_entitlementizability',
      label: 'Billing invoice entitlementizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice entitlementizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice entitlementizability signals.'
            : 'Production entitlementizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_entitlementizability',
      label: 'Billing record entitlementizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record entitlementizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record entitlementizability signals.'
            : 'Production entitlementizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          entitlementizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              entitlementizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production entitlementizability rollout requires PostgreSQL connectivity, entitlementizability tables, billing invoice entitlementizability, billing record entitlementizability, and full signal coverage.',
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
        ? 'Production entitlementizability rollout checks passed. Entitlementizability coverage and containerization readiness signal signals are healthy.'
        : 'Production entitlementizability rollout is not ready. Resolve failed checks before relying on production entitlementizability tooling.',
  }
}
