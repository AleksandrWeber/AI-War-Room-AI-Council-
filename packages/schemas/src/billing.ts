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
  supportsInvoiceHistory: z.boolean(),
  supportsUsageSummary: z.boolean(),
  supportsBillingExport: z.boolean(),
  supportsBillingAlerts: z.boolean(),
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

export const billingInvoiceStatusSchema = z.enum([
  'draft',
  'open',
  'paid',
  'void',
  'uncollectible',
  'failed',
])
export type BillingInvoiceStatus = z.infer<typeof billingInvoiceStatusSchema>

export const billingInvoiceRecordSchema = z.object({
  billingInvoiceId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  provider: billingAdapterSchema,
  externalInvoiceId: nonEmptyStringSchema,
  externalCustomerId: z.string().nullable(),
  paidTier: paidTierSchema.nullable(),
  amountTotalUsd: z.number().nonnegative(),
  currency: z.string().trim().min(1),
  status: billingInvoiceStatusSchema,
  hostedInvoiceUrl: z.string().nullable(),
  invoicePdfUrl: z.string().nullable(),
  periodStart: utcDateStringSchema.nullable(),
  periodEnd: utcDateStringSchema.nullable(),
  createdAt: utcDateStringSchema,
  updatedAt: utcDateStringSchema,
})
export type BillingInvoiceRecord = z.infer<typeof billingInvoiceRecordSchema>

export const billingInvoicesResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  invoices: z.array(billingInvoiceRecordSchema),
})
export type BillingInvoicesResponse = z.infer<
  typeof billingInvoicesResponseSchema
>

export const billingDailyUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  estimatedCostUsd: z.number().nonnegative(),
})
export type BillingDailyUsage = z.infer<typeof billingDailyUsageSchema>

export const billingWorkspaceUsageResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  paidTier: paidTierSchema,
  dailyTokenLimit: z.number().int().positive(),
  dailyCostLimitUsd: z.number().positive(),
  dailyUsage: billingDailyUsageSchema,
  usagePeriodStart: utcDateStringSchema,
  usagePeriodEnd: utcDateStringSchema,
})
export type BillingWorkspaceUsageResponse = z.infer<
  typeof billingWorkspaceUsageResponseSchema
>

export const billingExportFormatSchema = z.enum(['csv', 'json'])
export type BillingExportFormat = z.infer<typeof billingExportFormatSchema>

export const billingAlertSeveritySchema = z.enum(['info', 'warning', 'critical'])
export type BillingAlertSeverity = z.infer<typeof billingAlertSeveritySchema>

export const billingAlertTypeSchema = z.enum([
  'usage_tokens',
  'usage_cost',
  'billing_past_due',
  'billing_canceled',
])
export type BillingAlertType = z.infer<typeof billingAlertTypeSchema>

export const billingAlertSchema = z.object({
  billingAlertId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  type: billingAlertTypeSchema,
  severity: billingAlertSeveritySchema,
  message: nonEmptyStringSchema,
  createdAt: utcDateStringSchema,
})
export type BillingAlert = z.infer<typeof billingAlertSchema>

export const billingWorkspaceAlertsResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  alerts: z.array(billingAlertSchema),
})
export type BillingWorkspaceAlertsResponse = z.infer<
  typeof billingWorkspaceAlertsResponseSchema
>

export function getBillingGuidance(input: {
  enabled: boolean
  adapter: BillingAdapter
}) {
  if (!input.enabled) {
    return 'Billing checkout is disabled. Set STRIPE_ENABLED=true to activate billing flows.'
  }

  if (input.adapter === 'mock') {
    return 'Mock billing is active. Checkout, customer portal, invoice history, usage summary, billing export, and billing alerts run locally for development and tests.'
  }

  return 'Stripe billing is active. Use checkout for upgrades, the customer portal for subscription management, and configure webhooks for idempotent billing, invoice history, usage summary, export, and alert updates.'
}
