import { describe, expect, it } from 'vitest'
import { evaluateMigrationRollout } from './migration-rollout.helpers.js'

describe('evaluateMigrationRollout', () => {
  it('passes in test mode with pending migrations', () => {
    const rollout = evaluateMigrationRollout({
      nodeEnv: 'test',
      schemaMigrationsTableExists: false,
      postgresConnectivity: false,
      availableMigrationCount: 10,
      pendingMigrationCount: 10,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with pending migrations', () => {
    const rollout = evaluateMigrationRollout({
      nodeEnv: 'production',
      schemaMigrationsTableExists: true,
      postgresConnectivity: true,
      availableMigrationCount: 10,
      pendingMigrationCount: 2,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
