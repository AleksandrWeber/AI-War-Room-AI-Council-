import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AFFORDABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'workspace_usage_limits',
] as const

export type AffordabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AffordabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AffordabilityRolloutCheck[]
  guidance: string
}

export type AffordabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAffordabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateAffordabilityRollout(
  input: AffordabilityRolloutInput,
): AffordabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const affordabilityTableCoverageComplete =
    input.existingAffordabilityTableCount === CRITICAL_AFFORDABILITY_TABLES.length

  const checks: AffordabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL affordability checks can reach the database.'
            : 'Production affordability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'affordability_signal_table_coverage',
      label: 'Affordability signal table coverage',
      status: affordabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Affordability signal table coverage is only enforced in production.'
          : affordabilityTableCoverageComplete
            ? `${input.existingAffordabilityTableCount}/${CRITICAL_AFFORDABILITY_TABLES.length} affordability signal tables are present.`
            : `${input.existingAffordabilityTableCount}/${CRITICAL_AFFORDABILITY_TABLES.length} affordability signal tables were found.`,
    },
    {
      name: 'billing_invoice_affordability',
      label: 'Billing invoice affordability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice affordability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice affordability signals.'
            : 'Production affordability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_affordability',
      label: 'Billing record affordability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record affordability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record affordability signals.'
            : 'Production affordability rollout requires a billing_records table.',
    },
    {
      name: 'affordability_readiness_signal',
      label: 'Affordability readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          affordabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Affordability readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              affordabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing invoices, billing records, and workspace usage limits support affordability readiness.'
            : 'Production affordability rollout requires PostgreSQL connectivity, affordability tables, billing invoice affordability, billing record affordability, and full signal coverage.',
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
        ? 'Production affordability rollout checks passed. Affordability coverage and affordability readiness signal signals are healthy.'
        : 'Production affordability rollout is not ready. Resolve failed checks before relying on production affordability tooling.',
  }
}
