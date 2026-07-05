import type { ApiEnv } from '../config/env.js'

export type IdempotencyRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type IdempotencyRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: IdempotencyRolloutCheck[]
  guidance: string
}

export type IdempotencyRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  usesRedisBackedReservation: boolean
  redisConnectivity: boolean
  usesInMemoryRepository: boolean
  reservationTtlSeconds: number
  supportsDuplicateRequestProtection: boolean
}

export function evaluateIdempotencyRollout(
  input: IdempotencyRolloutInput,
): IdempotencyRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'

  const checks: IdempotencyRolloutCheck[] = [
    {
      name: 'redis_backed_reservation',
      label: 'Redis-backed reservation',
      status: input.usesRedisBackedReservation || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Redis-backed idempotency reservations are only enforced in production.'
          : input.usesRedisBackedReservation
            ? 'Duplicate run requests reserve idempotency keys in Redis.'
            : 'Production idempotency rollout requires Redis-backed reservations.',
    },
    {
      name: 'redis_connectivity',
      label: 'Redis connectivity',
      status:
        !input.usesRedisBackedReservation ||
        input.redisConnectivity ||
        !isProduction
          ? 'pass'
          : 'fail',
      detail:
        !input.usesRedisBackedReservation
          ? 'Redis connectivity is validated when Redis reservations are enabled.'
          : input.redisConnectivity
            ? 'Redis idempotency reservation connectivity check passed.'
            : 'Production idempotency rollout requires reachable Redis connectivity.',
    },
    {
      name: 'persisted_idempotency_keys',
      label: 'Persisted idempotency keys',
      status: !input.usesInMemoryRepository || !isProduction ? 'pass' : 'fail',
      detail:
        !input.usesInMemoryRepository || !isProduction
          ? 'Idempotency keys are persisted outside tests.'
          : 'Production idempotency rollout cannot rely on in-memory persistence.',
    },
    {
      name: 'reservation_ttl',
      label: 'Reservation TTL',
      status: input.reservationTtlSeconds >= 3_600 ? 'pass' : 'fail',
      detail:
        input.reservationTtlSeconds >= 3_600
          ? `Idempotency reservations expire after ${input.reservationTtlSeconds} seconds.`
          : 'Idempotency reservation TTL must be at least 3600 seconds.',
    },
    {
      name: 'duplicate_request_protection',
      label: 'Duplicate request protection',
      status: input.supportsDuplicateRequestProtection ? 'pass' : 'fail',
      detail: input.supportsDuplicateRequestProtection
        ? 'Duplicate draft run requests are rejected or replayed safely.'
        : 'Duplicate request protection is not configured.',
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
        ? 'Idempotency rollout checks passed. Redis reservations and persisted idempotency keys are ready for production.'
        : 'Idempotency rollout is not ready. Resolve failed checks before relying on production duplicate request protection.',
  }
}
