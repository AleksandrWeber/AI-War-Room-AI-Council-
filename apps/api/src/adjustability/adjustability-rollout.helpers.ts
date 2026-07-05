import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ADJUSTABILITY_TABLES = [
  'billing_invoices',
  'billing_meter_usage_reports',
  'workspace_memberships',
] as const

export type AdjustabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AdjustabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AdjustabilityRolloutCheck[]
  guidance: string
}

export type AdjustabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAdjustabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingMeterUsageReportsTableExists: boolean
  workspaceMembershipsTableExists: boolean
}

export function evaluateAdjustabilityRollout(
  input: AdjustabilityRolloutInput,
): AdjustabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const adjustabilityTableCoverageComplete =
    input.existingAdjustabilityTableCount === CRITICAL_ADJUSTABILITY_TABLES.length

  const checks: AdjustabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL adjustability checks can reach the database.'
            : 'Production adjustability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'adjustability_signal_table_coverage',
      label: 'Adjustability signal table coverage',
      status: adjustabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Adjustability signal table coverage is only enforced in production.'
          : adjustabilityTableCoverageComplete
            ? `${input.existingAdjustabilityTableCount}/${CRITICAL_ADJUSTABILITY_TABLES.length} adjustability signal tables are present.`
            : `${input.existingAdjustabilityTableCount}/${CRITICAL_ADJUSTABILITY_TABLES.length} adjustability signal tables were found.`,
    },
    {
      name: 'billing_invoice_adjustability',
      label: 'Billing invoice adjustability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice adjustability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice adjustability signals.'
            : 'Production adjustability rollout requires a billing_invoices table.',
    },
    {
      name: 'meter_usage_adjustability',
      label: 'Meter usage adjustability',
      status: input.billingMeterUsageReportsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Meter usage adjustability is only enforced in production.'
          : input.billingMeterUsageReportsTableExists
            ? 'billing_meter_usage_reports table is available for meter usage adjustability signals.'
            : 'Production adjustability rollout requires a billing_meter_usage_reports table.',
    },
    {
      name: 'adjustment_readiness_signal',
      label: 'Adjustment readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          adjustabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingMeterUsageReportsTableExists &&
          input.workspaceMembershipsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Adjustment readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              adjustabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingMeterUsageReportsTableExists &&
              input.workspaceMembershipsTableExists
            ? 'Billing invoices, meter usage reports, and workspace memberships support adjustment readiness.'
            : 'Production adjustability rollout requires PostgreSQL connectivity, adjustability tables, billing invoice adjustability, meter usage adjustability, and full signal coverage.',
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
        ? 'Production adjustability rollout checks passed. Adjustability coverage and adjustment readiness signal signals are healthy.'
        : 'Production adjustability rollout is not ready. Resolve failed checks before relying on production adjustability tooling.',
  }
}
