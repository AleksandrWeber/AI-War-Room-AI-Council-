import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROOFREGISTRYIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ProofregistryizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProofregistryizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProofregistryizabilityRolloutCheck[]
  guidance: string
}

export type ProofregistryizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProofregistryizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateProofregistryizabilityRollout(
  input: ProofregistryizabilityRolloutInput,
): ProofregistryizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const proofregistryizabilityTableCoverageComplete =
    input.existingProofregistryizabilityTableCount === CRITICAL_PROOFREGISTRYIZABILITY_TABLES.length

  const checks: ProofregistryizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL proofregistryizability checks can reach the database.'
            : 'Production proofregistryizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'proofregistryizability_signal_table_coverage',
      label: 'Proofregistryizability signal table coverage',
      status: proofregistryizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Proofregistryizability signal table coverage is only enforced in production.'
          : proofregistryizabilityTableCoverageComplete
            ? `${input.existingProofregistryizabilityTableCount}/${CRITICAL_PROOFREGISTRYIZABILITY_TABLES.length} proofregistryizability signal tables are present.`
            : `${input.existingProofregistryizabilityTableCount}/${CRITICAL_PROOFREGISTRYIZABILITY_TABLES.length} proofregistryizability signal tables were found.`,
    },
    {
      name: 'shield_scan_proofregistryizability',
      label: 'Shield scan proofregistryizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan proofregistryizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan proofregistryizability signals.'
            : 'Production proofregistryizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_proofregistryizability',
      label: 'Provider credential proofregistryizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential proofregistryizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential proofregistryizability signals.'
            : 'Production proofregistryizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          proofregistryizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              proofregistryizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production proofregistryizability rollout requires PostgreSQL connectivity, proofregistryizability tables, shield scan proofregistryizability, provider credential proofregistryizability, and full signal coverage.',
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
        ? 'Production proofregistryizability rollout checks passed. Proofregistryizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production proofregistryizability rollout is not ready. Resolve failed checks before relying on production proofregistryizability tooling.',
  }
}
