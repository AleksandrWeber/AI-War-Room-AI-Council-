import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONFIGURABILITYVAULTIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ConfigurabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConfigurabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConfigurabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type ConfigurabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConfigurabilityvaultizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateConfigurabilityvaultizabilityRollout(
  input: ConfigurabilityvaultizabilityRolloutInput,
): ConfigurabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const configurabilityvaultizabilityTableCoverageComplete =
    input.existingConfigurabilityvaultizabilityTableCount === CRITICAL_CONFIGURABILITYVAULTIZABILITY_TABLES.length

  const checks: ConfigurabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL configurabilityvaultizability checks can reach the database.'
            : 'Production configurabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'configurabilityvaultizability_signal_table_coverage',
      label: 'Configurabilityvaultizability signal table coverage',
      status: configurabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Configurabilityvaultizability signal table coverage is only enforced in production.'
          : configurabilityvaultizabilityTableCoverageComplete
            ? `${input.existingConfigurabilityvaultizabilityTableCount}/${CRITICAL_CONFIGURABILITYVAULTIZABILITY_TABLES.length} configurabilityvaultizability signal tables are present.`
            : `${input.existingConfigurabilityvaultizabilityTableCount}/${CRITICAL_CONFIGURABILITYVAULTIZABILITY_TABLES.length} configurabilityvaultizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_configurabilityvaultizability',
      label: 'Billing invoice configurabilityvaultizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice configurabilityvaultizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice configurabilityvaultizability signals.'
            : 'Production configurabilityvaultizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_configurabilityvaultizability',
      label: 'Billing record configurabilityvaultizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record configurabilityvaultizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record configurabilityvaultizability signals.'
            : 'Production configurabilityvaultizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          configurabilityvaultizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              configurabilityvaultizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production configurabilityvaultizability rollout requires PostgreSQL connectivity, configurabilityvaultizability tables, billing invoice configurabilityvaultizability, billing record configurabilityvaultizability, and full signal coverage.',
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
        ? 'Production configurabilityvaultizability rollout checks passed. Configurabilityvaultizability coverage and containerization readiness signal signals are healthy.'
        : 'Production configurabilityvaultizability rollout is not ready. Resolve failed checks before relying on production configurabilityvaultizability tooling.',
  }
}
