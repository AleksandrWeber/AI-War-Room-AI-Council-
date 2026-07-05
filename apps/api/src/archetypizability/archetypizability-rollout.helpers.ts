import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ARCHETYPIZABILITY_TABLES = [
  'billing_records',
  'billing_invoices',
  'usage_events',
] as const

export type ArchetypizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ArchetypizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ArchetypizabilityRolloutCheck[]
  guidance: string
}

export type ArchetypizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingArchetypizabilityTableCount: number
  billingRecordsTableExists: boolean
  billingInvoicesTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateArchetypizabilityRollout(
  input: ArchetypizabilityRolloutInput,
): ArchetypizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const archetypizabilityTableCoverageComplete =
    input.existingArchetypizabilityTableCount === CRITICAL_ARCHETYPIZABILITY_TABLES.length

  const checks: ArchetypizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL archetypizability checks can reach the database.'
            : 'Production archetypizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'archetypizability_signal_table_coverage',
      label: 'Archetypizability signal table coverage',
      status: archetypizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Archetypizability signal table coverage is only enforced in production.'
          : archetypizabilityTableCoverageComplete
            ? `${input.existingArchetypizabilityTableCount}/${CRITICAL_ARCHETYPIZABILITY_TABLES.length} archetypizability signal tables are present.`
            : `${input.existingArchetypizabilityTableCount}/${CRITICAL_ARCHETYPIZABILITY_TABLES.length} archetypizability signal tables were found.`,
    },
    {
      name: 'billing_record_archetypizability',
      label: 'Billing record archetypizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record archetypizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record archetypizability signals.'
            : 'Production archetypizability rollout requires a billing_records table.',
    },
    {
      name: 'billing_invoice_archetypizability',
      label: 'Billing invoice archetypizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice archetypizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice archetypizability signals.'
            : 'Production archetypizability rollout requires a billing_invoices table.',
    },
    {
      name: 'archetypization_readiness_signal',
      label: 'Archetypization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          archetypizabilityTableCoverageComplete &&
          input.billingRecordsTableExists &&
          input.billingInvoicesTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Archetypization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              archetypizabilityTableCoverageComplete &&
              input.billingRecordsTableExists &&
              input.billingInvoicesTableExists &&
              input.usageEventsTableExists
            ? 'Billing records, billing invoices, and usage events support archetypization readiness.'
            : 'Production archetypizability rollout requires PostgreSQL connectivity, archetypizability tables, billing record archetypizability, billing invoice archetypizability, and full signal coverage.',
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
        ? 'Production archetypizability rollout checks passed. Archetypizability coverage and archetypization readiness signal signals are healthy.'
        : 'Production archetypizability rollout is not ready. Resolve failed checks before relying on production archetypizability tooling.',
  }
}
