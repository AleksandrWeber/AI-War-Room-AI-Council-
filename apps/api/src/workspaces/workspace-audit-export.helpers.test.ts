import { describe, expect, it } from 'vitest'
import { serializeWorkspaceAuditCsv } from './workspace-audit-export.helpers.js'

describe('serializeWorkspaceAuditCsv', () => {
  it('serializes mixed audit records into csv rows', () => {
    const csv = serializeWorkspaceAuditCsv({
      workspaceId: 'workspace_1',
      exportedAt: '2026-07-04T12:00:00.000Z',
      stats: {
        usageEventCount: 1,
        billingWebhookEventCount: 1,
        billingNotificationCount: 0,
        meterUsageReportCount: 0,
      },
      usageEvents: [
        {
          usageEventId: 'usage_1',
          workspaceId: 'workspace_1',
          userId: 'user_test',
          runId: 'run_1',
          phase: 'agent',
          sourceId: 'agent_1',
          modelProvider: 'mock',
          modelName: 'mock-json-v1',
          promptVersion: 'v1',
          inputTokens: 100,
          outputTokens: 50,
          estimatedCostUsd: 0.25,
          createdAt: '2026-07-04T12:00:00.000Z',
        },
      ],
      billingWebhookEvents: [
        {
          billingWebhookEventId: 'bwh_1',
          provider: 'mock',
          externalEventId: 'evt_1',
          eventType: 'checkout.session.completed',
          workspaceId: 'workspace_1',
          status: 'processed',
          errorMessage: null,
          receivedAt: '2026-07-04T12:01:00.000Z',
          processedAt: '2026-07-04T12:01:01.000Z',
        },
      ],
      billingNotifications: [],
      meterUsageReports: [],
    })

    expect(csv).toContain('recordType,recordId,workspaceId,createdAt,category,status,detail')
    expect(csv).toContain('usage_event,usage_1,workspace_1')
    expect(csv).toContain('billing_webhook_event,bwh_1,workspace_1')
  })
})
