import type { ApiEnv } from '../config/env.js'

export const CRITICAL_SLO_TABLES = [
  'usage_events',
  'runs',
  'model_health_events',
] as const

export type SloRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type SloRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: SloRolloutCheck[]
  guidance: string
}

export type SloRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingSloTableCount: number
  observabilityBufferCapacity: number
  modelHealthEventTableExists: boolean
}

export function evaluateSloRollout(input: SloRolloutInput): SloRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const sloTableCoverageComplete =
    input.existingSloTableCount === CRITICAL_SLO_TABLES.length
  const observabilityBufferReady = input.observabilityBufferCapacity >= 100

  const checks: SloRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL SLO checks can reach the database.'
            : 'Production SLO rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'slo_signal_table_coverage',
      label: 'SLO signal table coverage',
      status: sloTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'SLO signal table coverage is only enforced in production.'
          : sloTableCoverageComplete
            ? `${input.existingSloTableCount}/${CRITICAL_SLO_TABLES.length} SLO signal tables are present.`
            : `${input.existingSloTableCount}/${CRITICAL_SLO_TABLES.length} SLO signal tables were found.`,
    },
    {
      name: 'observability_slo_buffer',
      label: 'Observability SLO buffer',
      status: observabilityBufferReady ? 'pass' : 'fail',
      detail: observabilityBufferReady
        ? `Observability buffer capacity is ${input.observabilityBufferCapacity} recent event(s).`
        : 'Production SLO rollout requires an observability buffer capacity of at least 100 events.',
    },
    {
      name: 'model_health_slo_signals',
      label: 'Model health SLO signals',
      status:
        input.modelHealthEventTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Model health SLO signals are only enforced in production.'
          : input.modelHealthEventTableExists
            ? 'model_health_events table is available for reliability SLO signals.'
            : 'Production SLO rollout requires a model_health_events table.',
    },
    {
      name: 'target_readiness_signal',
      label: 'Target readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          sloTableCoverageComplete &&
          observabilityBufferReady &&
          input.modelHealthEventTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Target readiness is only enforced in production.'
          : input.postgresConnectivity &&
              sloTableCoverageComplete &&
              observabilityBufferReady &&
              input.modelHealthEventTableExists
            ? 'Usage events, run outcomes, observability buffers, and model health events support SLO target readiness.'
            : 'Production SLO rollout requires PostgreSQL connectivity, SLO tables, observability buffers, and model health signals.',
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
        ? 'Production SLO rollout checks passed. SLO coverage and target readiness signals are healthy.'
        : 'Production SLO rollout is not ready. Resolve failed checks before relying on production SLO tooling.',
  }
}
