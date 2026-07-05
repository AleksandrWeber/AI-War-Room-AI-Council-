import type { ApiEnv } from '../config/env.js'

export const CRITICAL_EXPORTIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type ExportizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ExportizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ExportizabilityRolloutCheck[]
  guidance: string
}

export type ExportizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingExportizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateExportizabilityRollout(
  input: ExportizabilityRolloutInput,
): ExportizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const exportizabilityTableCoverageComplete =
    input.existingExportizabilityTableCount === CRITICAL_EXPORTIZABILITY_TABLES.length

  const checks: ExportizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL exportizability checks can reach the database.'
            : 'Production exportizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'exportizability_signal_table_coverage',
      label: 'Exportizability signal table coverage',
      status: exportizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Exportizability signal table coverage is only enforced in production.'
          : exportizabilityTableCoverageComplete
            ? `${input.existingExportizabilityTableCount}/${CRITICAL_EXPORTIZABILITY_TABLES.length} exportizability signal tables are present.`
            : `${input.existingExportizabilityTableCount}/${CRITICAL_EXPORTIZABILITY_TABLES.length} exportizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_exportizability',
      label: 'Workspace limit exportizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit exportizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit exportizability signals.'
            : 'Production exportizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_exportizability',
      label: 'Usage event exportizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event exportizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event exportizability signals.'
            : 'Production exportizability rollout requires a usage_events table.',
    },
    {
      name: 'exportization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          exportizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              exportizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support exportization readiness.'
            : 'Production exportizability rollout requires PostgreSQL connectivity, exportizability tables, workspace limit exportizability, usage event exportizability, and full signal coverage.',
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
        ? 'Production exportizability rollout checks passed. Exportizability coverage and federatization readiness signal signals are healthy.'
        : 'Production exportizability rollout is not ready. Resolve failed checks before relying on production exportizability tooling.',
  }
}
