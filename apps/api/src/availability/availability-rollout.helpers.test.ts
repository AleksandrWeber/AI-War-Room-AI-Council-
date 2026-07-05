import { describe, expect, it } from 'vitest'
import { evaluateAvailabilityRollout } from './availability-rollout.helpers.js'

describe('evaluateAvailabilityRollout', () => {
  it('passes in test mode with incomplete availability coverage', () => {
    const rollout = evaluateAvailabilityRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingAvailabilityTableCount: 0,
      apiHealthStatusOk: true,
      dependencyUptimeReady: false,
      healthyDependencyCount: 0,
      totalDependencyCount: 2,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete availability table coverage', () => {
    const rollout = evaluateAvailabilityRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingAvailabilityTableCount: 1,
      apiHealthStatusOk: true,
      dependencyUptimeReady: true,
      healthyDependencyCount: 2,
      totalDependencyCount: 2,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when dependency uptime is not ready', () => {
    const rollout = evaluateAvailabilityRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingAvailabilityTableCount: 3,
      apiHealthStatusOk: true,
      dependencyUptimeReady: false,
      healthyDependencyCount: 1,
      totalDependencyCount: 2,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
