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
  ): Promise<BillingWebhookEvent | null>
  createCustomerPortalSession(input: {
    workspaceId: string
    externalCustomerId: string
    returnUrl: string
  }): Promise<CustomerPortalSessionResponse>
}
