import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PROOFLINEIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type ProoflineizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProoflineizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProoflineizabilityRolloutCheck[]
  guidance: string
}

export type ProoflineizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingProoflineizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateProoflineizabilityRollout(
  input: ProoflineizabilityRolloutInput,
): ProoflineizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const prooflineizabilityTableCoverageComplete =
    input.existingProoflineizabilityTableCount === CRITICAL_PROOFLINEIZABILITY_TABLES.length

  const checks: ProoflineizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL prooflineizability checks can reach the database.'
            : 'Production prooflineizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'prooflineizability_signal_table_coverage',
      label: 'Prooflineizability signal table coverage',
      status: prooflineizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Prooflineizability signal table coverage is only enforced in production.'
          : prooflineizabilityTableCoverageComplete
            ? `${input.existingProoflineizabilityTableCount}/${CRITICAL_PROOFLINEIZABILITY_TABLES.length} prooflineizability signal tables are present.`
            : `${input.existingProoflineizabilityTableCount}/${CRITICAL_PROOFLINEIZABILITY_TABLES.length} prooflineizability signal tables were found.`,
    },
    {
      name: 'shield_scan_prooflineizability',
      label: 'Shield scan prooflineizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan prooflineizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan prooflineizability signals.'
            : 'Production prooflineizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_prooflineizability',
      label: 'Provider credential prooflineizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential prooflineizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential prooflineizability signals.'
            : 'Production prooflineizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          prooflineizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              prooflineizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production prooflineizability rollout requires PostgreSQL connectivity, prooflineizability tables, shield scan prooflineizability, provider credential prooflineizability, and full signal coverage.',
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
        ? 'Production prooflineizability rollout checks passed. Prooflineizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production prooflineizability rollout is not ready. Resolve failed checks before relying on production prooflineizability tooling.',
  }
}
