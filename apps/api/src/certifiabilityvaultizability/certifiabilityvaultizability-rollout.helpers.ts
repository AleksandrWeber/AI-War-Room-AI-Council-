import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CERTIFIABILITYVAULTIZABILITY_TABLES = [
  'idempotency_keys',
  'usage_events',
  'billing_webhook_events',
] as const

export type CertifiabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type CertifiabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: CertifiabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type CertifiabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingCertifiabilityvaultizabilityTableCount: number
  idempotencyKeysTableExists: boolean
  usageEventsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateCertifiabilityvaultizabilityRollout(
  input: CertifiabilityvaultizabilityRolloutInput,
): CertifiabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const certifiabilityvaultizabilityTableCoverageComplete =
    input.existingCertifiabilityvaultizabilityTableCount === CRITICAL_CERTIFIABILITYVAULTIZABILITY_TABLES.length

  const checks: CertifiabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL certifiabilityvaultizability checks can reach the database.'
            : 'Production certifiabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'certifiabilityvaultizability_signal_table_coverage',
      label: 'Certifiabilityvaultizability signal table coverage',
      status: certifiabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Certifiabilityvaultizability signal table coverage is only enforced in production.'
          : certifiabilityvaultizabilityTableCoverageComplete
            ? `${input.existingCertifiabilityvaultizabilityTableCount}/${CRITICAL_CERTIFIABILITYVAULTIZABILITY_TABLES.length} certifiabilityvaultizability signal tables are present.`
            : `${input.existingCertifiabilityvaultizabilityTableCount}/${CRITICAL_CERTIFIABILITYVAULTIZABILITY_TABLES.length} certifiabilityvaultizability signal tables were found.`,
    },
    {
      name: 'idempotency_key_certifiabilityvaultizability',
      label: 'Idempotency key certifiabilityvaultizability',
      status: input.idempotencyKeysTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Idempotency key certifiabilityvaultizability is only enforced in production.'
          : input.idempotencyKeysTableExists
            ? 'idempotency_keys table is available for idempotency key certifiabilityvaultizability signals.'
            : 'Production certifiabilityvaultizability rollout requires a idempotency_keys table.',
    },
    {
      name: 'usage_event_certifiabilityvaultizability',
      label: 'Usage event certifiabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event certifiabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event certifiabilityvaultizability signals.'
            : 'Production certifiabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'remediationization_readiness_signal',
      label: 'Isolatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          certifiabilityvaultizabilityTableCoverageComplete &&
          input.idempotencyKeysTableExists &&
          input.usageEventsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Isolatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              certifiabilityvaultizabilityTableCoverageComplete &&
              input.idempotencyKeysTableExists &&
              input.usageEventsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Idempotency keys, usage events, and billing webhook events support remediationization readiness.'
            : 'Production certifiabilityvaultizability rollout requires PostgreSQL connectivity, certifiabilityvaultizability tables, idempotency key certifiabilityvaultizability, usage event certifiabilityvaultizability, and full signal coverage.',
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
        ? 'Production certifiabilityvaultizability rollout checks passed. Certifiabilityvaultizability coverage and isolatization readiness signal signals are healthy.'
        : 'Production certifiabilityvaultizability rollout is not ready. Resolve failed checks before relying on production certifiabilityvaultizability tooling.',
  }
}
