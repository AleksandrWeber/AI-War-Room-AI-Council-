import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ACCEPTABILITY_TABLES = [
  'billing_records',
  'billing_invoices',
  'workspace_usage_limits',
] as const

export type AcceptabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AcceptabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AcceptabilityRolloutCheck[]
  guidance: string
}

export type AcceptabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAcceptabilityTableCount: number
  billingRecordsTableExists: boolean
  billingInvoicesTableExists: boolean
  workspaceUsageLimitsTableExists: boolean
}

export function evaluateAcceptabilityRollout(
  input: AcceptabilityRolloutInput,
): AcceptabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const acceptabilityTableCoverageComplete =
    input.existingAcceptabilityTableCount === CRITICAL_ACCEPTABILITY_TABLES.length

  const checks: AcceptabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL acceptability checks can reach the database.'
            : 'Production acceptability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'acceptability_signal_table_coverage',
      label: 'Acceptability signal table coverage',
      status: acceptabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Acceptability signal table coverage is only enforced in production.'
          : acceptabilityTableCoverageComplete
            ? `${input.existingAcceptabilityTableCount}/${CRITICAL_ACCEPTABILITY_TABLES.length} acceptability signal tables are present.`
            : `${input.existingAcceptabilityTableCount}/${CRITICAL_ACCEPTABILITY_TABLES.length} acceptability signal tables were found.`,
    },
    {
      name: 'billing_record_acceptability',
      label: 'Billing record acceptability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record acceptability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record acceptability signals.'
            : 'Production acceptability rollout requires a billing_records table.',
    },
    {
      name: 'billing_invoice_acceptability',
      label: 'Billing invoice acceptability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice acceptability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice acceptability signals.'
            : 'Production acceptability rollout requires a billing_invoices table.',
    },
    {
      name: 'acceptance_readiness_signal',
      label: 'Acceptance readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          acceptabilityTableCoverageComplete &&
          input.billingRecordsTableExists &&
          input.billingInvoicesTableExists &&
          input.workspaceUsageLimitsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Acceptance readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              acceptabilityTableCoverageComplete &&
              input.billingRecordsTableExists &&
              input.billingInvoicesTableExists &&
              input.workspaceUsageLimitsTableExists
            ? 'Billing records, billing invoices, and workspace usage limits support acceptance readiness.'
            : 'Production acceptability rollout requires PostgreSQL connectivity, acceptability tables, billing record acceptability, billing invoice acceptability, and full signal coverage.',
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
        ? 'Production acceptability rollout checks passed. Acceptability coverage and acceptance readiness signal signals are healthy.'
        : 'Production acceptability rollout is not ready. Resolve failed checks before relying on production acceptability tooling.',
  }
}
