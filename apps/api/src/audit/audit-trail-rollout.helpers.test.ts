import { describe, expect, it } from 'vitest'
import { evaluateAuditTrailRollout } from './audit-trail-rollout.helpers.js'

describe('evaluateAuditTrailRollout', () => {
  it('passes in test mode with incomplete audit coverage', () => {
    const rollout = evaluateAuditTrailRollout({
      nodeEnv: 'test',
      postgresConnectivity: false,
      existingAuditTableCount: 0,
      supportsWorkspaceAuditExport: true,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with incomplete audit table coverage', () => {
    const rollout = evaluateAuditTrailRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingAuditTableCount: 2,
      supportsWorkspaceAuditExport: true,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when workspace audit export is unavailable', () => {
    const rollout = evaluateAuditTrailRollout({
      nodeEnv: 'production',
      postgresConnectivity: true,
      existingAuditTableCount: 4,
      supportsWorkspaceAuditExport: false,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
