import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { MockBillingAdapter } from './mock-billing.adapter.js'
import { InMemoryBillingRepository } from './in-memory-billing.repository.js'
import { BillingService } from './billing.service.js'

function createBillingService(env: Partial<ApiEnv>) {
  const config = {
    STRIPE_ENABLED: true,
    STRIPE_BILLING_ADAPTER: 'mock',
    STRIPE_SUCCESS_URL: 'http://127.0.0.1:5173/billing/success',
    STRIPE_CANCEL_URL: 'http://127.0.0.1:5173/billing/cancel',
    API_PORT: 3000,
    ...env,
  } as ApiEnv

  const configService = {
    get: (key: keyof ApiEnv) => config[key],
  } as ConfigService<ApiEnv, true>

  const repository = new InMemoryBillingRepository()
  const adapter = new MockBillingAdapter('http://127.0.0.1:3000')

  return {
    service: new BillingService(configService, repository, adapter),
    repository,
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

  it('handles mock webhook checkout completion', async () => {
    const { service } = createBillingService({})

    const result = await service.handleWebhook(
      JSON.stringify({
        event: 'checkout.completed',
        workspaceId: 'workspace_1',
        paidTier: 'business',
        externalCustomerId: 'cus_test',
      }),
      undefined,
    )

    expect(result).toEqual({ received: true, handled: true })

    const status = await service.getWorkspaceStatus('workspace_1')

    expect(status.billingRecord).toMatchObject({
      paidTier: 'business',
      status: 'active',
      externalCustomerId: 'cus_test',
    })
  })
})
