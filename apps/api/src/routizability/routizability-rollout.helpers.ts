import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ROUTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type RoutizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RoutizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RoutizabilityRolloutCheck[]
  guidance: string
}

export type RoutizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingRoutizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateRoutizabilityRollout(
  input: RoutizabilityRolloutInput,
): RoutizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const routizabilityTableCoverageComplete =
    input.existingRoutizabilityTableCount === CRITICAL_ROUTIZABILITY_TABLES.length

  const checks: RoutizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL routizability checks can reach the database.'
            : 'Production routizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'routizability_signal_table_coverage',
      label: 'Routizability signal table coverage',
      status: routizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Routizability signal table coverage is only enforced in production.'
          : routizabilityTableCoverageComplete
            ? `${input.existingRoutizabilityTableCount}/${CRITICAL_ROUTIZABILITY_TABLES.length} routizability signal tables are present.`
            : `${input.existingRoutizabilityTableCount}/${CRITICAL_ROUTIZABILITY_TABLES.length} routizability signal tables were found.`,
    },
    {
      name: 'shield_scan_routizability',
      label: 'Shield scan routizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan routizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan routizability signals.'
            : 'Production routizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_routizability',
      label: 'Provider credential routizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential routizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential routizability signals.'
            : 'Production routizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'routization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          routizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              routizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support routization readiness.'
            : 'Production routizability rollout requires PostgreSQL connectivity, routizability tables, shield scan routizability, provider credential routizability, and full signal coverage.',
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
        ? 'Production routizability rollout checks passed. Routizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production routizability rollout is not ready. Resolve failed checks before relying on production routizability tooling.',
  }
}
