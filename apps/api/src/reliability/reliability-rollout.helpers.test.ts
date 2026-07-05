import { describe, expect, it } from 'vitest'
import { evaluateReliabilityRollout } from './reliability-rollout.helpers.js'

describe('evaluateReliabilityRollout', () => {
  it('passes in test mode with incomplete reliability coverage', () => {
    const rollout = evaluateReliabilityRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingReliabilityTableCount: 0,
      modelHealthEventTableExists: false,
      usesRedisBackedReservation: false,
      redisConnectivity: false,
      supportsDuplicateRequestProtection: true,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete reliability table coverage', () => {
    const rollout = evaluateReliabilityRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingReliabilityTableCount: 1,
      modelHealthEventTableExists: true,
      usesRedisBackedReservation: true,
      redisConnectivity: true,
      supportsDuplicateRequestProtection: true,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when duplicate request protection is disabled', () => {
    const rollout = evaluateReliabilityRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingReliabilityTableCount: 3,
      modelHealthEventTableExists: true,
      usesRedisBackedReservation: true,
      redisConnectivity: true,
      supportsDuplicateRequestProtection: false,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
