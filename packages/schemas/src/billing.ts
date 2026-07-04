import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { paidTierSchema } from './usage.js'

export const billingStatusSchema = z.enum([
  'draft',
  'active',
  'past_due',
  'canceled',
])
export type BillingStatus = z.infer<typeof billingStatusSchema>

export const billingAdapterSchema = z.enum(['mock', 'stripe'])
export type BillingAdapter = z.infer<typeof billingAdapterSchema>

export const checkoutPaidTierSchema = z.enum(['pro', 'business'])
export type CheckoutPaidTier = z.infer<typeof checkoutPaidTierSchema>

export const billingRecordSchema = z.object({
  billingRecordId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  provider: z.literal('stripe'),
  externalCustomerId: z.string().nullable(),
  paidTier: paidTierSchema,
  status: billingStatusSchema,
  createdAt: utcDateStringSchema,
  updatedAt: utcDateStringSchema,
})
export type BillingRecord = z.infer<typeof billingRecordSchema>

export const billingCapabilitiesResponseSchema = z.object({
  enabled: z.boolean(),
  adapter: billingAdapterSchema,
  supportsCheckout: z.boolean(),
  supportsCustomerPortal: z.boolean(),
  supportsWebhookAudit: z.boolean(),
  checkoutTiers: z.array(checkoutPaidTierSchema),
  guidance: z.string(),
})
export type BillingCapabilitiesResponse = z.infer<
  typeof billingCapabilitiesResponseSchema
>

export const createCustomerPortalSessionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
})
export type CreateCustomerPortalSessionRequest = z.infer<
  typeof createCustomerPortalSessionRequestSchema
>

export const customerPortalSessionResponseSchema = z.object({
  portalUrl: z.url(),
})
export type CustomerPortalSessionResponse = z.infer<
  typeof customerPortalSessionResponseSchema
>

export const customerPortalActionSchema = z.enum([
  'cancel_subscription',
  'update_payment_method',
])
export type CustomerPortalAction = z.infer<typeof customerPortalActionSchema>

export const mockCustomerPortalResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  externalCustomerId: nonEmptyStringSchema,
  paidTier: paidTierSchema,
  status: billingStatusSchema,
  availableActions: z.array(customerPortalActionSchema),
})
export type MockCustomerPortalResponse = z.infer<
  typeof mockCustomerPortalResponseSchema
>

export const createCheckoutSessionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  paidTier: checkoutPaidTierSchema,
})
export type CreateCheckoutSessionRequest = z.infer<
  typeof createCheckoutSessionRequestSchema
>

export const checkoutSessionResponseSchema = z.object({
  sessionId: nonEmptyStringSchema,
  checkoutUrl: z.url(),
})
export type CheckoutSessionResponse = z.infer<
  typeof checkoutSessionResponseSchema
>

export const billingWorkspaceStatusResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  billingRecord: billingRecordSchema.nullable(),
})
export type BillingWorkspaceStatusResponse = z.infer<
  typeof billingWorkspaceStatusResponseSchema
>

export const billingWebhookEventStatusSchema = z.enum([
  'received',
  'processed',
  'ignored',
  'duplicate',
  'failed',
])
export type BillingWebhookEventStatus = z.infer<
  typeof billingWebhookEventStatusSchema
>

export const billingWebhookEventRecordSchema = z.object({
  billingWebhookEventId: nonEmptyStringSchema,
  provider: billingAdapterSchema,
  externalEventId: nonEmptyStringSchema,
  eventType: nonEmptyStringSchema,
  workspaceId: z.string().nullable(),
  status: billingWebhookEventStatusSchema,
  errorMessage: z.string().nullable(),
  receivedAt: utcDateStringSchema,
  processedAt: utcDateStringSchema.nullable(),
})
export type BillingWebhookEventRecord = z.infer<
  typeof billingWebhookEventRecordSchema
>

export const billingWebhookHandleResponseSchema = z.object({
  received: z.literal(true),
  handled: z.boolean(),
  duplicate: z.boolean(),
  externalEventId: nonEmptyStringSchema.optional(),
  eventType: nonEmptyStringSchema.optional(),
})
export type BillingWebhookHandleResponse = z.infer<
  typeof billingWebhookHandleResponseSchema
>

export const billingWebhookEventsResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  events: z.array(billingWebhookEventRecordSchema),
})
export type BillingWebhookEventsResponse = z.infer<
  typeof billingWebhookEventsResponseSchema
>

export function getBillingGuidance(input: {
  enabled: boolean
  adapter: BillingAdapter
}) {
  if (!input.enabled) {
    return 'Billing checkout is disabled. Set STRIPE_ENABLED=true to activate billing flows.'
  }

  if (input.adapter === 'mock') {
    return 'Mock billing is active. Checkout and customer portal flows run locally for development and tests.'
  }

  return 'Stripe billing is active. Use checkout for upgrades, the customer portal for subscription management, and configure webhooks to POST /api/billing/webhook with idempotent event processing.'
}
