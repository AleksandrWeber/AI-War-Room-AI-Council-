import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SCALABILIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ScalabilizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ScalabilizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ScalabilizabilityRolloutCheck[]
  guidance: string
}

export type ScalabilizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingScalabilizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateScalabilizabilityRollout(
  input: ScalabilizabilityRolloutInput,
): ScalabilizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const scalabilizabilityTableCoverageComplete =
    input.existingScalabilizabilityTableCount === CRITICAL_SCALABILIZABILITY_TABLES.length

  const checks: ScalabilizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL scalabilizability checks can reach the database.'
            : 'Production scalabilizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'scalabilizability_signal_table_coverage',
      label: 'Scalabilizability signal table coverage',
      status: scalabilizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Scalabilizability signal table coverage is only enforced in production.'
          : scalabilizabilityTableCoverageComplete
            ? `${input.existingScalabilizabilityTableCount}/${CRITICAL_SCALABILIZABILITY_TABLES.length} scalabilizability signal tables are present.`
            : `${input.existingScalabilizabilityTableCount}/${CRITICAL_SCALABILIZABILITY_TABLES.length} scalabilizability signal tables were found.`,
    },
    {
      name: 'shield_scan_scalabilizability',
      label: 'Shield scan scalabilizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan scalabilizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan scalabilizability signals.'
            : 'Production scalabilizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_scalabilizability',
      label: 'Provider credential scalabilizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential scalabilizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential scalabilizability signals.'
            : 'Production scalabilizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'scalabilization_readiness_signal',
      label: 'Scalabilization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          scalabilizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Scalabilization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              scalabilizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support scalabilization readiness.'
            : 'Production scalabilizability rollout requires PostgreSQL connectivity, scalabilizability tables, shield scan scalabilizability, provider credential scalabilizability, and full signal coverage.',
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
        ? 'Production scalabilizability rollout checks passed. Scalabilizability coverage and scalabilization readiness signal signals are healthy.'
        : 'Production scalabilizability rollout is not ready. Resolve failed checks before relying on production scalabilizability tooling.',
  }
}
