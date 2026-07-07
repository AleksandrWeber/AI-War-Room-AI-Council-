import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ASSURANCEIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type AssuranceizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AssuranceizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AssuranceizabilityRolloutCheck[]
  guidance: string
}

export type AssuranceizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAssuranceizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAssuranceizabilityRollout(
  input: AssuranceizabilityRolloutInput,
): AssuranceizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const assuranceizabilityTableCoverageComplete =
    input.existingAssuranceizabilityTableCount === CRITICAL_ASSURANCEIZABILITY_TABLES.length

  const checks: AssuranceizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL assuranceizability checks can reach the database.'
            : 'Production assuranceizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'assuranceizability_signal_table_coverage',
      label: 'Assuranceizability signal table coverage',
      status: assuranceizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Assuranceizability signal table coverage is only enforced in production.'
          : assuranceizabilityTableCoverageComplete
            ? `${input.existingAssuranceizabilityTableCount}/${CRITICAL_ASSURANCEIZABILITY_TABLES.length} assuranceizability signal tables are present.`
            : `${input.existingAssuranceizabilityTableCount}/${CRITICAL_ASSURANCEIZABILITY_TABLES.length} assuranceizability signal tables were found.`,
    },
    {
      name: 'shield_scan_assuranceizability',
      label: 'Shield scan assuranceizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan assuranceizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan assuranceizability signals.'
            : 'Production assuranceizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_assuranceizability',
      label: 'Provider credential assuranceizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential assuranceizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential assuranceizability signals.'
            : 'Production assuranceizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          assuranceizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              assuranceizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production assuranceizability rollout requires PostgreSQL connectivity, assuranceizability tables, shield scan assuranceizability, provider credential assuranceizability, and full signal coverage.',
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
        ? 'Production assuranceizability rollout checks passed. Assuranceizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production assuranceizability rollout is not ready. Resolve failed checks before relying on production assuranceizability tooling.',
  }
}
