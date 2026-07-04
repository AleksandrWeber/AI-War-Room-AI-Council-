import { describe, expect, it } from 'vitest'
import type {
  BillingRecord,
  BillingWorkspaceUsageResponse,
} from '@ai-war-room/schemas'
import { buildWorkspaceBillingAlerts } from './billing-alerts.helpers.js'

const baseUsage: BillingWorkspaceUsageResponse = {
  workspaceId: 'workspace_1',
  paidTier: 'free',
  dailyTokenLimit: 250_000,
  dailyCostLimitUsd: 25,
  dailyUsage: {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
  },
  usagePeriodStart: '2026-07-04T00:00:00.000Z',
  usagePeriodEnd: '2026-07-05T00:00:00.000Z',
}

const billingRecord: BillingRecord = {
  billingRecordId: 'billing_1',
  workspaceId: 'workspace_1',
  provider: 'stripe',
  externalCustomerId: 'cus_1',
  paidTier: 'pro',
  status: 'active',
  createdAt: '2026-07-04T00:00:00.000Z',
  updatedAt: '2026-07-04T00:00:00.000Z',
}

describe('buildWorkspaceBillingAlerts', () => {
  it('returns no alerts when usage and billing are healthy', () => {
    const alerts = buildWorkspaceBillingAlerts({
      workspaceId: 'workspace_1',
      usage: baseUsage,
      billingRecord,
      createdAt: '2026-07-04T12:00:00.000Z',
    })

    expect(alerts).toEqual([])
  })

  it('returns warning alerts when usage crosses the threshold', () => {
    const alerts = buildWorkspaceBillingAlerts({
      workspaceId: 'workspace_1',
      usage: {
        ...baseUsage,
        dailyUsage: {
          inputTokens: 100_000,
          outputTokens: 110_000,
          totalTokens: 210_000,
          estimatedCostUsd: 21,
        },
      },
      billingRecord,
      createdAt: '2026-07-04T12:00:00.000Z',
    })

    expect(alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'usage_tokens',
          severity: 'warning',
        }),
        expect.objectContaining({
          type: 'usage_cost',
          severity: 'warning',
        }),
      ]),
    )
  })

  it('returns critical billing status alerts', () => {
    const alerts = buildWorkspaceBillingAlerts({
      workspaceId: 'workspace_1',
      usage: baseUsage,
      billingRecord: {
        ...billingRecord,
        status: 'past_due',
      },
      createdAt: '2026-07-04T12:00:00.000Z',
    })

    expect(alerts).toEqual([
      expect.objectContaining({
        type: 'billing_past_due',
        severity: 'critical',
      }),
    ])
  })
})
