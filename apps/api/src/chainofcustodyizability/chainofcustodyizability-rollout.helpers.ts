import type { ApiEnv } from '../config/env.js'

export const CRITICAL_CHAINOFCUSTODYIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ChainofcustodyizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ChainofcustodyizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ChainofcustodyizabilityRolloutCheck[]
  guidance: string
}

export type ChainofcustodyizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingChainofcustodyizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateChainofcustodyizabilityRollout(
  input: ChainofcustodyizabilityRolloutInput,
): ChainofcustodyizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const chainofcustodyizabilityTableCoverageComplete =
    input.existingChainofcustodyizabilityTableCount === CRITICAL_CHAINOFCUSTODYIZABILITY_TABLES.length

  const checks: ChainofcustodyizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL chainofcustodyizability checks can reach the database.'
            : 'Production chainofcustodyizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'chainofcustodyizability_signal_table_coverage',
      label: 'Chainofcustodyizability signal table coverage',
      status: chainofcustodyizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Chainofcustodyizability signal table coverage is only enforced in production.'
          : chainofcustodyizabilityTableCoverageComplete
            ? `${input.existingChainofcustodyizabilityTableCount}/${CRITICAL_CHAINOFCUSTODYIZABILITY_TABLES.length} chainofcustodyizability signal tables are present.`
            : `${input.existingChainofcustodyizabilityTableCount}/${CRITICAL_CHAINOFCUSTODYIZABILITY_TABLES.length} chainofcustodyizability signal tables were found.`,
    },
    {
      name: 'shield_scan_chainofcustodyizability',
      label: 'Shield scan chainofcustodyizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan chainofcustodyizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan chainofcustodyizability signals.'
            : 'Production chainofcustodyizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_chainofcustodyizability',
      label: 'Provider credential chainofcustodyizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential chainofcustodyizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential chainofcustodyizability signals.'
            : 'Production chainofcustodyizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          chainofcustodyizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              chainofcustodyizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production chainofcustodyizability rollout requires PostgreSQL connectivity, chainofcustodyizability tables, shield scan chainofcustodyizability, provider credential chainofcustodyizability, and full signal coverage.',
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
        ? 'Production chainofcustodyizability rollout checks passed. Chainofcustodyizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production chainofcustodyizability rollout is not ready. Resolve failed checks before relying on production chainofcustodyizability tooling.',
  }
}
