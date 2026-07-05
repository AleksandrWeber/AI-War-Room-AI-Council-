import { describe, expect, it } from 'vitest'
import { evaluateSloRollout } from './slo-rollout.helpers.js'

describe('evaluateSloRollout', () => {
  it('passes in test mode with incomplete SLO coverage', () => {
    const rollout = evaluateSloRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingSloTableCount: 0,
      observabilityBufferCapacity: 200,
      modelHealthEventTableExists: false,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete SLO table coverage', () => {
    const rollout = evaluateSloRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingSloTableCount: 1,
      observabilityBufferCapacity: 200,
      modelHealthEventTableExists: true,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when observability buffer capacity is too small', () => {
    const rollout = evaluateSloRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingSloTableCount: 3,
      observabilityBufferCapacity: 50,
      modelHealthEventTableExists: true,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
