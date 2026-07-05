import { describe, expect, it } from 'vitest'
import { evaluateReleaseRollout } from './release-rollout.helpers.js'

describe('evaluateReleaseRollout', () => {
  it('passes in test mode with incomplete release coverage', () => {
    const rollout = evaluateReleaseRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingReleaseTableCount: 0,
      apiVersionMetadataAvailable: true,
      pendingMigrationCount: 10,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete release table coverage', () => {
    const rollout = evaluateReleaseRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingReleaseTableCount: 1,
      apiVersionMetadataAvailable: true,
      pendingMigrationCount: 0,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when API version metadata is unavailable', () => {
    const rollout = evaluateReleaseRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingReleaseTableCount: 3,
      apiVersionMetadataAvailable: false,
      pendingMigrationCount: 0,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
