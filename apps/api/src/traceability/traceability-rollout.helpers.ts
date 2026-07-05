import type { ApiEnv } from '../config/env.js'

export const CRITICAL_TRACEABILITY_TABLES = [
  'runs',
  'artifacts',
  'usage_events',
] as const

export type TraceabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TraceabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: TraceabilityRolloutCheck[]
  guidance: string
}

export type TraceabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingTraceabilityTableCount: number
  artifactsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateTraceabilityRollout(
  input: TraceabilityRolloutInput,
): TraceabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const traceabilityTableCoverageComplete =
    input.existingTraceabilityTableCount === CRITICAL_TRACEABILITY_TABLES.length

  const checks: TraceabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL traceability checks can reach the database.'
            : 'Production traceability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'traceability_signal_table_coverage',
      label: 'Traceability signal table coverage',
      status:
        traceabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Traceability signal table coverage is only enforced in production.'
          : traceabilityTableCoverageComplete
            ? `${input.existingTraceabilityTableCount}/${CRITICAL_TRACEABILITY_TABLES.length} traceability signal tables are present.`
            : `${input.existingTraceabilityTableCount}/${CRITICAL_TRACEABILITY_TABLES.length} traceability signal tables were found.`,
    },
    {
      name: 'run_lineage_traceability',
      label: 'Run lineage traceability',
      status: traceabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Run lineage traceability is only enforced in production.'
          : traceabilityTableCoverageComplete
            ? 'runs table is available for run lineage signals.'
            : 'Production traceability rollout requires a runs table.',
    },
    {
      name: 'artifact_lineage_traceability',
      label: 'Artifact lineage traceability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact lineage traceability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact lineage signals.'
            : 'Production traceability rollout requires an artifacts table.',
    },
    {
      name: 'lineage_readiness_signal',
      label: 'Lineage readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          traceabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Lineage readiness is only enforced in production.'
          : input.postgresConnectivity &&
              traceabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              input.usageEventsTableExists
            ? 'Run outcomes, persisted artifacts, and usage events support lineage readiness.'
            : 'Production traceability rollout requires PostgreSQL connectivity, traceability tables, artifact lineage, and usage event coverage.',
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
        ? 'Production traceability rollout checks passed. Traceability coverage and lineage readiness signals are healthy.'
        : 'Production traceability rollout is not ready. Resolve failed checks before relying on production traceability tooling.',
  }
}
