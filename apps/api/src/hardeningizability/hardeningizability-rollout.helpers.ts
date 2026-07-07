import type { ApiEnv } from '../config/env.js'

export const CRITICAL_HARDENINGIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type HardeningizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type HardeningizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: HardeningizabilityRolloutCheck[]
  guidance: string
}

export type HardeningizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingHardeningizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateHardeningizabilityRollout(
  input: HardeningizabilityRolloutInput,
): HardeningizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const hardeningizabilityTableCoverageComplete =
    input.existingHardeningizabilityTableCount === CRITICAL_HARDENINGIZABILITY_TABLES.length

  const checks: HardeningizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL hardeningizability checks can reach the database.'
            : 'Production hardeningizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'hardeningizability_signal_table_coverage',
      label: 'Hardeningizability signal table coverage',
      status: hardeningizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Hardeningizability signal table coverage is only enforced in production.'
          : hardeningizabilityTableCoverageComplete
            ? `${input.existingHardeningizabilityTableCount}/${CRITICAL_HARDENINGIZABILITY_TABLES.length} hardeningizability signal tables are present.`
            : `${input.existingHardeningizabilityTableCount}/${CRITICAL_HARDENINGIZABILITY_TABLES.length} hardeningizability signal tables were found.`,
    },
    {
      name: 'shield_scan_hardeningizability',
      label: 'Shield scan hardeningizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan hardeningizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan hardeningizability signals.'
            : 'Production hardeningizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_hardeningizability',
      label: 'Provider credential hardeningizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential hardeningizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential hardeningizability signals.'
            : 'Production hardeningizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          hardeningizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              hardeningizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production hardeningizability rollout requires PostgreSQL connectivity, hardeningizability tables, shield scan hardeningizability, provider credential hardeningizability, and full signal coverage.',
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
        ? 'Production hardeningizability rollout checks passed. Hardeningizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production hardeningizability rollout is not ready. Resolve failed checks before relying on production hardeningizability tooling.',
  }
}
