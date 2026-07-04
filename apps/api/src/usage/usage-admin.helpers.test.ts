import { describe, expect, it } from 'vitest'
import { buildUsageAdminStats, resolveUsageAdminActions } from './usage-admin.helpers.js'

describe('usage admin helpers', () => {
  it('builds usage admin stats from workspace usage summary', () => {
    const stats = buildUsageAdminStats({
      usage: {
        workspaceId: 'workspace_1',
        paidTier: 'free',
        dailyTokenLimit: 1000,
        dailyCostLimitUsd: 10,
        dailyUsage: {
          inputTokens: 300,
          outputTokens: 200,
          totalTokens: 500,
          estimatedCostUsd: 2.5,
        },
        usagePeriodStart: '2026-07-04T00:00:00.000Z',
        usagePeriodEnd: '2026-07-05T00:00:00.000Z',
      },
      dailyEventCount: 4,
      distinctRunCount: 2,
    })

    expect(stats).toEqual({
      dailyEventCount: 4,
      distinctRunCount: 2,
      tokenUtilizationPercent: 50,
      costUtilizationPercent: 25,
    })
  })

  it('offers reset daily usage in non-production when events exist', () => {
    expect(
      resolveUsageAdminActions({
        nodeEnv: 'development',
        dailyEventCount: 3,
      }),
    ).toEqual(['reset_daily_usage'])
  })
})
