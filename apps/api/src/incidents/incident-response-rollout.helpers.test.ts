import { describe, expect, it } from 'vitest'
import { evaluateIncidentResponseRollout } from './incident-response-rollout.helpers.js'

describe('evaluateIncidentResponseRollout', () => {
  it('passes in test mode with incomplete incident coverage', () => {
    const rollout = evaluateIncidentResponseRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingIncidentTableCount: 0,
      billingAlertEscalationConfigured: false,
      observabilityBufferCapacity: 200,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete incident table coverage', () => {
    const rollout = evaluateIncidentResponseRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingIncidentTableCount: 1,
      billingAlertEscalationConfigured: true,
      observabilityBufferCapacity: 200,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when observability buffer capacity is too small', () => {
    const rollout = evaluateIncidentResponseRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingIncidentTableCount: 3,
      billingAlertEscalationConfigured: true,
      observabilityBufferCapacity: 50,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
