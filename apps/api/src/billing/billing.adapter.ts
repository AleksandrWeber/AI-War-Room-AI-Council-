import type {
  BillingStatus,
  CheckoutPaidTier,
  CheckoutSessionResponse,
  CustomerPortalSessionResponse,
} from '@ai-war-room/schemas'

export const BILLING_ADAPTER = Symbol('BILLING_ADAPTER')

export type BillingWebhookEvent =
  | {
      type: 'checkout.completed'
      workspaceId: string
      paidTier: CheckoutPaidTier
      externalCustomerId?: string
    }
  | {
      type: 'subscription.updated'
      workspaceId: string
      status: BillingStatus
      paidTier?: CheckoutPaidTier | 'free'
    }
  | {
      type: 'subscription.canceled'
      workspaceId: string
    }
  | {
      type: 'payment.failed'
      externalCustomerId: string
    }

export type ParsedBillingWebhookResult = {
  externalEventId: string
  eventType: string
  providerEvent: BillingWebhookEvent | null
}

export interface BillingCheckoutAdapter {
  createCheckoutSession(input: {
    workspaceId: string
    paidTier: CheckoutPaidTier
    successUrl: string
    cancelUrl: string
  }): Promise<CheckoutSessionResponse>
  completeMockCheckout(sessionId: string): Promise<{
    workspaceId: string
    paidTier: CheckoutPaidTier
  } | null>
  parseWebhookEvent(
    payload: Buffer | string,
    signature: string | undefined,
  ): Promise<ParsedBillingWebhookResult>
  createCustomerPortalSession(input: {
    workspaceId: string
    externalCustomerId: string
    returnUrl: string
  }): Promise<CustomerPortalSessionResponse>
}
