import type { ApiEnv } from '../config/env.js'

export const CRITICAL_COMPATIBILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type CompatibilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CompatibilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CompatibilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type CompatibilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCompatibilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCompatibilityvaultizabilityRollout(
  input: CompatibilityvaultizabilityRolloutInput,
): CompatibilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const compatibilityvaultizabilityTableCoverageComplete =
    input.existingCompatibilityvaultizabilityTableCount === CRITICAL_COMPATIBILITYVAULTIZABILITY_TABLES.length

  const checks: CompatibilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL compatibilityvaultizability checks can reach the database.'
            : 'Production compatibilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'compatibilityvaultizability_signal_table_coverage',
      label: 'Compatibilityvaultizability signal table coverage',
      status: compatibilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Compatibilityvaultizability signal table coverage is only enforced in production.'
          : compatibilityvaultizabilityTableCoverageComplete
            ? `${input.existingCompatibilityvaultizabilityTableCount}/${CRITICAL_COMPATIBILITYVAULTIZABILITY_TABLES.length} compatibilityvaultizability signal tables are present.`
            : `${input.existingCompatibilityvaultizabilityTableCount}/${CRITICAL_COMPATIBILITYVAULTIZABILITY_TABLES.length} compatibilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_compatibilityvaultizability',
      label: 'Billing invoice compatibilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice compatibilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice compatibilityvaultizability signals.'
            : 'Production compatibilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_compatibilityvaultizability',
      label: 'Billing record compatibilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record compatibilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record compatibilityvaultizability signals.'
            : 'Production compatibilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          compatibilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              compatibilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production compatibilityvaultizability rollout requires PostgreSQL connectivity, compatibilityvaultizability tables, billing invoice compatibilityvaultizability, billing record compatibilityvaultizability, and full signal coverage.',
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
        ? 'Production compatibilityvaultizability rollout checks passed. Compatibilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production compatibilityvaultizability rollout is not ready. Resolve failed checks before relying on production compatibilityvaultizability tooling.',
  }
}
