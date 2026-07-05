import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BIBLIOGRAPHIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type BibliographizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BibliographizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BibliographizabilityRolloutCheck[]
  guidance: string
}

export type BibliographizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBibliographizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateBibliographizabilityRollout(
  input: BibliographizabilityRolloutInput,
): BibliographizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const bibliographizabilityTableCoverageComplete =
    input.existingBibliographizabilityTableCount === CRITICAL_BIBLIOGRAPHIZABILITY_TABLES.length

  const checks: BibliographizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL bibliographizability checks can reach the database.'
            : 'Production bibliographizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'bibliographizability_signal_table_coverage',
      label: 'Bibliographizability signal table coverage',
      status: bibliographizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Bibliographizability signal table coverage is only enforced in production.'
          : bibliographizabilityTableCoverageComplete
            ? `${input.existingBibliographizabilityTableCount}/${CRITICAL_BIBLIOGRAPHIZABILITY_TABLES.length} bibliographizability signal tables are present.`
            : `${input.existingBibliographizabilityTableCount}/${CRITICAL_BIBLIOGRAPHIZABILITY_TABLES.length} bibliographizability signal tables were found.`,
    },
    {
      name: 'shield_scan_bibliographizability',
      label: 'Shield scan bibliographizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan bibliographizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan bibliographizability signals.'
            : 'Production bibliographizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_bibliographizability',
      label: 'Provider credential bibliographizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential bibliographizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential bibliographizability signals.'
            : 'Production bibliographizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'bibliographization_readiness_signal',
      label: 'Bibliographization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          bibliographizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Bibliographization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              bibliographizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support bibliographization readiness.'
            : 'Production bibliographizability rollout requires PostgreSQL connectivity, bibliographizability tables, shield scan bibliographizability, provider credential bibliographizability, and full signal coverage.',
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
        ? 'Production bibliographizability rollout checks passed. Bibliographizability coverage and bibliographization readiness signal signals are healthy.'
        : 'Production bibliographizability rollout is not ready. Resolve failed checks before relying on production bibliographizability tooling.',
  }
}
