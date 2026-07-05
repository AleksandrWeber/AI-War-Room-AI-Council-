import type { ApiEnv } from '../config/env.js'

export const CRITICAL_GROUPIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type GroupizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type GroupizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: GroupizabilityRolloutCheck[]
  guidance: string
}

export type GroupizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingGroupizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateGroupizabilityRollout(
  input: GroupizabilityRolloutInput,
): GroupizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const groupizabilityTableCoverageComplete =
    input.existingGroupizabilityTableCount === CRITICAL_GROUPIZABILITY_TABLES.length

  const checks: GroupizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL groupizability checks can reach the database.'
            : 'Production groupizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'groupizability_signal_table_coverage',
      label: 'Groupizability signal table coverage',
      status: groupizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Groupizability signal table coverage is only enforced in production.'
          : groupizabilityTableCoverageComplete
            ? `${input.existingGroupizabilityTableCount}/${CRITICAL_GROUPIZABILITY_TABLES.length} groupizability signal tables are present.`
            : `${input.existingGroupizabilityTableCount}/${CRITICAL_GROUPIZABILITY_TABLES.length} groupizability signal tables were found.`,
    },
    {
      name: 'shield_scan_groupizability',
      label: 'Shield scan groupizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan groupizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan groupizability signals.'
            : 'Production groupizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_groupizability',
      label: 'Provider credential groupizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential groupizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential groupizability signals.'
            : 'Production groupizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'groupization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          groupizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              groupizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support groupization readiness.'
            : 'Production groupizability rollout requires PostgreSQL connectivity, groupizability tables, shield scan groupizability, provider credential groupizability, and full signal coverage.',
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
        ? 'Production groupizability rollout checks passed. Groupizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production groupizability rollout is not ready. Resolve failed checks before relying on production groupizability tooling.',
  }
}
