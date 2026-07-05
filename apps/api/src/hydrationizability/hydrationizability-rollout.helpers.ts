import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HYDRATIONIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type HydrationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HydrationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HydrationizabilityRolloutCheck[]
  guidance: string
}

export type HydrationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHydrationizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateHydrationizabilityRollout(
  input: HydrationizabilityRolloutInput,
): HydrationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const hydrationizabilityTableCoverageComplete =
    input.existingHydrationizabilityTableCount === CRITICAL_HYDRATIONIZABILITY_TABLES.length

  const checks: HydrationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL hydrationizability checks can reach the database.'
            : 'Production hydrationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'hydrationizability_signal_table_coverage',
      label: 'Hydrationizability signal table coverage',
      status: hydrationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Hydrationizability signal table coverage is only enforced in production.'
          : hydrationizabilityTableCoverageComplete
            ? `${input.existingHydrationizabilityTableCount}/${CRITICAL_HYDRATIONIZABILITY_TABLES.length} hydrationizability signal tables are present.`
            : `${input.existingHydrationizabilityTableCount}/${CRITICAL_HYDRATIONIZABILITY_TABLES.length} hydrationizability signal tables were found.`,
    },
    {
      name: 'shield_scan_hydrationizability',
      label: 'Shield scan hydrationizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan hydrationizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan hydrationizability signals.'
            : 'Production hydrationizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_hydrationizability',
      label: 'Provider credential hydrationizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential hydrationizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential hydrationizability signals.'
            : 'Production hydrationizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'hydrationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          hydrationizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              hydrationizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support hydrationization readiness.'
            : 'Production hydrationizability rollout requires PostgreSQL connectivity, hydrationizability tables, shield scan hydrationizability, provider credential hydrationizability, and full signal coverage.',
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
        ? 'Production hydrationizability rollout checks passed. Hydrationizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production hydrationizability rollout is not ready. Resolve failed checks before relying on production hydrationizability tooling.',
  }
}
