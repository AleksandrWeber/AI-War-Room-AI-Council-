import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRUSTWORTHINESS_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type TrustworthinessRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TrustworthinessRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TrustworthinessRolloutCheck[]
  guidance: string
}

export type TrustworthinessRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTrustworthinessTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateTrustworthinessRollout(
  input: TrustworthinessRolloutInput,
): TrustworthinessRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const trustworthinessTableCoverageComplete =
    input.existingTrustworthinessTableCount === CRITICAL_TRUSTWORTHINESS_TABLES.length

  const checks: TrustworthinessRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL trustworthiness checks can reach the database.'
            : 'Production trustworthiness rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'trustworthiness_signal_table_coverage',
      label: 'Trustworthiness signal table coverage',
      status: trustworthinessTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Trustworthiness signal table coverage is only enforced in production.'
          : trustworthinessTableCoverageComplete
            ? `${input.existingTrustworthinessTableCount}/${CRITICAL_TRUSTWORTHINESS_TABLES.length} trustworthiness signal tables are present.`
            : `${input.existingTrustworthinessTableCount}/${CRITICAL_TRUSTWORTHINESS_TABLES.length} trustworthiness signal tables were found.`,
    },
    {
      name: 'shield_scan_trustworthiness',
      label: 'Shield scan trustworthiness',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan trustworthiness is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan trustworthiness signals.'
            : 'Production trustworthiness rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_trustworthiness',
      label: 'Provider credential trustworthiness',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential trustworthiness is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential trustworthiness signals.'
            : 'Production trustworthiness rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'trust_readiness_signal',
      label: 'Trust readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          trustworthinessTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Trust readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              trustworthinessTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, provider credentials, and billing webhook events support trust readiness.'
            : 'Production trustworthiness rollout requires PostgreSQL connectivity, trustworthiness tables, shield scan trustworthiness, provider credential trustworthiness, and full signal coverage.',
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
        ? 'Production trustworthiness rollout checks passed. Trustworthiness coverage and trust readiness signal signals are healthy.'
        : 'Production trustworthiness rollout is not ready. Resolve failed checks before relying on production trustworthiness tooling.',
  }
}
