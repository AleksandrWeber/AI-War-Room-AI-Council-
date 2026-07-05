import type { ApiEnv } from '../config/env.js'

export const CRITICAL_MEMORIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type MemorizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type MemorizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: MemorizabilityRolloutCheck[]
  guidance: string
}

export type MemorizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingMemorizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateMemorizabilityRollout(
  input: MemorizabilityRolloutInput,
): MemorizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const memorizabilityTableCoverageComplete =
    input.existingMemorizabilityTableCount === CRITICAL_MEMORIZABILITY_TABLES.length

  const checks: MemorizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL memorizability checks can reach the database.'
            : 'Production memorizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'memorizability_signal_table_coverage',
      label: 'Memorizability signal table coverage',
      status: memorizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Memorizability signal table coverage is only enforced in production.'
          : memorizabilityTableCoverageComplete
            ? `${input.existingMemorizabilityTableCount}/${CRITICAL_MEMORIZABILITY_TABLES.length} memorizability signal tables are present.`
            : `${input.existingMemorizabilityTableCount}/${CRITICAL_MEMORIZABILITY_TABLES.length} memorizability signal tables were found.`,
    },
    {
      name: 'shield_scan_memorizability',
      label: 'Shield scan memorizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan memorizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan memorizability signals.'
            : 'Production memorizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_memorizability',
      label: 'Provider credential memorizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential memorizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential memorizability signals.'
            : 'Production memorizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'memorization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          memorizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              memorizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support memorization readiness.'
            : 'Production memorizability rollout requires PostgreSQL connectivity, memorizability tables, shield scan memorizability, provider credential memorizability, and full signal coverage.',
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
        ? 'Production memorizability rollout checks passed. Memorizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production memorizability rollout is not ready. Resolve failed checks before relying on production memorizability tooling.',
  }
}
