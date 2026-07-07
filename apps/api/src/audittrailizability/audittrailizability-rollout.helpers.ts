import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDITTRAILIZABILITY_TABLES = [
  'shield_scans',
  'workspace_provider_credentials',
  'billing_webhook_events',
] as const

export type AudittrailizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AudittrailizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AudittrailizabilityRolloutCheck[]
  guidance: string
}

export type AudittrailizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAudittrailizabilityTableCount: number
  shieldScansTableExists: boolean
  workspaceProviderCredentialsTableExists: boolean
  billingWebhookEventsTableExists: boolean
}

export function evaluateAudittrailizabilityRollout(
  input: AudittrailizabilityRolloutInput,
): AudittrailizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const audittrailizabilityTableCoverageComplete =
    input.existingAudittrailizabilityTableCount === CRITICAL_AUDITTRAILIZABILITY_TABLES.length

  const checks: AudittrailizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL audittrailizability checks can reach the database.'
            : 'Production audittrailizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'audittrailizability_signal_table_coverage',
      label: 'Audittrailizability signal table coverage',
      status: audittrailizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Audittrailizability signal table coverage is only enforced in production.'
          : audittrailizabilityTableCoverageComplete
            ? `${input.existingAudittrailizabilityTableCount}/${CRITICAL_AUDITTRAILIZABILITY_TABLES.length} audittrailizability signal tables are present.`
            : `${input.existingAudittrailizabilityTableCount}/${CRITICAL_AUDITTRAILIZABILITY_TABLES.length} audittrailizability signal tables were found.`,
    },
    {
      name: 'shield_scan_audittrailizability',
      label: 'Shield scan audittrailizability',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield scan audittrailizability is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield scan audittrailizability signals.'
            : 'Production audittrailizability rollout requires a shield_scans table.',
    },
    {
      name: 'provider_credential_audittrailizability',
      label: 'Provider credential audittrailizability',
      status: input.workspaceProviderCredentialsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Provider credential audittrailizability is only enforced in production.'
          : input.workspaceProviderCredentialsTableExists
            ? 'workspace_provider_credentials table is available for provider credential audittrailizability signals.'
            : 'Production audittrailizability rollout requires a workspace_provider_credentials table.',
    },
    {
      name: 'reconciliationization_readiness_signal',
      label: 'Encapsulization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          audittrailizabilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.workspaceProviderCredentialsTableExists &&
          input.billingWebhookEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Encapsulization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              audittrailizabilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.workspaceProviderCredentialsTableExists &&
              input.billingWebhookEventsTableExists
            ? 'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.'
            : 'Production audittrailizability rollout requires PostgreSQL connectivity, audittrailizability tables, shield scan audittrailizability, provider credential audittrailizability, and full signal coverage.',
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
        ? 'Production audittrailizability rollout checks passed. Audittrailizability coverage and encapsulization readiness signal signals are healthy.'
        : 'Production audittrailizability rollout is not ready. Resolve failed checks before relying on production audittrailizability tooling.',
  }
}
