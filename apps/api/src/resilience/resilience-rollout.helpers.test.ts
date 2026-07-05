import { describe, expect, it } from 'vitest'
import { evaluateResilienceRollout } from './resilience-rollout.helpers.js'

describe('evaluateResilienceRollout', () => {
  it('passes in test mode with incomplete resilience coverage', () => {
    const rollout = evaluateResilienceRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingResilienceTableCount: 0,
      redisBackedRecoverySignals: false,
      redisConnectivity: false,
      pendingMigrationCount: 2,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete resilience table coverage', () => {
    const rollout = evaluateResilienceRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingResilienceTableCount: 1,
      redisBackedRecoverySignals: true,
      redisConnectivity: true,
      pendingMigrationCount: 0,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when pending migrations block recovery readiness', () => {
    const rollout = evaluateResilienceRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingResilienceTableCount: 3,
      redisBackedRecoverySignals: true,
      redisConnectivity: true,
      pendingMigrationCount: 1,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
