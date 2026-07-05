import type { ApiEnv } from '../config/env.js'

export const CRITICAL_BENCHMARKIZABILITY_TABLES = [
  'workspace_memberships',
  'usage_events',
  'billing_notifications',
] as const

export type BenchmarkizabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BenchmarkizabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: BenchmarkizabilityRolloutCheck[]
  guidance: string
}

export type BenchmarkizabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingBenchmarkizabilityTableCount: number
  workspaceMembershipsTableExists: boolean
  usageEventsTableExists: boolean
  billingNotificationsTableExists: boolean
}

export function evaluateBenchmarkizabilityRollout(
  input: BenchmarkizabilityRolloutInput,
): BenchmarkizabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const benchmarkizabilityTableCoverageComplete =
    input.existingBenchmarkizabilityTableCount === CRITICAL_BENCHMARKIZABILITY_TABLES.length

  const checks: BenchmarkizabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL benchmarkizability checks can reach the database.'
            : 'Production benchmarkizability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'benchmarkizability_signal_table_coverage',
      label: 'Benchmarkizability signal table coverage',
      status: benchmarkizabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Benchmarkizability signal table coverage is only enforced in production.'
          : benchmarkizabilityTableCoverageComplete
            ? `${input.existingBenchmarkizabilityTableCount}/${CRITICAL_BENCHMARKIZABILITY_TABLES.length} benchmarkizability signal tables are present.`
            : `${input.existingBenchmarkizabilityTableCount}/${CRITICAL_BENCHMARKIZABILITY_TABLES.length} benchmarkizability signal tables were found.`,
    },
    {
      name: 'membership_benchmarkizability',
      label: 'Membership benchmarkizability',
      status: input.workspaceMembershipsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Membership benchmarkizability is only enforced in production.'
          : input.workspaceMembershipsTableExists
            ? 'workspace_memberships table is available for membership benchmarkizability signals.'
            : 'Production benchmarkizability rollout requires a workspace_memberships table.',
    },
    {
      name: 'usage_event_benchmarkizability',
      label: 'Usage event benchmarkizability',
      status: input.usageEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Usage event benchmarkizability is only enforced in production.'
          : input.usageEventsTableExists
            ? 'usage_events table is available for usage event benchmarkizability signals.'
            : 'Production benchmarkizability rollout requires a usage_events table.',
    },
    {
      name: 'benchmarkization_readiness_signal',
      label: 'Benchmarkization readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          benchmarkizabilityTableCoverageComplete &&
          input.workspaceMembershipsTableExists &&
          input.usageEventsTableExists &&
          input.billingNotificationsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Benchmarkization readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              benchmarkizabilityTableCoverageComplete &&
              input.workspaceMembershipsTableExists &&
              input.usageEventsTableExists &&
              input.billingNotificationsTableExists
            ? 'Workspace memberships, usage events, and billing notifications support benchmarkization readiness.'
            : 'Production benchmarkizability rollout requires PostgreSQL connectivity, benchmarkizability tables, membership benchmarkizability, usage event benchmarkizability, and full signal coverage.',
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
        ? 'Production benchmarkizability rollout checks passed. Benchmarkizability coverage and benchmarkization readiness signal signals are healthy.'
        : 'Production benchmarkizability rollout is not ready. Resolve failed checks before relying on production benchmarkizability tooling.',
  }
}
