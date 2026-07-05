import { describe, expect, it } from 'vitest'
import { evaluateUsageLimitsRollout } from './usage-limits-rollout.helpers.js'

describe('evaluateUsageLimitsRollout', () => {
  it('passes in test mode with in-memory persistence', () => {
    const rollout = evaluateUsageLimitsRollout({
      nodeEnv: 'test',
      usesInMemoryRepository: true,
      supportsDailyCostQuotaEnforcement: true,
      supportsDailyTokenLimitTracking: true,
      supportedPaidTiers: ['free', 'pro', 'business'],
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with in-memory persistence', () => {
    const rollout = evaluateUsageLimitsRollout({
      nodeEnv: 'production',
      usesInMemoryRepository: true,
      supportsDailyCostQuotaEnforcement: true,
      supportsDailyTokenLimitTracking: true,
      supportedPaidTiers: ['free', 'pro', 'business'],
    })

    expect(rollout.status).toBe('not_ready')
  })
})
