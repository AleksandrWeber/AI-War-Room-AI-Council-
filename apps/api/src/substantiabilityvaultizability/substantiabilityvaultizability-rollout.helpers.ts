import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SUBSTANTIABILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type SubstantiabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SubstantiabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SubstantiabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type SubstantiabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSubstantiabilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSubstantiabilityvaultizabilityRollout(
  input: SubstantiabilityvaultizabilityRolloutInput,
): SubstantiabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const substantiabilityvaultizabilityTableCoverageComplete =
    input.existingSubstantiabilityvaultizabilityTableCount === CRITICAL_SUBSTANTIABILITYVAULTIZABILITY_TABLES.length

  const checks: SubstantiabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL substantiabilityvaultizability checks can reach the database.'
            : 'Production substantiabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'substantiabilityvaultizability_signal_table_coverage',
      label: 'Substantiabilityvaultizability signal table coverage',
      status: substantiabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Substantiabilityvaultizability signal table coverage is only enforced in production.'
          : substantiabilityvaultizabilityTableCoverageComplete
            ? `${input.existingSubstantiabilityvaultizabilityTableCount}/${CRITICAL_SUBSTANTIABILITYVAULTIZABILITY_TABLES.length} substantiabilityvaultizability signal tables are present.`
            : `${input.existingSubstantiabilityvaultizabilityTableCount}/${CRITICAL_SUBSTANTIABILITYVAULTIZABILITY_TABLES.length} substantiabilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_substantiabilityvaultizability',
      label: 'Shield scan substantiabilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan substantiabilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan substantiabilityvaultizability signals.'
            : 'Production substantiabilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_substantiabilityvaultizability',
      label: 'Provider credential substantiabilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential substantiabilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential substantiabilityvaultizability signals.'
            : 'Production substantiabilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          substantiabilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              substantiabilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production substantiabilityvaultizability rollout requires PostgreSQL connectivity, substantiabilityvaultizability tables, shield scan substantiabilityvaultizability, provider credential substantiabilityvaultizability, and full signal coverage.',
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
        ? 'Production substantiabilityvaultizability rollout checks passed. Substantiabilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production substantiabilityvaultizability rollout is not ready. Resolve failed checks before relying on production substantiabilityvaultizability tooling.',
  }
}
