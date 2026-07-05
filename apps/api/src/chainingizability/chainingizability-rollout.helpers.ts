import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CHAININGIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ChainingizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ChainingizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ChainingizabilityRolloutCheck[]
  guidance: string
}

export type ChainingizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingChainingizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateChainingizabilityRollout(
  input: ChainingizabilityRolloutInput,
): ChainingizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const chainingizabilityTableCoverageComplete =
    input.existingChainingizabilityTableCount === CRITICAL_CHAININGIZABILITY_TABLES.length

  const checks: ChainingizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL chainingizability checks can reach the database.'
            : 'Production chainingizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'chainingizability_signal_table_coverage',
      label: 'Chainingizability signal table coverage',
      status: chainingizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Chainingizability signal table coverage is only enforced in production.'
          : chainingizabilityTableCoverageComplete
            ? `${input.existingChainingizabilityTableCount}/${CRITICAL_CHAININGIZABILITY_TABLES.length} chainingizability signal tables are present.`
            : `${input.existingChainingizabilityTableCount}/${CRITICAL_CHAININGIZABILITY_TABLES.length} chainingizability signal tables were found.`,
    },
    {
      name: 'shield_scan_chainingizability',
      label: 'Shield scan chainingizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan chainingizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan chainingizability signals.'
            : 'Production chainingizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_chainingizability',
      label: 'Provider credential chainingizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential chainingizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential chainingizability signals.'
            : 'Production chainingizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'chainingization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          chainingizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              chainingizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support chainingization readiness.'
            : 'Production chainingizability rollout requires PostgreSQL connectivity, chainingizability tables, shield scan chainingizability, provider credential chainingizability, and full signal coverage.',
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
        ? 'Production chainingizability rollout checks passed. Chainingizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production chainingizability rollout is not ready. Resolve failed checks before relying on production chainingizability tooling.',
  }
}
