import type { ApiEnv } from '../config/env.js'

export const CRITICAL_ENCAPSULIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type EncapsulizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type EncapsulizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: EncapsulizabilityRolloutCheck[]
  guidance: string
}

export type EncapsulizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingEncapsulizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateEncapsulizabilityRollout(
  input: EncapsulizabilityRolloutInput,
): EncapsulizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const encapsulizabilityTableCoverageComplete =
    input.existingEncapsulizabilityTableCount === CRITICAL_ENCAPSULIZABILITY_TABLES.length

  const checks: EncapsulizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL encapsulizability checks can reach the database.'
            : 'Production encapsulizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'encapsulizability_signal_table_coverage',
      label: 'Encapsulizability signal table coverage',
      status: encapsulizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Encapsulizability signal table coverage is only enforced in production.'
          : encapsulizabilityTableCoverageComplete
            ? `${input.existingEncapsulizabilityTableCount}/${CRITICAL_ENCAPSULIZABILITY_TABLES.length} encapsulizability signal tables are present.`
            : `${input.existingEncapsulizabilityTableCount}/${CRITICAL_ENCAPSULIZABILITY_TABLES.length} encapsulizability signal tables were found.`,
    },
    {
      name: 'shield_scan_encapsulizability',
      label: 'Shield scan encapsulizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan encapsulizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan encapsulizability signals.'
            : 'Production encapsulizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_encapsulizability',
      label: 'Provider credential encapsulizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential encapsulizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential encapsulizability signals.'
            : 'Production encapsulizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'encapsulization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          encapsulizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              encapsulizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support encapsulization readiness.'
            : 'Production encapsulizability rollout requires PostgreSQL connectivity, encapsulizability tables, shield scan encapsulizability, provider credential encapsulizability, and full signal coverage.',
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
        ? 'Production encapsulizability rollout checks passed. Encapsulizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production encapsulizability rollout is not ready. Resolve failed checks before relying on production encapsulizability tooling.',
  }
}
