import type { ApiEnv } from '../config/env.js'

export const CRITICAL_OVERSIGHTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type OversightizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type OversightizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: OversightizabilityRolloutCheck[]
  guidance: string
}

export type OversightizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingOversightizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateOversightizabilityRollout(
  input: OversightizabilityRolloutInput,
): OversightizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const oversightizabilityTableCoverageComplete =
    input.existingOversightizabilityTableCount === CRITICAL_OVERSIGHTIZABILITY_TABLES.length

  const checks: OversightizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL oversightizability checks can reach the database.'
            : 'Production oversightizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'oversightizability_signal_table_coverage',
      label: 'Oversightizability signal table coverage',
      status: oversightizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Oversightizability signal table coverage is only enforced in production.'
          : oversightizabilityTableCoverageComplete
            ? `${input.existingOversightizabilityTableCount}/${CRITICAL_OVERSIGHTIZABILITY_TABLES.length} oversightizability signal tables are present.`
            : `${input.existingOversightizabilityTableCount}/${CRITICAL_OVERSIGHTIZABILITY_TABLES.length} oversightizability signal tables were found.`,
    },
    {
      name: 'shield_scan_oversightizability',
      label: 'Shield scan oversightizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan oversightizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan oversightizability signals.'
            : 'Production oversightizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_oversightizability',
      label: 'Provider credential oversightizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential oversightizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential oversightizability signals.'
            : 'Production oversightizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          oversightizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              oversightizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production oversightizability rollout requires PostgreSQL connectivity, oversightizability tables, shield scan oversightizability, provider credential oversightizability, and full signal coverage.',
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
        ? 'Production oversightizability rollout checks passed. Oversightizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production oversightizability rollout is not ready. Resolve failed checks before relying on production oversightizability tooling.',
  }
}
