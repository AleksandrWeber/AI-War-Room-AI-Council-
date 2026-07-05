import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ORCHESTRATIONIZABILITY_TABLES = [
  'billing_webhook_events',
  'billing_records',
  'usage_events',
] as const

export type OrchestrationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OrchestrationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OrchestrationizabilityRolloutCheck[]
  guidance: string
}

export type OrchestrationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOrchestrationizabilityTableCount: number
  billingWebhookEventsTableExists: boolean
  billingRecordsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateOrchestrationizabilityRollout(
  input: OrchestrationizabilityRolloutInput,
): OrchestrationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const orchestrationizabilityTableCoverageComplete =
    input.existingOrchestrationizabilityTableCount === CRITICAL_ORCHESTRATIONIZABILITY_TABLES.length

  const checks: OrchestrationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL orchestrationizability checks can reach the database.'
            : 'Production orchestrationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'orchestrationizability_signal_table_coverage',
      label: 'Orchestrationizability signal table coverage',
      status: orchestrationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Orchestrationizability signal table coverage is only enforced in production.'
          : orchestrationizabilityTableCoverageComplete
            ? `${input.existingOrchestrationizabilityTableCount}/${CRITICAL_ORCHESTRATIONIZABILITY_TABLES.length} orchestrationizability signal tables are present.`
            : `${input.existingOrchestrationizabilityTableCount}/${CRITICAL_ORCHESTRATIONIZABILITY_TABLES.length} orchestrationizability signal tables were found.`,
    },
    {
      name: 'billing_webhook_orchestrationizability',
      label: 'Billing webhook orchestrationizability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook orchestrationizability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook orchestrationizability signals.'
            : 'Production orchestrationizability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'billing_record_orchestrationizability',
      label: 'Billing record orchestrationizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record orchestrationizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record orchestrationizability signals.'
            : 'Production orchestrationizability rollout requires a billing_records table.',
    },
    {
      name: 'orchestrationization_readiness_signal',
      label: 'Virtualization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          orchestrationizabilityTableCoverageComplete &&
          input.billingWebhookEventsTableExists &&
          input.billingRecordsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Virtualization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              orchestrationizabilityTableCoverageComplete &&
              input.billingWebhookEventsTableExists &&
              input.billingRecordsTableExists &&
              input.usageEventsTableExists
            ? 'Billing webhook events, billing records, and usage events support interpolation readiness.'
            : 'Production orchestrationizability rollout requires PostgreSQL connectivity, orchestrationizability tables, billing webhook orchestrationizability, billing record orchestrationizability, and full signal coverage.',
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
        ? 'Production orchestrationizability rollout checks passed. Orchestrationizability coverage and virtualization readiness signal signals are healthy.'
        : 'Production orchestrationizability rollout is not ready. Resolve failed checks before relying on production orchestrationizability tooling.',
  }
}
