import type { ApiEnv } from '../config/env.js'

export const CRITICAL_AUDIT_TABLES = [
  'usage_events',
  'billing_webhook_events',
  'billing_notifications',
  'billing_meter_usage_reports',
] as const

export type AuditTrailRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuditTrailRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: AuditTrailRolloutCheck[]
  guidance: string
}

export type AuditTrailRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingAuditTableCount: number
  supportsWorkspaceAuditExport: boolean
}

export function evaluateAuditTrailRollout(
  input: AuditTrailRolloutInput,
): AuditTrailRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const auditTableCoverageComplete =
    input.existingAuditTableCount === CRITICAL_AUDIT_TABLES.length

  const checks: AuditTrailRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL audit trail checks can reach the database.'
            : 'Production audit trail rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'audit_table_coverage',
      label: 'Audit table coverage',
      status: auditTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Audit table coverage is only enforced in production.'
          : auditTableCoverageComplete
            ? `${input.existingAuditTableCount}/${CRITICAL_AUDIT_TABLES.length} persistent audit tables are present.`
            : `${input.existingAuditTableCount}/${CRITICAL_AUDIT_TABLES.length} persistent audit tables were found.`,
    },
    {
      name: 'workspace_audit_export',
      label: 'Workspace audit export',
      status: input.supportsWorkspaceAuditExport ? 'pass' : 'fail',
      detail: input.supportsWorkspaceAuditExport
        ? 'Workspace owners and admins can export audit records in CSV or JSON format.'
        : 'Production audit trail rollout requires workspace audit export support.',
    },
    {
      name: 'audit_record_inventory',
      label: 'Audit record inventory',
      status: auditTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Audit record inventory checks are only enforced in production.'
          : auditTableCoverageComplete
            ? 'Persistent audit tables are available for workspace audit record inventory.'
            : 'Production audit trail rollout requires persistent audit tables for record inventory.',
    },
    {
      name: 'retention_readiness_signal',
      label: 'Retention readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          auditTableCoverageComplete &&
          input.supportsWorkspaceAuditExport)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Retention readiness is only enforced in production.'
          : input.postgresConnectivity &&
              auditTableCoverageComplete &&
              input.supportsWorkspaceAuditExport
            ? 'Persistent audit tables and workspace export support retention-ready audit tooling.'
            : 'Production audit trail rollout requires PostgreSQL connectivity, audit tables, and export support.',
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
        ? 'Production audit trail rollout checks passed. Audit coverage and retention readiness signals are healthy.'
        : 'Production audit trail rollout is not ready. Resolve failed checks before relying on production audit tooling.',
  }
}
