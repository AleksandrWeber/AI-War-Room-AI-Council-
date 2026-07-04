import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { MockBillingAdapter } from './mock-billing.adapter.js'
import { InMemoryBillingRepository } from './in-memory-billing.repository.js'
import { InMemoryBillingInvoiceRepository } from './in-memory-billing-invoice.repository.js'
import { InMemoryBillingWebhookRepository } from './in-memory-billing-webhook.repository.js'
import { BillingService } from './billing.service.js'
import { InMemoryUsageRepository } from '../usage/in-memory-usage.repository.js'
import { UsageService } from '../usage/usage.service.js'
import { BillingMeterUsageService } from './billing-meter-usage.service.js'
import { InMemoryBillingMeterUsageRepository } from './in-memory-billing-meter-usage.repository.js'
import { BillingNotificationService } from './billing-notification.service.js'
import { InMemoryBillingNotificationRepository } from './in-memory-billing-notification.repository.js'
import { MockBillingNotificationAdapter } from './billing-notification.adapter.js'

function createBillingService(env: Partial<ApiEnv>) {
  const config = {
    STRIPE_ENABLED: true,
    STRIPE_BILLING_ADAPTER: 'mock',
    STRIPE_SUCCESS_URL: 'http://127.0.0.1:5173/billing/success',
    STRIPE_CANCEL_URL: 'http://127.0.0.1:5173/billing/cancel',
    STRIPE_PORTAL_RETURN_URL: 'http://127.0.0.1:5173/billing/portal',
    BILLING_NOTIFICATION_ADAPTER: 'mock',
    API_PORT: 3000,
    ...env,
  } as ApiEnv

  const configService = {
    get: (key: keyof ApiEnv) => config[key],
  } as ConfigService<ApiEnv, true>

  const repository = new InMemoryBillingRepository()
  const webhookRepository = new InMemoryBillingWebhookRepository()
  const invoiceRepository = new InMemoryBillingInvoiceRepository()
  const adapter = new MockBillingAdapter('http://127.0.0.1:3000')
  const usageService = new UsageService(new InMemoryUsageRepository())
  const meterUsageRepository = new InMemoryBillingMeterUsageRepository()
  const meterUsageService = new BillingMeterUsageService(
    configService,
    repository,
    meterUsageRepository,
    adapter,
  )
  const notificationRepository = new InMemoryBillingNotificationRepository()
  const notificationService = new BillingNotificationService(
    configService,
    repository,
    notificationRepository,
    new MockBillingNotificationAdapter(),
    usageService,
  )

  return {
    service: new BillingService(
      configService,
      repository,
      webhookRepository,
      invoiceRepository,
      adapter,
      usageService,
      meterUsageService,
      notificationService,
    ),
    repository,
    webhookRepository,
    invoiceRepository,
    meterUsageService,
  }
}

describe('BillingService', () => {
  it('reports disabled billing capabilities by default', () => {
    const { service } = createBillingService({
      STRIPE_ENABLED: false,
    })

    expect(service.getCapabilities()).toMatchObject({
      enabled: false,
      adapter: 'mock',
      supportsCheckout: false,
      supportsCustomerPortal: false,
      supportsWebhookAudit: false,
      supportsInvoiceHistory: false,
      supportsUsageSummary: false,
      supportsBillingExport: false,
      supportsBillingAlerts: false,
      supportsMeteredUsage: false,
      supportsBillingNotifications: false,
      supportsBillingRollout: true,
      supportsBillingAdminTools: false,
    })
  })

  it('reports billing rollout readiness for mock development', () => {
    const { service } = createBillingService({})

    expect(service.getBillingRollout()).toMatchObject({
      status: 'ready',
      adapter: 'mock',
    })
  })

  it('returns workspace daily usage summary against tier limits', async () => {
    const { service } = createBillingService({})

    const usage = await service.getWorkspaceUsageSummary('workspace_1')

    expect(usage).toMatchObject({
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
    })
    expect(usage.usagePeriodStart).toMatch(/T00:00:00\.000Z$/)
    expect(usage.usagePeriodEnd).toMatch(/T00:00:00\.000Z$/)
  })

  it('reports metered token usage after paid checkout', async () => {
    const { service, meterUsageService } = createBillingService({})

    const checkout = await service.createCheckoutSession({
      workspaceId: 'workspace_1',
      paidTier: 'pro',
      requestWorkspaceId: 'workspace_1',
    })
    await service.completeMockCheckout(checkout.sessionId)

    await meterUsageService.reportRunTokenUsage({
      workspaceId: 'workspace_1',
      runId: 'run_meter_test',
      totalTokens: 1200,
    })

    const reports = await service.listWorkspaceMeterUsageReports('workspace_1')

    expect(reports.reports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workspaceId: 'workspace_1',
          metric: 'tokens',
          quantity: 1200,
          status: 'reported',
          runId: 'run_meter_test',
        }),
      ]),
    )
  })

  it('delivers billing notifications for past due subscriptions', async () => {
    const { service } = createBillingService({})

    await service.handleWebhook(
      JSON.stringify({
        eventId: 'mock_evt_notif_seed',
        event: 'checkout.completed',
        workspaceId: 'workspace_1',
        paidTier: 'pro',
        externalCustomerId: 'cus_notif',
      }),
      undefined,
    )

    await service.handleWebhook(
      JSON.stringify({
        eventId: 'mock_evt_notif_past_due',
        event: 'invoice.payment_failed',
        workspaceId: 'workspace_1',
        externalInvoiceId: 'mock_inv_notif',
        externalCustomerId: 'cus_notif',
        amountTotalUsd: 29,
        paidTier: 'pro',
      }),
      undefined,
    )

    const notifications = await service.listWorkspaceNotifications('workspace_1')

    expect(notifications.notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alertType: 'billing_past_due',
          severity: 'critical',
          status: 'delivered',
          channel: 'mock',
        }),
      ]),
    )
  })

  it('returns billing alerts for past due subscriptions', async () => {
    const { service } = createBillingService({})

    await service.handleWebhook(
      JSON.stringify({
        eventId: 'mock_evt_past_due_alert_seed',
        event: 'checkout.completed',
        workspaceId: 'workspace_1',
        paidTier: 'pro',
        externalCustomerId: 'cus_past_due_alert',
      }),
      undefined,
    )

    await service.handleWebhook(
      JSON.stringify({
        eventId: 'mock_evt_past_due_alert',
        event: 'invoice.payment_failed',
        workspaceId: 'workspace_1',
        externalInvoiceId: 'mock_inv_past_due_alert',
        externalCustomerId: 'cus_past_due_alert',
        amountTotalUsd: 29,
        paidTier: 'pro',
      }),
      undefined,
    )

    const alerts = await service.getWorkspaceBillingAlerts('workspace_1')

    expect(alerts.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'billing_past_due',
          severity: 'critical',
        }),
      ]),
    )
  })

  it('creates mock customer portal sessions after checkout', async () => {
    const { service } = createBillingService({})

    const checkout = await service.createCheckoutSession({
      workspaceId: 'workspace_1',
      paidTier: 'pro',
      requestWorkspaceId: 'workspace_1',
    })
    await service.completeMockCheckout(checkout.sessionId)

    const portal = await service.createCustomerPortalSession({
      workspaceId: 'workspace_1',
      requestWorkspaceId: 'workspace_1',
    })

    expect(portal.portalUrl).toContain('/api/billing/mock/portal')

    const mockPortal = await service.getMockCustomerPortal('workspace_1')

    expect(mockPortal.availableActions).toContain('cancel_subscription')

    const canceled = await service.cancelMockCustomerPortalSubscription(
      'workspace_1',
    )

    expect(canceled.billingRecord).toMatchObject({
      paidTier: 'free',
      status: 'canceled',
    })
  })

  it('creates mock checkout sessions and completes them', async () => {
    const { service } = createBillingService({})

    const checkout = await service.createCheckoutSession({
      workspaceId: 'workspace_1',
      paidTier: 'pro',
      requestWorkspaceId: 'workspace_1',
    })

    expect(checkout.sessionId).toMatch(/^mock_cs_/)
    expect(checkout.checkoutUrl).toContain('/api/billing/mock/complete')

    const status = await service.completeMockCheckout(checkout.sessionId)

    expect(status).toMatchObject({
      workspaceId: 'workspace_1',
      billingRecord: {
        paidTier: 'pro',
        status: 'active',
      },
    })
  })

  it('handles mock webhook checkout completion with idempotency', async () => {
    const { service } = createBillingService({})
    const payload = JSON.stringify({
      eventId: 'mock_evt_checkout_1',
      event: 'checkout.completed',
      workspaceId: 'workspace_1',
      paidTier: 'business',
      externalCustomerId: 'cus_test',
    })

    const first = await service.handleWebhook(payload, undefined)

    expect(first).toEqual({
      received: true,
      handled: true,
      duplicate: false,
      externalEventId: 'mock_evt_checkout_1',
      eventType: 'checkout.completed',
    })

    const second = await service.handleWebhook(payload, undefined)

    expect(second).toEqual({
      received: true,
      handled: false,
      duplicate: true,
      externalEventId: 'mock_evt_checkout_1',
      eventType: 'checkout.completed',
    })

    const status = await service.getWorkspaceStatus('workspace_1')

    expect(status.billingRecord).toMatchObject({
      paidTier: 'business',
      status: 'active',
      externalCustomerId: 'cus_test',
    })

    const events = await service.listWorkspaceWebhookEvents('workspace_1')

    expect(events.events).toHaveLength(1)
    expect(events.events[0]).toMatchObject({
      externalEventId: 'mock_evt_checkout_1',
      status: 'processed',
    })

    const invoices = await service.listWorkspaceInvoices('workspace_1')

    expect(invoices.invoices).toHaveLength(1)
    expect(invoices.invoices[0]).toMatchObject({
      workspaceId: 'workspace_1',
      paidTier: 'business',
      status: 'paid',
      amountTotalUsd: 99,
    })
  })

  it('records failed invoice history from payment.failed webhooks', async () => {
    const { service } = createBillingService({})

    await service.handleWebhook(
      JSON.stringify({
        eventId: 'mock_evt_checkout_seed',
        event: 'checkout.completed',
        workspaceId: 'workspace_1',
        paidTier: 'pro',
        externalCustomerId: 'cus_failed',
      }),
      undefined,
    )

    await service.handleWebhook(
      JSON.stringify({
        eventId: 'mock_evt_invoice_failed',
        event: 'invoice.payment_failed',
        workspaceId: 'workspace_1',
        externalInvoiceId: 'mock_inv_failed',
        externalCustomerId: 'cus_failed',
        amountTotalUsd: 29,
        paidTier: 'pro',
      }),
      undefined,
    )

    const invoices = await service.listWorkspaceInvoices('workspace_1')

    expect(invoices.invoices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          externalInvoiceId: 'mock_inv_failed',
          status: 'failed',
          amountTotalUsd: 29,
        }),
        expect.objectContaining({
          status: 'paid',
        }),
      ]),
    )
  })

  it('exports workspace invoice history as csv and json', async () => {
    const { service } = createBillingService({})

    await service.handleWebhook(
      JSON.stringify({
        eventId: 'mock_evt_export_checkout',
        event: 'checkout.completed',
        workspaceId: 'workspace_1',
        paidTier: 'pro',
        externalCustomerId: 'cus_export',
      }),
      undefined,
    )

    const csvExport = await service.exportWorkspaceInvoices('workspace_1', 'csv')

    expect(csvExport.contentType).toContain('text/csv')
    expect(csvExport.filename).toMatch(/^workspace_1-invoices-\d{4}-\d{2}-\d{2}\.csv$/)
    expect(csvExport.body).toContain('billingInvoiceId,externalInvoiceId')
    expect(csvExport.body).toContain('inv_mock_evt_export_checkout')

    const jsonExport = await service.exportWorkspaceInvoices('workspace_1', 'json')

    expect(jsonExport.contentType).toContain('application/json')
    expect(jsonExport.filename).toMatch(/^workspace_1-invoices-\d{4}-\d{2}-\d{2}\.json$/)

    const parsed = JSON.parse(jsonExport.body)

    expect(parsed).toMatchObject({
      workspaceId: 'workspace_1',
      invoices: expect.arrayContaining([
        expect.objectContaining({
          externalInvoiceId: 'inv_mock_evt_export_checkout',
          status: 'paid',
        }),
      ]),
    })
  })

  it('marks unsupported mock webhook events as ignored', async () => {
    const { service } = createBillingService({})

    const result = await service.handleWebhook(
      JSON.stringify({
        eventId: 'mock_evt_unknown',
        event: 'invoice.created',
      }),
      undefined,
    )

    expect(result).toMatchObject({
      received: true,
      handled: false,
      duplicate: false,
    })

    const events = await service.listWorkspaceWebhookEvents('workspace_1')

    expect(events.events).toHaveLength(0)
  })

  it('returns billing admin summary for workspace owners', async () => {
    const { service } = createBillingService({})

    const summary = await service.getWorkspaceBillingAdminSummary(
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      'workspace_1',
    )

    expect(summary).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      availableActions: expect.arrayContaining(['sync_notifications']),
    })
    expect(summary.stats.invoiceCount).toBeGreaterThanOrEqual(0)
  })

  it('rejects billing admin tools for workspace members', async () => {
    const { service } = createBillingService({})

    await expect(
      service.getWorkspaceBillingAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can manage billing settings.',
      },
    })
  })

  it('resets mock billing through admin action', async () => {
    const { service, repository } = createBillingService({})

    await repository.activateSubscription({
      workspaceId: 'workspace_1',
      paidTier: 'pro',
      externalCustomerId: 'cus_admin_reset',
    })

    const result = await service.executeBillingAdminAction(
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      {
        workspaceId: 'workspace_1',
        action: 'reset_mock_billing',
      },
    )

    expect(result).toMatchObject({
      action: 'reset_mock_billing',
      billingRecord: {
        workspaceId: 'workspace_1',
        paidTier: 'free',
        status: 'draft',
        externalCustomerId: null,
      },
    })
  })
})
