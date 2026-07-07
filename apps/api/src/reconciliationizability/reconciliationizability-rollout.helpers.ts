import type { ApiEnv } from '../config/env.js'

export const CRITICAL_RECONCILIATIONIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ReconciliationizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ReconciliationizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ReconciliationizabilityRolloutCheck[]
  guidance: string
}

export type ReconciliationizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingReconciliationizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateReconciliationizabilityRollout(
  input: ReconciliationizabilityRolloutInput,
): ReconciliationizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const reconciliationizabilityTableCoverageComplete =
    input.existingReconciliationizabilityTableCount === CRITICAL_RECONCILIATIONIZABILITY_TABLES.length

  const checks: ReconciliationizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL reconciliationizability checks can reach the database.'
            : 'Production reconciliationizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'reconciliationizability_signal_table_coverage',
      label: 'Reconciliationizability signal table coverage',
      status: reconciliationizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Reconciliationizability signal table coverage is only enforced in production.'
          : reconciliationizabilityTableCoverageComplete
            ? `${input.existingReconciliationizabilityTableCount}/${CRITICAL_RECONCILIATIONIZABILITY_TABLES.length} reconciliationizability signal tables are present.`
            : `${input.existingReconciliationizabilityTableCount}/${CRITICAL_RECONCILIATIONIZABILITY_TABLES.length} reconciliationizability signal tables were found.`,
    },
    {
      name: 'shield_scan_reconciliationizability',
      label: 'Shield scan reconciliationizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan reconciliationizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan reconciliationizability signals.'
            : 'Production reconciliationizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_reconciliationizability',
      label: 'Provider credential reconciliationizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential reconciliationizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential reconciliationizability signals.'
            : 'Production reconciliationizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          reconciliationizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              reconciliationizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production reconciliationizability rollout requires PostgreSQL connectivity, reconciliationizability tables, shield scan reconciliationizability, provider credential reconciliationizability, and full signal coverage.',
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
        ? 'Production reconciliationizability rollout checks passed. Reconciliationizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production reconciliationizability rollout is not ready. Resolve failed checks before relying on production reconciliationizability tooling.',
  }
}
