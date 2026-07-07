import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ORCHESTRABILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type OrchestrabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OrchestrabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OrchestrabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type OrchestrabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOrchestrabilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateOrchestrabilityvaultizabilityRollout(
  input: OrchestrabilityvaultizabilityRolloutInput,
): OrchestrabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const orchestrabilityvaultizabilityTableCoverageComplete =
    input.existingOrchestrabilityvaultizabilityTableCount === CRITICAL_ORCHESTRABILITYVAULTIZABILITY_TABLES.length

  const checks: OrchestrabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL orchestrabilityvaultizability checks can reach the database.'
            : 'Production orchestrabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'orchestrabilityvaultizability_signal_table_coverage',
      label: 'Orchestrabilityvaultizability signal table coverage',
      status: orchestrabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Orchestrabilityvaultizability signal table coverage is only enforced in production.'
          : orchestrabilityvaultizabilityTableCoverageComplete
            ? `${input.existingOrchestrabilityvaultizabilityTableCount}/${CRITICAL_ORCHESTRABILITYVAULTIZABILITY_TABLES.length} orchestrabilityvaultizability signal tables are present.`
            : `${input.existingOrchestrabilityvaultizabilityTableCount}/${CRITICAL_ORCHESTRABILITYVAULTIZABILITY_TABLES.length} orchestrabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_orchestrabilityvaultizability',
      label: 'Billing invoice orchestrabilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice orchestrabilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice orchestrabilityvaultizability signals.'
            : 'Production orchestrabilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_orchestrabilityvaultizability',
      label: 'Billing record orchestrabilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record orchestrabilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record orchestrabilityvaultizability signals.'
            : 'Production orchestrabilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          orchestrabilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              orchestrabilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production orchestrabilityvaultizability rollout requires PostgreSQL connectivity, orchestrabilityvaultizability tables, billing invoice orchestrabilityvaultizability, billing record orchestrabilityvaultizability, and full signal coverage.',
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
        ? 'Production orchestrabilityvaultizability rollout checks passed. Orchestrabilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production orchestrabilityvaultizability rollout is not ready. Resolve failed checks before relying on production orchestrabilityvaultizability tooling.',
  }
}
