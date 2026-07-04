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
  checkoutTiers: z.array(checkoutPaidTierSchema),
  guidance: z.string(),
})
export type BillingCapabilitiesResponse = z.infer<
  typeof billingCapabilitiesResponseSchema
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

export function getBillingGuidance(input: {
  enabled: boolean
  adapter: BillingAdapter
}) {
  if (!input.enabled) {
    return 'Billing checkout is disabled. Set STRIPE_ENABLED=true to activate billing flows.'
  }

  if (input.adapter === 'mock') {
    return 'Mock billing is active. Checkout returns a local completion URL for development and tests.'
  }

  return 'Stripe billing is active. Use POST /api/billing/checkout-session to start checkout and configure Stripe webhooks to POST /api/billing/webhook.'
}
