import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { MockBillingAdapter } from './mock-billing.adapter.js'
import { InMemoryBillingRepository } from './in-memory-billing.repository.js'
import { InMemoryBillingInvoiceRepository } from './in-memory-billing-invoice.repository.js'
import { InMemoryBillingWebhookRepository } from './in-memory-billing-webhook.repository.js'
import { BillingService } from './billing.service.js'

function createBillingService(env: Partial<ApiEnv>) {
  const config = {
    STRIPE_ENABLED: true,
    STRIPE_BILLING_ADAPTER: 'mock',
    STRIPE_SUCCESS_URL: 'http://127.0.0.1:5173/billing/success',
    STRIPE_CANCEL_URL: 'http://127.0.0.1:5173/billing/cancel',
    STRIPE_PORTAL_RETURN_URL: 'http://127.0.0.1:5173/billing/portal',
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

  return {
    service: new BillingService(
      configService,
      repository,
      webhookRepository,
      invoiceRepository,
      adapter,
    ),
    repository,
    webhookRepository,
    invoiceRepository,
    adapter,
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
    })
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
})
