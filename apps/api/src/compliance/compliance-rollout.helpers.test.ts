import { describe, expect, it } from 'vitest'
import { evaluateComplianceRollout } from './compliance-rollout.helpers.js'

describe('evaluateComplianceRollout', () => {
  it('passes in test mode with incomplete policy coverage', () => {
    const rollout = evaluateComplianceRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingPolicyTableCount: 0,
      encryptionKeyConfigured: false,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete policy table coverage', () => {
    const rollout = evaluateComplianceRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingPolicyTableCount: 2,
      encryptionKeyConfigured: true,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails in production when encryption key is not configured', () => {
    const rollout = evaluateComplianceRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingPolicyTableCount: 4,
      encryptionKeyConfigured: false,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
