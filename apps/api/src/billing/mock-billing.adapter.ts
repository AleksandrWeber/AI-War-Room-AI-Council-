import { randomUUID } from 'node:crypto'
import type {
  CheckoutPaidTier,
  CheckoutSessionResponse,
  CustomerPortalSessionResponse,
} from '@ai-war-room/schemas'
import type {
  BillingCheckoutAdapter,
  ParsedBillingWebhookResult,
} from './billing.adapter.js'

type PendingCheckout = {
  sessionId: string
  workspaceId: string
  paidTier: CheckoutPaidTier
}

export class MockBillingAdapter implements BillingCheckoutAdapter {
  private readonly pendingCheckouts = new Map<string, PendingCheckout>()

  constructor(private readonly apiBaseUrl: string) {}

  async createCheckoutSession(input: {
    workspaceId: string
    paidTier: CheckoutPaidTier
    successUrl: string
    cancelUrl: string
  }): Promise<CheckoutSessionResponse> {
    const sessionId = `mock_cs_${randomUUID()}`
    this.pendingCheckouts.set(sessionId, {
      sessionId,
      workspaceId: input.workspaceId,
      paidTier: input.paidTier,
    })

    return {
      sessionId,
      checkoutUrl: `${this.apiBaseUrl}/api/billing/mock/complete?sessionId=${encodeURIComponent(sessionId)}`,
    }
  }

  async completeMockCheckout(sessionId: string) {
    return this.pendingCheckouts.get(sessionId) ?? null
  }

  async createCustomerPortalSession(input: {
    workspaceId: string
    externalCustomerId: string
    returnUrl: string
  }): Promise<CustomerPortalSessionResponse> {
    void input.externalCustomerId
    void input.returnUrl

    return {
      portalUrl: `${this.apiBaseUrl}/api/billing/mock/portal?workspaceId=${encodeURIComponent(input.workspaceId)}`,
    }
  }

  async parseWebhookEvent(
    payload: Buffer | string,
  ): Promise<ParsedBillingWebhookResult> {
    const body =
      typeof payload === 'string'
        ? (JSON.parse(payload) as Record<string, unknown>)
        : (JSON.parse(payload.toString('utf8')) as Record<string, unknown>)
    const externalEventId =
      typeof body.eventId === 'string' && body.eventId.trim().length > 0
        ? body.eventId
        : `mock_evt_${randomUUID()}`
    const eventType =
      typeof body.event === 'string' ? body.event : 'unknown.mock_event'

    if (body.event === 'checkout.completed') {
      const workspaceId = body.workspaceId
      const paidTier = body.paidTier

      if (
        typeof workspaceId !== 'string' ||
        (paidTier !== 'pro' && paidTier !== 'business')
      ) {
        return {
          externalEventId,
          eventType,
          providerEvent: null,
        }
      }

      return {
        externalEventId,
        eventType,
        providerEvent: {
          type: 'checkout.completed',
          workspaceId,
          paidTier,
          externalCustomerId:
            typeof body.externalCustomerId === 'string'
              ? body.externalCustomerId
              : undefined,
        },
      }
    }

    if (body.event === 'subscription.canceled') {
      const workspaceId = body.workspaceId

      if (typeof workspaceId !== 'string') {
        return {
          externalEventId,
          eventType,
          providerEvent: null,
        }
      }

      return {
        externalEventId,
        eventType,
        providerEvent: {
          type: 'subscription.canceled',
          workspaceId,
        },
      }
    }

    if (body.event === 'subscription.updated') {
      const workspaceId = body.workspaceId
      const status = body.status

      if (
        typeof workspaceId !== 'string' ||
        (status !== 'active' &&
          status !== 'past_due' &&
          status !== 'canceled' &&
          status !== 'draft')
      ) {
        return {
          externalEventId,
          eventType,
          providerEvent: null,
        }
      }

      return {
        externalEventId,
        eventType,
        providerEvent: {
          type: 'subscription.updated',
          workspaceId,
          status,
          paidTier:
            body.paidTier === 'pro' ||
            body.paidTier === 'business' ||
            body.paidTier === 'free'
              ? body.paidTier
              : undefined,
        },
      }
    }

    return {
      externalEventId,
      eventType,
      providerEvent: null,
    }
  }
}
