import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PARTITIONIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type PartitionizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PartitionizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PartitionizabilityRolloutCheck[]
  guidance: string
}

export type PartitionizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPartitionizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluatePartitionizabilityRollout(
  input: PartitionizabilityRolloutInput,
): PartitionizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const partitionizabilityTableCoverageComplete =
    input.existingPartitionizabilityTableCount === CRITICAL_PARTITIONIZABILITY_TABLES.length

  const checks: PartitionizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL partitionizability checks can reach the database.'
            : 'Production partitionizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'partitionizability_signal_table_coverage',
      label: 'Partitionizability signal table coverage',
      status: partitionizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Partitionizability signal table coverage is only enforced in production.'
          : partitionizabilityTableCoverageComplete
            ? `${input.existingPartitionizabilityTableCount}/${CRITICAL_PARTITIONIZABILITY_TABLES.length} partitionizability signal tables are present.`
            : `${input.existingPartitionizabilityTableCount}/${CRITICAL_PARTITIONIZABILITY_TABLES.length} partitionizability signal tables were found.`,
    },
    {
      name: 'shield_scan_partitionizability',
      label: 'Shield scan partitionizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan partitionizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan partitionizability signals.'
            : 'Production partitionizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_partitionizability',
      label: 'Provider credential partitionizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential partitionizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential partitionizability signals.'
            : 'Production partitionizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'partitionization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          partitionizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              partitionizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support partitionization readiness.'
            : 'Production partitionizability rollout requires PostgreSQL connectivity, partitionizability tables, shield scan partitionizability, provider credential partitionizability, and full signal coverage.',
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
        ? 'Production partitionizability rollout checks passed. Partitionizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production partitionizability rollout is not ready. Resolve failed checks before relying on production partitionizability tooling.',
  }
}
