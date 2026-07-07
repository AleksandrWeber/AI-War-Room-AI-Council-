import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDITABILITYVAULTIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type AuditabilityvaultizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuditabilityvaultizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuditabilityvaultizabilityRolloutCheck[]
  guidance: string
}

export type AuditabilityvaultizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuditabilityvaultizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateAuditabilityvaultizabilityRollout(
  input: AuditabilityvaultizabilityRolloutInput,
): AuditabilityvaultizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const auditabilityvaultizabilityTableCoverageComplete =
    input.existingAuditabilityvaultizabilityTableCount === CRITICAL_AUDITABILITYVAULTIZABILITY_TABLES.length

  const checks: AuditabilityvaultizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL auditabilityvaultizability checks can reach the database.'
            : 'Production auditabilityvaultizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'auditabilityvaultizability_signal_table_coverage',
      label: 'Auditabilityvaultizability signal table coverage',
      status: auditabilityvaultizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Auditabilityvaultizability signal table coverage is only enforced in production.'
          : auditabilityvaultizabilityTableCoverageComplete
            ? `${input.existingAuditabilityvaultizabilityTableCount}/${CRITICAL_AUDITABILITYVAULTIZABILITY_TABLES.length} auditabilityvaultizability signal tables are present.`
            : `${input.existingAuditabilityvaultizabilityTableCount}/${CRITICAL_AUDITABILITYVAULTIZABILITY_TABLES.length} auditabilityvaultizability signal tables were found.`,
    },
    {
      name: 'membership_auditabilityvaultizability',
      label: 'Membership auditabilityvaultizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership auditabilityvaultizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership auditabilityvaultizability signals.'
            : 'Production auditabilityvaultizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_auditabilityvaultizability',
      label: 'Usage event auditabilityvaultizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event auditabilityvaultizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event auditabilityvaultizability signals.'
            : 'Production auditabilityvaultizability rollout requires a usage_events table.',
    },
    {
      name: 'healingization_readiness_signal',
      label: 'Sandboxization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          auditabilityvaultizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Sandboxization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              auditabilityvaultizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support healingization readiness.'
            : 'Production auditabilityvaultizability rollout requires PostgreSQL connectivity, auditabilityvaultizability tables, membership auditabilityvaultizability, usage event auditabilityvaultizability, and full signal coverage.',
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
        ? 'Production auditabilityvaultizability rollout checks passed. Auditabilityvaultizability coverage and sandboxization readiness signal signals are healthy.'
        : 'Production auditabilityvaultizability rollout is not ready. Resolve failed checks before relying on production auditabilityvaultizability tooling.',
  }
}
