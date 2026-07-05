import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEPENDABILITY_TABLES = [
  'billing_records',
  'billing_invoices',
  'billing_notifications',
] as const

export type DependabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DependabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DependabilityRolloutCheck[]
  guidance: string
}

export type DependabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDependabilityTableCount: number
  billingRecordsTableExists: boolean
  billingInvoicesTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateDependabilityRollout(
  input: DependabilityRolloutInput,
): DependabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const dependabilityTableCoverageComplete =
    input.existingDependabilityTableCount === CRITICAL_DEPENDABILITY_TABLES.length

  const checks: DependabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL dependability checks can reach the database.'
            : 'Production dependability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'dependability_signal_table_coverage',
      label: 'Dependability signal table coverage',
      status: dependabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Dependability signal table coverage is only enforced in production.'
          : dependabilityTableCoverageComplete
            ? `${input.existingDependabilityTableCount}/${CRITICAL_DEPENDABILITY_TABLES.length} dependability signal tables are present.`
            : `${input.existingDependabilityTableCount}/${CRITICAL_DEPENDABILITY_TABLES.length} dependability signal tables were found.`,
    },
    {
      name: 'billing_record_dependability',
      label: 'Billing record dependability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record dependability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record dependability signals.'
            : 'Production dependability rollout requires a billing_records table.',
    },
    {
      name: 'billing_invoice_dependability',
      label: 'Billing invoice dependability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice dependability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice dependability signals.'
            : 'Production dependability rollout requires a billing_invoices table.',
    },
    {
      name: 'dependency_readiness_signal',
      label: 'Dependency readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          dependabilityTableCoverageComplete &&
          input.billingRecordsTableExists &&
          input.billingInvoicesTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Dependency readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              dependabilityTableCoverageComplete &&
              input.billingRecordsTableExists &&
              input.billingInvoicesTableExists &&
              input.billingNotificationsTableExists
            ? 'Billing records, billing invoices, and billing notifications support dependency readiness.'
            : 'Production dependability rollout requires PostgreSQL connectivity, dependability tables, billing record dependability, billing invoice dependability, and full signal coverage.',
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
        ? 'Production dependability rollout checks passed. Dependability coverage and dependency readiness signal signals are healthy.'
        : 'Production dependability rollout is not ready. Resolve failed checks before relying on production dependability tooling.',
  }
}
