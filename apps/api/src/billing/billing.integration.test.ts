import { Test } from '@nestjs/testing'
import type { TestingModule } from '@nestjs/testing'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  process.env.STRIPE_ENABLED = 'true'
  process.env.STRIPE_BILLING_ADAPTER = 'mock'
})

const authHeaders = {
  'x-user-id': 'user_test',
  'x-workspace-id': 'workspace_1',
}

describe('billing integration', () => {
  let app: NestFastifyApplication | undefined
  let moduleRef: TestingModule | undefined

  beforeAll(async () => {
    const { AppModule } = await import('../app.module.js')

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    app.setGlobalPrefix('api')
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    delete process.env.STRIPE_ENABLED
    delete process.env.STRIPE_BILLING_ADAPTER
    await app?.close()
  })

  it('reports billing capabilities', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/billing/capabilities')
      .expect(200)

    expect(response.body).toMatchObject({
      enabled: true,
      adapter: 'mock',
      supportsCheckout: true,
      supportsCustomerPortal: true,
      supportsWebhookAudit: true,
      checkoutTiers: ['pro', 'business'],
    })
  })

  it('returns workspace billing status for members', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/billing/workspace/workspace_1')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      billingRecord: {
        workspaceId: 'workspace_1',
        paidTier: 'free',
        status: 'draft',
      },
    })
  })

  it('creates checkout sessions and completes mock billing', async () => {
    const checkoutResponse = await request(app!.getHttpServer())
      .post('/api/billing/checkout-session')
      .set(authHeaders)
      .send({
        workspaceId: 'workspace_1',
        paidTier: 'pro',
      })
      .expect(201)

    expect(checkoutResponse.body.checkoutUrl).toContain('/api/billing/mock/complete')

    const completeResponse = await request(app!.getHttpServer())
      .get(checkoutResponse.body.checkoutUrl.replace(/^https?:\/\/[^/]+/, ''))
      .expect(200)

    expect(completeResponse.body).toMatchObject({
      workspaceId: 'workspace_1',
      billingRecord: {
        paidTier: 'pro',
        status: 'active',
      },
    })
  })

  it('opens mock customer portal sessions and cancels subscriptions', async () => {
    const checkoutResponse = await request(app!.getHttpServer())
      .post('/api/billing/checkout-session')
      .set(authHeaders)
      .send({
        workspaceId: 'workspace_1',
        paidTier: 'business',
      })
      .expect(201)

    await request(app!.getHttpServer())
      .get(checkoutResponse.body.checkoutUrl.replace(/^https?:\/\/[^/]+/, ''))
      .expect(200)

    const portalResponse = await request(app!.getHttpServer())
      .post('/api/billing/customer-portal-session')
      .set(authHeaders)
      .send({
        workspaceId: 'workspace_1',
      })
      .expect(201)

    expect(portalResponse.body.portalUrl).toContain('/api/billing/mock/portal')

    const mockPortalResponse = await request(app!.getHttpServer())
      .get(portalResponse.body.portalUrl.replace(/^https?:\/\/[^/]+/, ''))
      .expect(200)

    expect(mockPortalResponse.body.availableActions).toContain(
      'cancel_subscription',
    )

    const cancelResponse = await request(app!.getHttpServer())
      .post('/api/billing/mock/portal/cancel')
      .set(authHeaders)
      .send({
        workspaceId: 'workspace_1',
      })
      .expect(201)

    expect(cancelResponse.body).toMatchObject({
      workspaceId: 'workspace_1',
      billingRecord: {
        paidTier: 'free',
        status: 'canceled',
      },
    })
  })

  it('records webhook events idempotently and exposes workspace audit history', async () => {
    const payload = {
      eventId: 'mock_evt_integration_1',
      event: 'checkout.completed',
      workspaceId: 'workspace_1',
      paidTier: 'pro',
      externalCustomerId: 'cus_integration',
    }

    const first = await request(app!.getHttpServer())
      .post('/api/billing/webhook')
      .send(payload)
      .expect(201)

    expect(first.body).toMatchObject({
      received: true,
      handled: true,
      duplicate: false,
    })

    const duplicate = await request(app!.getHttpServer())
      .post('/api/billing/webhook')
      .send(payload)
      .expect(201)

    expect(duplicate.body).toMatchObject({
      received: true,
      handled: false,
      duplicate: true,
    })

    const eventsResponse = await request(app!.getHttpServer())
      .get('/api/billing/workspace/workspace_1/webhook-events')
      .set(authHeaders)
      .expect(200)

    expect(eventsResponse.body.events).toHaveLength(1)
    expect(eventsResponse.body.events[0]).toMatchObject({
      externalEventId: 'mock_evt_integration_1',
      status: 'processed',
      workspaceId: 'workspace_1',
    })
  })
})
