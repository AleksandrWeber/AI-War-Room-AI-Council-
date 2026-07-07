import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUTHENTICATIONIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type AuthenticationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuthenticationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuthenticationizabilityRolloutCheck[]
  guidance: string
}

export type AuthenticationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuthenticationizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAuthenticationizabilityRollout(
  input: AuthenticationizabilityRolloutInput,
): AuthenticationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const authenticationizabilityTableCoverageComplete =
    input.existingAuthenticationizabilityTableCount === CRITICAL_AUTHENTICATIONIZABILITY_TABLES.length

  const checks: AuthenticationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL authenticationizability checks can reach the database.'
            : 'Production authenticationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'authenticationizability_signal_table_coverage',
      label: 'Authenticationizability signal table coverage',
      status: authenticationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Authenticationizability signal table coverage is only enforced in production.'
          : authenticationizabilityTableCoverageComplete
            ? `${input.existingAuthenticationizabilityTableCount}/${CRITICAL_AUTHENTICATIONIZABILITY_TABLES.length} authenticationizability signal tables are present.`
            : `${input.existingAuthenticationizabilityTableCount}/${CRITICAL_AUTHENTICATIONIZABILITY_TABLES.length} authenticationizability signal tables were found.`,
    },
    {
      name: 'shield_scan_authenticationizability',
      label: 'Shield scan authenticationizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan authenticationizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan authenticationizability signals.'
            : 'Production authenticationizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_authenticationizability',
      label: 'Provider credential authenticationizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential authenticationizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential authenticationizability signals.'
            : 'Production authenticationizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          authenticationizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              authenticationizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production authenticationizability rollout requires PostgreSQL connectivity, authenticationizability tables, shield scan authenticationizability, provider credential authenticationizability, and full signal coverage.',
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
        ? 'Production authenticationizability rollout checks passed. Authenticationizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production authenticationizability rollout is not ready. Resolve failed checks before relying on production authenticationizability tooling.',
  }
}
