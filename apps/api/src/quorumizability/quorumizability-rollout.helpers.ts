import type { ApiEnv } from '../config/env.js'

export const CRITICAL_QUORUMIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type QuorumizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type QuorumizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: QuorumizabilityRolloutCheck[]
  guidance: string
}

export type QuorumizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingQuorumizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateQuorumizabilityRollout(
  input: QuorumizabilityRolloutInput,
): QuorumizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const quorumizabilityTableCoverageComplete =
    input.existingQuorumizabilityTableCount === CRITICAL_QUORUMIZABILITY_TABLES.length

  const checks: QuorumizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL quorumizability checks can reach the database.'
            : 'Production quorumizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'quorumizability_signal_table_coverage',
      label: 'Quorumizability signal table coverage',
      status: quorumizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Quorumizability signal table coverage is only enforced in production.'
          : quorumizabilityTableCoverageComplete
            ? `${input.existingQuorumizabilityTableCount}/${CRITICAL_QUORUMIZABILITY_TABLES.length} quorumizability signal tables are present.`
            : `${input.existingQuorumizabilityTableCount}/${CRITICAL_QUORUMIZABILITY_TABLES.length} quorumizability signal tables were found.`,
    },
    {
      name: 'shield_scan_quorumizability',
      label: 'Shield scan quorumizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan quorumizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan quorumizability signals.'
            : 'Production quorumizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_quorumizability',
      label: 'Provider credential quorumizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential quorumizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential quorumizability signals.'
            : 'Production quorumizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'quorumization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          quorumizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              quorumizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support quorumization readiness.'
            : 'Production quorumizability rollout requires PostgreSQL connectivity, quorumizability tables, shield scan quorumizability, provider credential quorumizability, and full signal coverage.',
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
        ? 'Production quorumizability rollout checks passed. Quorumizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production quorumizability rollout is not ready. Resolve failed checks before relying on production quorumizability tooling.',
  }
}
