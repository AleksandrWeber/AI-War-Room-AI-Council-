import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INTEGRABILIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type IntegrabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IntegrabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IntegrabilizabilityRolloutCheck[]
  guidance: string
}

export type IntegrabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingIntegrabilizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateIntegrabilizabilityRollout(
  input: IntegrabilizabilityRolloutInput,
): IntegrabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const integrabilizabilityTableCoverageComplete =
    input.existingIntegrabilizabilityTableCount === CRITICAL_INTEGRABILIZABILITY_TABLES.length

  const checks: IntegrabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL integrabilizability checks can reach the database.'
            : 'Production integrabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'integrabilizability_signal_table_coverage',
      label: 'Integrabilizability signal table coverage',
      status: integrabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Integrabilizability signal table coverage is only enforced in production.'
          : integrabilizabilityTableCoverageComplete
            ? `${input.existingIntegrabilizabilityTableCount}/${CRITICAL_INTEGRABILIZABILITY_TABLES.length} integrabilizability signal tables are present.`
            : `${input.existingIntegrabilizabilityTableCount}/${CRITICAL_INTEGRABILIZABILITY_TABLES.length} integrabilizability signal tables were found.`,
    },
    {
      name: 'shield_scan_integrabilizability',
      label: 'Shield scan integrabilizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan integrabilizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan integrabilizability signals.'
            : 'Production integrabilizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_integrabilizability',
      label: 'Provider credential integrabilizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential integrabilizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential integrabilizability signals.'
            : 'Production integrabilizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'integrabilization_readiness_signal',
      label: 'Integrabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          integrabilizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Integrabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              integrabilizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support integrabilization readiness.'
            : 'Production integrabilizability rollout requires PostgreSQL connectivity, integrabilizability tables, shield scan integrabilizability, provider credential integrabilizability, and full signal coverage.',
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
        ? 'Production integrabilizability rollout checks passed. Integrabilizability coverage and integrabilization readiness signal signals are healthy.'
        : 'Production integrabilizability rollout is not ready. Resolve failed checks before relying on production integrabilizability tooling.',
  }
}
