import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HANDOFFIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type HandoffizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HandoffizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HandoffizabilityRolloutCheck[]
  guidance: string
}

export type HandoffizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHandoffizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateHandoffizabilityRollout(
  input: HandoffizabilityRolloutInput,
): HandoffizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const handoffizabilityTableCoverageComplete =
    input.existingHandoffizabilityTableCount === CRITICAL_HANDOFFIZABILITY_TABLES.length

  const checks: HandoffizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL handoffizability checks can reach the database.'
            : 'Production handoffizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'handoffizability_signal_table_coverage',
      label: 'Handoffizability signal table coverage',
      status: handoffizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Handoffizability signal table coverage is only enforced in production.'
          : handoffizabilityTableCoverageComplete
            ? `${input.existingHandoffizabilityTableCount}/${CRITICAL_HANDOFFIZABILITY_TABLES.length} handoffizability signal tables are present.`
            : `${input.existingHandoffizabilityTableCount}/${CRITICAL_HANDOFFIZABILITY_TABLES.length} handoffizability signal tables were found.`,
    },
    {
      name: 'shield_scan_handoffizability',
      label: 'Shield scan handoffizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan handoffizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan handoffizability signals.'
            : 'Production handoffizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_handoffizability',
      label: 'Provider credential handoffizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential handoffizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential handoffizability signals.'
            : 'Production handoffizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'handoffization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          handoffizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              handoffizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support handoffization readiness.'
            : 'Production handoffizability rollout requires PostgreSQL connectivity, handoffizability tables, shield scan handoffizability, provider credential handoffizability, and full signal coverage.',
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
        ? 'Production handoffizability rollout checks passed. Handoffizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production handoffizability rollout is not ready. Resolve failed checks before relying on production handoffizability tooling.',
  }
}
