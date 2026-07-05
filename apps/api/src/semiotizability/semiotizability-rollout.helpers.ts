import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SEMIOTIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type SemiotizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SemiotizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SemiotizabilityRolloutCheck[]
  guidance: string
}

export type SemiotizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSemiotizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateSemiotizabilityRollout(
  input: SemiotizabilityRolloutInput,
): SemiotizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const semiotizabilityTableCoverageComplete =
    input.existingSemiotizabilityTableCount === CRITICAL_SEMIOTIZABILITY_TABLES.length

  const checks: SemiotizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL semiotizability checks can reach the database.'
            : 'Production semiotizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'semiotizability_signal_table_coverage',
      label: 'Semiotizability signal table coverage',
      status: semiotizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Semiotizability signal table coverage is only enforced in production.'
          : semiotizabilityTableCoverageComplete
            ? `${input.existingSemiotizabilityTableCount}/${CRITICAL_SEMIOTIZABILITY_TABLES.length} semiotizability signal tables are present.`
            : `${input.existingSemiotizabilityTableCount}/${CRITICAL_SEMIOTIZABILITY_TABLES.length} semiotizability signal tables were found.`,
    },
    {
      name: 'shield_scan_semiotizability',
      label: 'Shield scan semiotizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan semiotizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan semiotizability signals.'
            : 'Production semiotizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_semiotizability',
      label: 'Provider credential semiotizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential semiotizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential semiotizability signals.'
            : 'Production semiotizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'semiotization_readiness_signal',
      label: 'Semiotization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          semiotizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Semiotization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              semiotizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support semiotization readiness.'
            : 'Production semiotizability rollout requires PostgreSQL connectivity, semiotizability tables, shield scan semiotizability, provider credential semiotizability, and full signal coverage.',
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
        ? 'Production semiotizability rollout checks passed. Semiotizability coverage and semiotization readiness signal signals are healthy.'
        : 'Production semiotizability rollout is not ready. Resolve failed checks before relying on production semiotizability tooling.',
  }
}
