import type { ApiEnv } from '../config/env.js'

export const CRITICAL_GATEWAYIZABILITY_TABLES = [
  'workspace_usage_limits',
  'usage_events',
  'billing_records',
] as const

export type GatewayizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type GatewayizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: GatewayizabilityRolloutCheck[]
  guidance: string
}

export type GatewayizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingGatewayizabilityTableCount: number
  workspaceUsageLimitsTableExists: boolean
  usageEventsTableExists: boolean
  billingRecordsTableExists: boolean
}

export function evaluateGatewayizabilityRollout(
  input: GatewayizabilityRolloutInput,
): GatewayizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const gatewayizabilityTableCoverageComplete =
    input.existingGatewayizabilityTableCount === CRITICAL_GATEWAYIZABILITY_TABLES.length

  const checks: GatewayizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL gatewayizability checks can reach the database.'
            : 'Production gatewayizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'gatewayizability_signal_table_coverage',
      label: 'Gatewayizability signal table coverage',
      status: gatewayizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Gatewayizability signal table coverage is only enforced in production.'
          : gatewayizabilityTableCoverageComplete
            ? `${input.existingGatewayizabilityTableCount}/${CRITICAL_GATEWAYIZABILITY_TABLES.length} gatewayizability signal tables are present.`
            : `${input.existingGatewayizabilityTableCount}/${CRITICAL_GATEWAYIZABILITY_TABLES.length} gatewayizability signal tables were found.`,
    },
    {
      name: 'workspace_limit_gatewayizability',
      label: 'Workspace limit gatewayizability',
      status: input.workspaceUsageLimitsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Workspace limit gatewayizability is only enforced in production.'
          : input.workspaceUsageLimitsTableExists
            ? 'workspace_usage_limits table is available for workspace limit gatewayizability signals.'
            : 'Production gatewayizability rollout requires a workspace_usage_limits table.',
    },
    {
      name: 'usage_event_gatewayizability',
      label: 'Usage event gatewayizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event gatewayizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event gatewayizability signals.'
            : 'Production gatewayizability rollout requires a usage_events table.',
    },
    {
      name: 'gatewayization_readiness_signal',
      label: 'Federatization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          gatewayizabilityTableCoverageComplete &&
          input.workspaceUsageLimitsTableExists &&
          input.usageEventsTableExists &&
          input.billingRecordsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Federatization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              gatewayizabilityTableCoverageComplete &&
              input.workspaceUsageLimitsTableExists &&
              input.usageEventsTableExists &&
              input.billingRecordsTableExists
            ? 'Workspace usage limits, usage events, and billing records support gatewayization readiness.'
            : 'Production gatewayizability rollout requires PostgreSQL connectivity, gatewayizability tables, workspace limit gatewayizability, usage event gatewayizability, and full signal coverage.',
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
        ? 'Production gatewayizability rollout checks passed. Gatewayizability coverage and federatization readiness signal signals are healthy.'
        : 'Production gatewayizability rollout is not ready. Resolve failed checks before relying on production gatewayizability tooling.',
  }
}
