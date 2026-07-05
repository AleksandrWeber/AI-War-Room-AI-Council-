import { describe, expect, it } from 'vitest'
import { evaluateIdempotencyRollout } from './idempotency-rollout.helpers.js'

describe('evaluateIdempotencyRollout', () => {
  it('passes in test mode without redis-backed reservations', () => {
    const rollout = evaluateIdempotencyRollout({
      nodeEnv: 'test',
      usesRedisBackedReservation: false,
      redisConnectivity: false,
      usesInMemoryRepository: true,
      reservationTtlSeconds: 86_400,
      supportsDuplicateRequestProtection: true,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production without redis-backed reservations', () => {
    const rollout = evaluateIdempotencyRollout({
      nodeEnv: 'production',
      usesRedisBackedReservation: false,
      redisConnectivity: true,
      usesInMemoryRepository: false,
      reservationTtlSeconds: 86_400,
      supportsDuplicateRequestProtection: true,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
