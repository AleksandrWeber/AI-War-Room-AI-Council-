import type { ApiEnv } from '../config/env.js'

export const CRITICAL_INDUCTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type InductizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type InductizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: InductizabilityRolloutCheck[]
  guidance: string
}

export type InductizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingInductizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateInductizabilityRollout(
  input: InductizabilityRolloutInput,
): InductizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const inductizabilityTableCoverageComplete =
    input.existingInductizabilityTableCount === CRITICAL_INDUCTIZABILITY_TABLES.length

  const checks: InductizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL inductizability checks can reach the database.'
            : 'Production inductizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'inductizability_signal_table_coverage',
      label: 'Inductizability signal table coverage',
      status: inductizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Inductizability signal table coverage is only enforced in production.'
          : inductizabilityTableCoverageComplete
            ? `${input.existingInductizabilityTableCount}/${CRITICAL_INDUCTIZABILITY_TABLES.length} inductizability signal tables are present.`
            : `${input.existingInductizabilityTableCount}/${CRITICAL_INDUCTIZABILITY_TABLES.length} inductizability signal tables were found.`,
    },
    {
      name: 'shield_scan_inductizability',
      label: 'Shield scan inductizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan inductizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan inductizability signals.'
            : 'Production inductizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_inductizability',
      label: 'Provider credential inductizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential inductizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential inductizability signals.'
            : 'Production inductizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'inductization_readiness_signal',
      label: 'Inductization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          inductizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Inductization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              inductizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support inductization readiness.'
            : 'Production inductizability rollout requires PostgreSQL connectivity, inductizability tables, shield scan inductizability, provider credential inductizability, and full signal coverage.',
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
        ? 'Production inductizability rollout checks passed. Inductizability coverage and inductization readiness signal signals are healthy.'
        : 'Production inductizability rollout is not ready. Resolve failed checks before relying on production inductizability tooling.',
  }
}
