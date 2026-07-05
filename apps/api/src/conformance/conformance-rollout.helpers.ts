import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CONFORMANCE_TABLES = [
  'shield_scans',
  'billing_webhook_events',
  'idempotency_keys',
] as const

export type ConformanceRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ConformanceRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ConformanceRolloutCheck[]
  guidance: string
}

export type ConformanceRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingConformanceTableCount: number
  shieldScansTableExists: boolean
  billingWebhookEventsTableExists: boolean
  idempotencyKeysTableExists: boolean
}

export function evaluateConformanceRollout(
  input: ConformanceRolloutInput,
): ConformanceRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const conformanceTableCoverageComplete =
    input.existingConformanceTableCount === CRITICAL_CONFORMANCE_TABLES.length

  const checks: ConformanceRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL conformance checks can reach the database.'
            : 'Production conformance rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'conformance_signal_table_coverage',
      label: 'Conformance signal table coverage',
      status: conformanceTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Conformance signal table coverage is only enforced in production.'
          : conformanceTableCoverageComplete
            ? `${input.existingConformanceTableCount}/${CRITICAL_CONFORMANCE_TABLES.length} conformance signal tables are present.`
            : `${input.existingConformanceTableCount}/${CRITICAL_CONFORMANCE_TABLES.length} conformance signal tables were found.`,
    },
    {
      name: 'shield_scan_conformance',
      label: 'Shield scan conformance',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan conformance is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan conformance signals.'
            : 'Production conformance rollout requires a shield_scans table.',
    },
    {
      name: 'billing_webhook_conformance',
      label: 'Billing webhook conformance',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook conformance is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook conformance signals.'
            : 'Production conformance rollout requires a billing_webhook_events table.',
    },
    {
      name: 'conformance_readiness_signal',
      label: 'Conformance readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          conformanceTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.billingWebhookEventsTableExists &&
          input.idempotencyKeysTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Conformance readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              conformanceTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.billingWebhookEventsTableExists &&
              input.idempotencyKeysTableExists
            ? 'Shield scans, billing webhook events, and idempotency keys support conformance readiness.'
            : 'Production conformance rollout requires PostgreSQL connectivity, conformance tables, shield scan conformance, billing webhook conformance, and full signal coverage.',
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
        ? 'Production conformance rollout checks passed. Conformance coverage and conformance readiness signal signals are healthy.'
        : 'Production conformance rollout is not ready. Resolve failed checks before relying on production conformance tooling.',
  }
}
