import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CHANNELIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type ChannelizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ChannelizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ChannelizabilityRolloutCheck[]
  guidance: string
}

export type ChannelizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingChannelizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateChannelizabilityRollout(
  input: ChannelizabilityRolloutInput,
): ChannelizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const channelizabilityTableCoverageComplete =
    input.existingChannelizabilityTableCount === CRITICAL_CHANNELIZABILITY_TABLES.length

  const checks: ChannelizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL channelizability checks can reach the database.'
            : 'Production channelizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'channelizability_signal_table_coverage',
      label: 'Channelizability signal table coverage',
      status: channelizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Channelizability signal table coverage is only enforced in production.'
          : channelizabilityTableCoverageComplete
            ? `${input.existingChannelizabilityTableCount}/${CRITICAL_CHANNELIZABILITY_TABLES.length} channelizability signal tables are present.`
            : `${input.existingChannelizabilityTableCount}/${CRITICAL_CHANNELIZABILITY_TABLES.length} channelizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_channelizability',
      label: 'Billing invoice channelizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice channelizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice channelizability signals.'
            : 'Production channelizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_channelizability',
      label: 'Billing record channelizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record channelizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record channelizability signals.'
            : 'Production channelizability rollout requires a billing_records table.',
    },
    {
      name: 'channelization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          channelizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              channelizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support channelization readiness.'
            : 'Production channelizability rollout requires PostgreSQL connectivity, channelizability tables, billing invoice channelizability, billing record channelizability, and full signal coverage.',
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
        ? 'Production channelizability rollout checks passed. Channelizability coverage and containerization readiness signal signals are healthy.'
        : 'Production channelizability rollout is not ready. Resolve failed checks before relying on production channelizability tooling.',
  }
}
