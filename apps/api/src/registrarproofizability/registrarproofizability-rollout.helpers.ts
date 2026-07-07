import type { ApiEnv } from '../config/env.js'

export const CRITICAL_REGISTRARPROOFIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type RegistrarproofizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RegistrarproofizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RegistrarproofizabilityRolloutCheck[]
  guidance: string
}

export type RegistrarproofizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRegistrarproofizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRegistrarproofizabilityRollout(
  input: RegistrarproofizabilityRolloutInput,
): RegistrarproofizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const registrarproofizabilityTableCoverageComplete =
    input.existingRegistrarproofizabilityTableCount === CRITICAL_REGISTRARPROOFIZABILITY_TABLES.length

  const checks: RegistrarproofizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL registrarproofizability checks can reach the database.'
            : 'Production registrarproofizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'registrarproofizability_signal_table_coverage',
      label: 'Registrarproofizability signal table coverage',
      status: registrarproofizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Registrarproofizability signal table coverage is only enforced in production.'
          : registrarproofizabilityTableCoverageComplete
            ? `${input.existingRegistrarproofizabilityTableCount}/${CRITICAL_REGISTRARPROOFIZABILITY_TABLES.length} registrarproofizability signal tables are present.`
            : `${input.existingRegistrarproofizabilityTableCount}/${CRITICAL_REGISTRARPROOFIZABILITY_TABLES.length} registrarproofizability signal tables were found.`,
    },
    {
      name: 'shield_scan_registrarproofizability',
      label: 'Shield scan registrarproofizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan registrarproofizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan registrarproofizability signals.'
            : 'Production registrarproofizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_registrarproofizability',
      label: 'Provider credential registrarproofizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential registrarproofizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential registrarproofizability signals.'
            : 'Production registrarproofizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          registrarproofizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              registrarproofizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production registrarproofizability rollout requires PostgreSQL connectivity, registrarproofizability tables, shield scan registrarproofizability, provider credential registrarproofizability, and full signal coverage.',
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
        ? 'Production registrarproofizability rollout checks passed. Registrarproofizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production registrarproofizability rollout is not ready. Resolve failed checks before relying on production registrarproofizability tooling.',
  }
}
