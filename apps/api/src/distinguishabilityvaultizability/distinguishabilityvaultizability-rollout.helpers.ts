import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DISTINGUISHABILITYVAULTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type DistinguishabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DistinguishabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DistinguishabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type DistinguishabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDistinguishabilityvaultizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateDistinguishabilityvaultizabilityRollout(
  input: DistinguishabilityvaultizabilityRolloutInput,
): DistinguishabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const distinguishabilityvaultizabilityTableCoverageComplete =
    input.existingDistinguishabilityvaultizabilityTableCount === CRITICAL_DISTINGUISHABILITYVAULTIZABILITY_TABLES.length

  const checks: DistinguishabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL distinguishabilityvaultizability checks can reach the database.'
            : 'Production distinguishabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'distinguishabilityvaultizability_signal_table_coverage',
      label: 'Distinguishabilityvaultizability signal table coverage',
      status: distinguishabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Distinguishabilityvaultizability signal table coverage is only enforced in production.'
          : distinguishabilityvaultizabilityTableCoverageComplete
            ? `${input.existingDistinguishabilityvaultizabilityTableCount}/${CRITICAL_DISTINGUISHABILITYVAULTIZABILITY_TABLES.length} distinguishabilityvaultizability signal tables are present.`
            : `${input.existingDistinguishabilityvaultizabilityTableCount}/${CRITICAL_DISTINGUISHABILITYVAULTIZABILITY_TABLES.length} distinguishabilityvaultizability signal tables were found.`,
    },
    {
      name: 'shield_scan_distinguishabilityvaultizability',
      label: 'Shield scan distinguishabilityvaultizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan distinguishabilityvaultizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan distinguishabilityvaultizability signals.'
            : 'Production distinguishabilityvaultizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_distinguishabilityvaultizability',
      label: 'Provider credential distinguishabilityvaultizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential distinguishabilityvaultizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential distinguishabilityvaultizability signals.'
            : 'Production distinguishabilityvaultizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          distinguishabilityvaultizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              distinguishabilityvaultizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production distinguishabilityvaultizability rollout requires PostgreSQL connectivity, distinguishabilityvaultizability tables, shield scan distinguishabilityvaultizability, provider credential distinguishabilityvaultizability, and full signal coverage.',
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
        ? 'Production distinguishabilityvaultizability rollout checks passed. Distinguishabilityvaultizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production distinguishabilityvaultizability rollout is not ready. Resolve failed checks before relying on production distinguishabilityvaultizability tooling.',
  }
}
