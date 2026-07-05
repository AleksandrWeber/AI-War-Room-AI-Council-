import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DURABILITY_TABLES = [
  'artifacts',
  'runs',
  'usage_events',
] as const

export type DurabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DurabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DurabilityRolloutCheck[]
  guidance: string
}

export type DurabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDurabilityTableCount: number
  artifactsTableExists: boolean
  redisBackedPersistence: boolean
  redisConnectivity: boolean
}

export function evaluateDurabilityRollout(
  input: DurabilityRolloutInput,
): DurabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const durabilityTableCoverageComplete =
    input.existingDurabilityTableCount === CRITICAL_DURABILITY_TABLES.length

  const checks: DurabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL durability checks can reach the database.'
            : 'Production durability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'durability_signal_table_coverage',
      label: 'Durability signal table coverage',
      status:
        durabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Durability signal table coverage is only enforced in production.'
          : durabilityTableCoverageComplete
            ? `${input.existingDurabilityTableCount}/${CRITICAL_DURABILITY_TABLES.length} durability signal tables are present.`
            : `${input.existingDurabilityTableCount}/${CRITICAL_DURABILITY_TABLES.length} durability signal tables were found.`,
    },
    {
      name: 'artifact_persistence_durability',
      label: 'Artifact persistence durability',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact persistence durability is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for durable persisted output signals.'
            : 'Production durability rollout requires an artifacts table.',
    },
    {
      name: 'redis_persistence_durability',
      label: 'Redis persistence durability',
      status:
        !input.redisBackedPersistence ||
        input.redisConnectivity ||
        !isProduction
          ? 'pass'
          : 'fail',
      detail:
        !input.redisBackedPersistence
          ? 'Redis persistence checks are skipped when Redis reservations are not enabled.'
          : !isProduction
            ? 'Redis persistence durability is only enforced in production.'
            : input.redisConnectivity
              ? 'Redis-backed persistence is reachable for ephemeral recovery data.'
              : 'Production durability rollout requires reachable Redis persistence.',
    },
    {
      name: 'persistence_readiness_signal',
      label: 'Persistence readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          durabilityTableCoverageComplete &&
          input.artifactsTableExists &&
          (!input.redisBackedPersistence || input.redisConnectivity))
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Persistence readiness is only enforced in production.'
          : input.postgresConnectivity &&
              durabilityTableCoverageComplete &&
              input.artifactsTableExists &&
              (!input.redisBackedPersistence || input.redisConnectivity)
            ? 'Persisted artifacts, usage events, and recovery persistence support durability readiness.'
            : 'Production durability rollout requires PostgreSQL connectivity, durability tables, artifact persistence, and Redis persistence when enabled.',
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
        ? 'Production durability rollout checks passed. Durability coverage and persistence readiness signals are healthy.'
        : 'Production durability rollout is not ready. Resolve failed checks before relying on production durability tooling.',
  }
}
