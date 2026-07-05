import { describe, expect, it } from 'vitest'
import { evaluateBackupRollout } from './backup-rollout.helpers.js'

describe('evaluateBackupRollout', () => {
  it('passes in test mode with incomplete backup coverage', () => {
    const rollout = evaluateBackupRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      redisBackedPersistence: false,
      redisConnectivity: false,
      existingCriticalTableCount: 0,
      pendingMigrationCount: 10,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete critical table coverage', () => {
    const rollout = evaluateBackupRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      redisBackedPersistence: true,
      redisConnectivity: true,
      existingCriticalTableCount: 2,
      pendingMigrationCount: 0,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails in production when redis persistence is unreachable', () => {
    const rollout = evaluateBackupRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      redisBackedPersistence: true,
      redisConnectivity: false,
      existingCriticalTableCount: 5,
      pendingMigrationCount: 0,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
