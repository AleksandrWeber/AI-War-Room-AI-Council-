import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ACCESSIBILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type AccessibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AccessibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AccessibilityRolloutCheck[]
  guidance: string
}

export type AccessibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAccessibilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAccessibilityRollout(
  input: AccessibilityRolloutInput,
): AccessibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const accessibilityTableCoverageComplete =
    input.existingAccessibilityTableCount === CRITICAL_ACCESSIBILITY_TABLES.length

  const checks: AccessibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL accessibility checks can reach the database.'
            : 'Production accessibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'accessibility_signal_table_coverage',
      label: 'Accessibility signal table coverage',
      status: accessibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Accessibility signal table coverage is only enforced in production.'
          : accessibilityTableCoverageComplete
            ? `${input.existingAccessibilityTableCount}/${CRITICAL_ACCESSIBILITY_TABLES.length} accessibility signal tables are present.`
            : `${input.existingAccessibilityTableCount}/${CRITICAL_ACCESSIBILITY_TABLES.length} accessibility signal tables were found.`,
    },
    {
      name: 'idempotency_key_accessibility',
      label: 'Idempotency key accessibility',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key accessibility is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key accessibility signals.'
            : 'Production accessibility rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_accessibility',
      label: 'Usage event accessibility',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event accessibility is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event accessibility signals.'
            : 'Production accessibility rollout requires a usage_events table.',
    },
    {
      name: 'access_readiness_signal',
      label: 'Access readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          accessibilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Access readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              accessibilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support access readiness.'
            : 'Production accessibility rollout requires PostgreSQL connectivity, accessibility tables, idempotency key accessibility, usage event accessibility, and full signal coverage.',
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
        ? 'Production accessibility rollout checks passed. Accessibility coverage and access readiness signal signals are healthy.'
        : 'Production accessibility rollout is not ready. Resolve failed checks before relying on production accessibility tooling.',
  }
}
