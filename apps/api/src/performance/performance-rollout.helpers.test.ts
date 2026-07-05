import { describe, expect, it } from 'vitest'
import { evaluatePerformanceRollout } from './performance-rollout.helpers.js'

describe('evaluatePerformanceRollout', () => {
  it('passes in test mode with incomplete performance coverage', () => {
    const rollout = evaluatePerformanceRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingPerformanceTableCount: 0,
      observabilityBufferCapacity: 200,
      modelHealthEventTableExists: false,
      tracingEnabled: true,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete performance table coverage', () => {
    const rollout = evaluatePerformanceRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingPerformanceTableCount: 1,
      observabilityBufferCapacity: 200,
      modelHealthEventTableExists: true,
      tracingEnabled: true,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when observability buffer capacity is too small', () => {
    const rollout = evaluatePerformanceRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingPerformanceTableCount: 3,
      observabilityBufferCapacity: 50,
      modelHealthEventTableExists: true,
      tracingEnabled: true,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
