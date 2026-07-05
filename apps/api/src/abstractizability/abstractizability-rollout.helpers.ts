import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ABSTRACTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type AbstractizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AbstractizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AbstractizabilityRolloutCheck[]
  guidance: string
}

export type AbstractizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAbstractizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAbstractizabilityRollout(
  input: AbstractizabilityRolloutInput,
): AbstractizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const abstractizabilityTableCoverageComplete =
    input.existingAbstractizabilityTableCount === CRITICAL_ABSTRACTIZABILITY_TABLES.length

  const checks: AbstractizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL abstractizability checks can reach the database.'
            : 'Production abstractizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'abstractizability_signal_table_coverage',
      label: 'Abstractizability signal table coverage',
      status: abstractizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Abstractizability signal table coverage is only enforced in production.'
          : abstractizabilityTableCoverageComplete
            ? `${input.existingAbstractizabilityTableCount}/${CRITICAL_ABSTRACTIZABILITY_TABLES.length} abstractizability signal tables are present.`
            : `${input.existingAbstractizabilityTableCount}/${CRITICAL_ABSTRACTIZABILITY_TABLES.length} abstractizability signal tables were found.`,
    },
    {
      name: 'shield_scan_abstractizability',
      label: 'Shield scan abstractizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan abstractizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan abstractizability signals.'
            : 'Production abstractizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_abstractizability',
      label: 'Provider credential abstractizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential abstractizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential abstractizability signals.'
            : 'Production abstractizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'abstractization_readiness_signal',
      label: 'Abstractization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          abstractizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Abstractization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              abstractizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support abstractization readiness.'
            : 'Production abstractizability rollout requires PostgreSQL connectivity, abstractizability tables, shield scan abstractizability, provider credential abstractizability, and full signal coverage.',
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
        ? 'Production abstractizability rollout checks passed. Abstractizability coverage and abstractization readiness signal signals are healthy.'
        : 'Production abstractizability rollout is not ready. Resolve failed checks before relying on production abstractizability tooling.',
  }
}
