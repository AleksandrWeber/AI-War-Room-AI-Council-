import type { ApiEnv } from '../config/env.js'

export const CRITICAL_VIRTUALIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type VirtualizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type VirtualizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: VirtualizabilityRolloutCheck[]
  guidance: string
}

export type VirtualizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingVirtualizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateVirtualizabilityRollout(
  input: VirtualizabilityRolloutInput,
): VirtualizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const virtualizabilityTableCoverageComplete =
    input.existingVirtualizabilityTableCount === CRITICAL_VIRTUALIZABILITY_TABLES.length

  const checks: VirtualizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL virtualizability checks can reach the database.'
            : 'Production virtualizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'virtualizability_signal_table_coverage',
      label: 'Virtualizability signal table coverage',
      status: virtualizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Virtualizability signal table coverage is only enforced in production.'
          : virtualizabilityTableCoverageComplete
            ? `${input.existingVirtualizabilityTableCount}/${CRITICAL_VIRTUALIZABILITY_TABLES.length} virtualizability signal tables are present.`
            : `${input.existingVirtualizabilityTableCount}/${CRITICAL_VIRTUALIZABILITY_TABLES.length} virtualizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_virtualizability',
      label: 'Billing webhook virtualizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook virtualizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook virtualizability signals.'
            : 'Production virtualizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_virtualizability',
      label: 'Billing record virtualizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record virtualizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record virtualizability signals.'
            : 'Production virtualizability rollout requires a billing_records table.',
    },
    {
      name: 'virtualization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          virtualizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              virtualizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production virtualizability rollout requires PostgreSQL connectivity, virtualizability tables, billing webhook virtualizability, billing record virtualizability, and full signal coverage.',
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
        ? 'Production virtualizability rollout checks passed. Virtualizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production virtualizability rollout is not ready. Resolve failed checks before relying on production virtualizability tooling.',
  }
}
