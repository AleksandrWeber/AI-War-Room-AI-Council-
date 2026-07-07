import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RULEPROOFIZABILITY_TABLES = [
  'billing_invoices',
  'billing_records',
  'billing_webhook_events',
] as const

export type RuleproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RuleproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RuleproofizabilityRolloutCheck[]
  guidance: string
}

export type RuleproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRuleproofizabilityTableCount: number
  billingInvoicesTableExists: boolean
  billingRecordsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRuleproofizabilityRollout(
  input: RuleproofizabilityRolloutInput,
): RuleproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const ruleproofizabilityTableCoverageComplete =
    input.existingRuleproofizabilityTableCount === CRITICAL_RULEPROOFIZABILITY_TABLES.length

  const checks: RuleproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL ruleproofizability checks can reach the database.'
            : 'Production ruleproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'ruleproofizability_signal_table_coverage',
      label: 'Ruleproofizability signal table coverage',
      status: ruleproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Ruleproofizability signal table coverage is only enforced in production.'
          : ruleproofizabilityTableCoverageComplete
            ? `${input.existingRuleproofizabilityTableCount}/${CRITICAL_RULEPROOFIZABILITY_TABLES.length} ruleproofizability signal tables are present.`
            : `${input.existingRuleproofizabilityTableCount}/${CRITICAL_RULEPROOFIZABILITY_TABLES.length} ruleproofizability signal tables were found.`,
    },
    {
      name: 'billing_invoice_ruleproofizability',
      label: 'Billing invoice ruleproofizability',
      status: input.billingInvoicesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing invoice ruleproofizability is only enforced in production.'
          : input.billingInvoicesTableExists
            ? 'billing_invoices table is available for billing invoice ruleproofizability signals.'
            : 'Production ruleproofizability rollout requires a billing_invoices table.',
    },
    {
      name: 'billing_record_ruleproofizability',
      label: 'Billing record ruleproofizability',
      status: input.billingRecordsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing record ruleproofizability is only enforced in production.'
          : input.billingRecordsTableExists
            ? 'billing_records table is available for billing record ruleproofizability signals.'
            : 'Production ruleproofizability rollout requires a billing_records table.',
    },
    {
      name: 'scalingization_readiness_signal',
      label: 'Containerization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          ruleproofizabilityTableCoverageComplete &&
          input.billingInvoicesTableExists &&
          input.billingRecordsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Containerization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              ruleproofizabilityTableCoverageComplete &&
              input.billingInvoicesTableExists &&
              input.billingRecordsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Billing invoices, billing records, and billing webhook events support scalingization readiness.'
            : 'Production ruleproofizability rollout requires PostgreSQL connectivity, ruleproofizability tables, billing invoice ruleproofizability, billing record ruleproofizability, and full signal coverage.',
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
        ? 'Production ruleproofizability rollout checks passed. Ruleproofizability coverage and containerization readiness signal signals are healthy.'
        : 'Production ruleproofizability rollout is not ready. Resolve failed checks before relying on production ruleproofizability tooling.',
  }
}
