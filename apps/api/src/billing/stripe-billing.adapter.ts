import Stripe from 'stripe'
import type {
  CheckoutPaidTier,
  CheckoutSessionResponse,
  CustomerPortalSessionResponse,
} from '@ai-war-room/schemas'
import type {
  BillingCheckoutAdapter,
  ParsedBillingWebhookResult,
} from './billing.adapter.js'

export class StripeBillingAdapter implements BillingCheckoutAdapter {
  private readonly stripe: Stripe

  constructor(
    secretKey: string,
    private readonly webhookSecret: string,
    private readonly priceIds: Record<CheckoutPaidTier, string>,
    private readonly meterEventName?: string,
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

  async createCustomerPortalSession(input: {
    workspaceId: string
    externalCustomerId: string
    returnUrl: string
  }): Promise<CustomerPortalSessionResponse> {
    void input.workspaceId

    const session = await this.stripe.billingPortal.sessions.create({
      customer: input.externalCustomerId,
      return_url: input.returnUrl,
    })

    return {
      portalUrl: session.url,
    }
  }

  async reportMeteredUsage(input: {
    externalSubscriptionItemId: string
    externalCustomerId?: string
    quantity: number
    timestamp?: number
  }) {
    void input.externalSubscriptionItemId

    if (!this.meterEventName || !input.externalCustomerId) {
      throw new Error(
        'Stripe metered usage requires STRIPE_METER_EVENT_NAME and a billing customer id.',
      )
    }

    const event = await this.stripe.billing.meterEvents.create({
      event_name: this.meterEventName,
      payload: {
        stripe_customer_id: input.externalCustomerId,
        value: String(input.quantity),
      },
      timestamp: input.timestamp ?? Math.floor(Date.now() / 1000),
    })

    return {
      externalUsageRecordId: event.identifier,
    }
  }

  async completeMockCheckout() {
    return null
  }

  async parseWebhookEvent(
    payload: Buffer | string,
    signature: string | undefined,
  ): Promise<ParsedBillingWebhookResult> {
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
          return {
            externalEventId: event.id,
            eventType: event.type,
            providerEvent: null,
          }
        }

        let externalSubscriptionItemId: string | undefined

        if (typeof session.subscription === 'string') {
          const subscription = await this.stripe.subscriptions.retrieve(
            session.subscription,
          )
          externalSubscriptionItemId = subscription.items.data[0]?.id
        }

        return {
          externalEventId: event.id,
          eventType: event.type,
          providerEvent: {
            type: 'checkout.completed',
            workspaceId,
            paidTier,
            externalCustomerId:
              typeof session.customer === 'string'
                ? session.customer
                : session.customer?.id,
            externalSubscriptionItemId,
          },
        }
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const workspaceId = subscription.metadata?.workspaceId

        if (typeof workspaceId !== 'string') {
          return {
            externalEventId: event.id,
            eventType: event.type,
            providerEvent: null,
          }
        }

        const status = this.mapSubscriptionStatus(subscription.status)
        const paidTier = subscription.metadata?.paidTier

        return {
          externalEventId: event.id,
          eventType: event.type,
          providerEvent: {
            type: 'subscription.updated',
            workspaceId,
            status,
            paidTier:
              paidTier === 'pro' || paidTier === 'business' || paidTier === 'free'
                ? paidTier
                : undefined,
          },
        }
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const workspaceId = subscription.metadata?.workspaceId

        if (typeof workspaceId !== 'string') {
          return {
            externalEventId: event.id,
            eventType: event.type,
            providerEvent: null,
          }
        }

        return {
          externalEventId: event.id,
          eventType: event.type,
          providerEvent: {
            type: 'subscription.canceled',
            workspaceId,
          },
        }
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id

        if (!customerId || !invoice.id) {
          return {
            externalEventId: event.id,
            eventType: event.type,
            providerEvent: null,
          }
        }

        return {
          externalEventId: event.id,
          eventType: event.type,
          providerEvent: {
            type: 'payment.failed',
            externalCustomerId: customerId,
            externalInvoiceId: invoice.id,
            amountTotalUsd: Number(invoice.total ?? 0) / 100,
            currency: invoice.currency ?? 'usd',
          },
        }
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id

        if (!customerId || !invoice.id) {
          return {
            externalEventId: event.id,
            eventType: event.type,
            providerEvent: null,
          }
        }

        const paidTier = invoice.metadata?.paidTier

        return {
          externalEventId: event.id,
          eventType: event.type,
          providerEvent: {
            type: 'invoice.recorded',
            workspaceId:
              typeof invoice.metadata?.workspaceId === 'string'
                ? invoice.metadata.workspaceId
                : undefined,
            externalCustomerId: customerId,
            externalInvoiceId: invoice.id,
            paidTier:
              paidTier === 'pro' || paidTier === 'business' || paidTier === 'free'
                ? paidTier
                : null,
            amountTotalUsd: Number(invoice.amount_paid ?? invoice.total ?? 0) / 100,
            currency: invoice.currency ?? 'usd',
            status: 'paid',
            hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
            invoicePdfUrl: invoice.invoice_pdf ?? undefined,
            periodStart: invoice.period_start
              ? new Date(invoice.period_start * 1000).toISOString()
              : undefined,
            periodEnd: invoice.period_end
              ? new Date(invoice.period_end * 1000).toISOString()
              : undefined,
          },
        }
      }
      default:
        return {
          externalEventId: event.id,
          eventType: event.type,
          providerEvent: null,
        }
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
