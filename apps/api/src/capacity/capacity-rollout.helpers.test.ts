import { describe, expect, it } from 'vitest'
import { evaluateCapacityRollout } from './capacity-rollout.helpers.js'

describe('evaluateCapacityRollout', () => {
  it('passes in test mode with incomplete capacity coverage', () => {
    const rollout = evaluateCapacityRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingCapacityTableCount: 0,
      redisBackedCapacitySignals: false,
      redisConnectivity: false,
      usageLimitsTableExists: false,
      streamBufferMaxLength: 200,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete capacity table coverage', () => {
    const rollout = evaluateCapacityRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingCapacityTableCount: 1,
      redisBackedCapacitySignals: true,
      redisConnectivity: true,
      usageLimitsTableExists: true,
      streamBufferMaxLength: 200,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when stream buffer capacity is too small', () => {
    const rollout = evaluateCapacityRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingCapacityTableCount: 3,
      redisBackedCapacitySignals: true,
      redisConnectivity: true,
      usageLimitsTableExists: true,
      streamBufferMaxLength: 50,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
