import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NODELIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type NodelizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NodelizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NodelizabilityRolloutCheck[]
  guidance: string
}

export type NodelizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNodelizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateNodelizabilityRollout(
  input: NodelizabilityRolloutInput,
): NodelizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const nodelizabilityTableCoverageComplete =
    input.existingNodelizabilityTableCount === CRITICAL_NODELIZABILITY_TABLES.length

  const checks: NodelizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL nodelizability checks can reach the database.'
            : 'Production nodelizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'nodelizability_signal_table_coverage',
      label: 'Nodelizability signal table coverage',
      status: nodelizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Nodelizability signal table coverage is only enforced in production.'
          : nodelizabilityTableCoverageComplete
            ? `${input.existingNodelizabilityTableCount}/${CRITICAL_NODELIZABILITY_TABLES.length} nodelizability signal tables are present.`
            : `${input.existingNodelizabilityTableCount}/${CRITICAL_NODELIZABILITY_TABLES.length} nodelizability signal tables were found.`,
    },
    {
      name: 'shield_scan_nodelizability',
      label: 'Shield scan nodelizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan nodelizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan nodelizability signals.'
            : 'Production nodelizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_nodelizability',
      label: 'Provider credential nodelizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential nodelizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential nodelizability signals.'
            : 'Production nodelizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'nodelization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          nodelizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              nodelizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support nodelization readiness.'
            : 'Production nodelizability rollout requires PostgreSQL connectivity, nodelizability tables, shield scan nodelizability, provider credential nodelizability, and full signal coverage.',
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
        ? 'Production nodelizability rollout checks passed. Nodelizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production nodelizability rollout is not ready. Resolve failed checks before relying on production nodelizability tooling.',
  }
}
