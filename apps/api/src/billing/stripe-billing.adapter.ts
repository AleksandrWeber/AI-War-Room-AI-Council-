import Stripe from 'stripe'
import type {
  CheckoutPaidTier,
  CheckoutSessionResponse,
} from '@ai-war-room/schemas'
import type {
  BillingCheckoutAdapter,
  BillingWebhookEvent,
} from './billing.adapter.js'

export class StripeBillingAdapter implements BillingCheckoutAdapter {
  private readonly stripe: Stripe

  constructor(
    secretKey: string,
    private readonly webhookSecret: string,
    private readonly priceIds: Record<CheckoutPaidTier, string>,
  ) {
    this.stripe = new Stripe(secretKey)
  }

  async createCheckoutSession(input: {
    workspaceId: string
    paidTier: CheckoutPaidTier
    successUrl: string
    cancelUrl: string
  }): Promise<CheckoutSessionResponse> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      line_items: [
        {
          price: this.priceIds[input.paidTier],
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId: input.workspaceId,
        paidTier: input.paidTier,
      },
      subscription_data: {
        metadata: {
          workspaceId: input.workspaceId,
          paidTier: input.paidTier,
        },
      },
    })

    if (!session.url) {
      throw new Error('Stripe checkout session did not return a checkout URL.')
    }

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    }
  }

  async completeMockCheckout() {
    return null
  }

  async parseWebhookEvent(
    payload: Buffer | string,
    signature: string | undefined,
  ): Promise<BillingWebhookEvent | null> {
    if (!signature) {
      throw new Error('Missing Stripe-Signature header.')
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const workspaceId = session.metadata?.workspaceId
        const paidTier = session.metadata?.paidTier

        if (
          typeof workspaceId !== 'string' ||
          (paidTier !== 'pro' && paidTier !== 'business')
        ) {
          return null
        }

        return {
          type: 'checkout.completed',
          workspaceId,
          paidTier,
          externalCustomerId:
            typeof session.customer === 'string'
              ? session.customer
              : session.customer?.id,
        }
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const workspaceId = subscription.metadata?.workspaceId

        if (typeof workspaceId !== 'string') {
          return null
        }

        const status = this.mapSubscriptionStatus(subscription.status)
        const paidTier = subscription.metadata?.paidTier

        return {
          type: 'subscription.updated',
          workspaceId,
          status,
          paidTier:
            paidTier === 'pro' || paidTier === 'business' || paidTier === 'free'
              ? paidTier
              : undefined,
        }
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const workspaceId = subscription.metadata?.workspaceId

        if (typeof workspaceId !== 'string') {
          return null
        }

        return {
          type: 'subscription.canceled',
          workspaceId,
        }
      }
      default:
        return null
    }
  }

  private mapSubscriptionStatus(
    status: Stripe.Subscription.Status,
  ): 'draft' | 'active' | 'past_due' | 'canceled' {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'active'
      case 'past_due':
      case 'unpaid':
        return 'past_due'
      case 'canceled':
      case 'incomplete_expired':
        return 'canceled'
      default:
        return 'draft'
    }
  }
}
