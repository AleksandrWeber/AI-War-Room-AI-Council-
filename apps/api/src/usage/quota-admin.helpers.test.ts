import { describe, expect, it } from 'vitest'
import { buildQuotaAdminStats, toQuotaAdminRecord } from './quota-admin.helpers.js'

describe('quota admin helpers', () => {
  it('maps usage events to quota admin records', () => {
    expect(
      toQuotaAdminRecord({
        usageEventId: 'usage_1',
        workspaceId: 'workspace_1',
        userId: 'user_test',
        runId: 'run_1',
        phase: 'agent',
        sourceId: 'product_manager',
        modelProvider: 'mock',
        modelName: 'mock-model',
        promptVersion: 'agent/product_manager/v1',
        inputTokens: 100,
        outputTokens: 50,
        estimatedCostUsd: 0.5,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toMatchObject({
      usageEventId: 'usage_1',
      totalTokens: 150,
    })
  })

  it('marks quota exceeded when cost utilization is over limit', () => {
    expect(
      buildQuotaAdminStats({
        usage: {
          workspaceId: 'workspace_1',
          paidTier: 'free',
          dailyTokenLimit: 1000,
          dailyCostLimitUsd: 1,
          dailyUsage: {
            inputTokens: 600,
            outputTokens: 600,
            totalTokens: 1200,
            estimatedCostUsd: 1.5,
          },
          usagePeriodStart: '2026-01-01T00:00:00.000Z',
          usagePeriodEnd: '2026-01-02T00:00:00.000Z',
        },
        dailyEventCount: 2,
        distinctRunCount: 1,
      }),
    ).toMatchObject({
      quotaExceeded: true,
      costUtilizationPercent: 150,
    })
  })
})
