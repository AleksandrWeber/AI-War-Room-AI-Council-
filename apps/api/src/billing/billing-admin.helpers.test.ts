import { describe, expect, it } from 'vitest'
import {
  buildBillingAdminStats,
  resolveBillingAdminActions,
} from './billing-admin.helpers.js'

describe('billing admin helpers', () => {
  it('builds billing admin stats from workspace billing artifacts', () => {
    const stats = buildBillingAdminStats({
      alerts: [
        {
          billingAlertId: 'alert_1',
          workspaceId: 'workspace_1',
          type: 'usage_tokens',
          severity: 'critical',
          message: 'Critical usage',
          createdAt: '2026-07-04T12:00:00.000Z',
        },
      ],
      invoices: [
        {
          billingInvoiceId: 'invoice_1',
          workspaceId: 'workspace_1',
          provider: 'mock',
          externalInvoiceId: 'inv_1',
          externalCustomerId: 'cus_1',
          paidTier: 'pro',
          amountTotalUsd: 29,
          currency: 'usd',
          status: 'paid',
          hostedInvoiceUrl: null,
          invoicePdfUrl: null,
          periodStart: null,
          periodEnd: null,
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
      ],
      webhookEvents: [
        {
          billingWebhookEventId: 'event_1',
          provider: 'mock',
          externalEventId: 'evt_1',
          eventType: 'invoice.payment_failed',
          workspaceId: 'workspace_1',
          status: 'failed',
          errorMessage: 'failed',
          receivedAt: '2026-07-04T12:00:00.000Z',
          processedAt: '2026-07-04T12:00:00.000Z',
        },
      ],
      meterUsageReports: [
        {
          billingMeterUsageReportId: 'report_1',
          workspaceId: 'workspace_1',
          provider: 'mock',
          externalSubscriptionItemId: 'sub_item_1',
          externalUsageRecordId: 'usage_1',
          metric: 'tokens',
          quantity: 100,
          status: 'failed',
          errorMessage: 'failed',
          runId: 'run_1',
          createdAt: '2026-07-04T12:00:00.000Z',
        },
      ],
      notifications: [
        {
          billingNotificationId: 'notification_1',
          workspaceId: 'workspace_1',
          alertId: 'alert_1',
          alertType: 'usage_tokens',
          severity: 'critical',
          message: 'Critical usage',
          channel: 'mock',
          status: 'failed',
          deliveryReference: null,
          errorMessage: 'failed',
          deliveredAt: null,
          createdAt: '2026-07-04T12:00:00.000Z',
        },
      ],
    })

    expect(stats).toEqual({
      alertCount: 1,
      criticalAlertCount: 1,
      invoiceCount: 1,
      paidInvoiceTotalUsd: 29,
      webhookEventCount: 1,
      failedWebhookEventCount: 1,
      meterUsageReportCount: 1,
      failedMeterUsageReportCount: 1,
      notificationCount: 1,
      failedNotificationCount: 1,
    })
  })

  it('offers reset mock billing when mock subscription state is active', () => {
    expect(
      resolveBillingAdminActions({
        adapter: 'mock',
        billingEnabled: true,
        billingRecord: {
          billingRecordId: 'billing_workspace_1',
          workspaceId: 'workspace_1',
          provider: 'stripe',
          externalCustomerId: 'cus_1',
          externalSubscriptionItemId: 'sub_item_1',
          paidTier: 'pro',
          status: 'active',
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
      }),
    ).toEqual(['sync_notifications', 'reset_mock_billing'])
  })
})
