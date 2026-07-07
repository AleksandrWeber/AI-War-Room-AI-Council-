import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROGRAMMABILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ProgrammabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProgrammabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProgrammabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ProgrammabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProgrammabilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateProgrammabilityvaultizabilityRollout(
  input: ProgrammabilityvaultizabilityRolloutInput,
): ProgrammabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const programmabilityvaultizabilityTableCoverageComplete =
    input.existingProgrammabilityvaultizabilityTableCount === CRITICAL_PROGRAMMABILITYVAULTIZABILITY_TABLES.length

  const checks: ProgrammabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL programmabilityvaultizability checks can reach the database.'
            : 'Production programmabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'programmabilityvaultizability_signal_table_coverage',
      label: 'Programmabilityvaultizability signal table coverage',
      status: programmabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Programmabilityvaultizability signal table coverage is only enforced in production.'
          : programmabilityvaultizabilityTableCoverageComplete
            ? `${input.existingProgrammabilityvaultizabilityTableCount}/${CRITICAL_PROGRAMMABILITYVAULTIZABILITY_TABLES.length} programmabilityvaultizability signal tables are present.`
            : `${input.existingProgrammabilityvaultizabilityTableCount}/${CRITICAL_PROGRAMMABILITYVAULTIZABILITY_TABLES.length} programmabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_programmabilityvaultizability',
      label: 'Billing invoice programmabilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice programmabilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice programmabilityvaultizability signals.'
            : 'Production programmabilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_programmabilityvaultizability',
      label: 'Billing record programmabilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record programmabilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record programmabilityvaultizability signals.'
            : 'Production programmabilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          programmabilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              programmabilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production programmabilityvaultizability rollout requires PostgreSQL connectivity, programmabilityvaultizability tables, billing invoice programmabilityvaultizability, billing record programmabilityvaultizability, and full signal coverage.',
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
        ? 'Production programmabilityvaultizability rollout checks passed. Programmabilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production programmabilityvaultizability rollout is not ready. Resolve failed checks before relying on production programmabilityvaultizability tooling.',
  }
}
