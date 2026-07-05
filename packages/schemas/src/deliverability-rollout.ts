import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const deliverabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeliverabilityRolloutCheckStatus = z.infer<
  typeof deliverabilityRolloutCheckStatusSchema
>

export const deliverabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: deliverabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeliverabilityRolloutCheck = z.infer<typeof deliverabilityRolloutCheckSchema>

export const deliverabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeliverabilityRolloutStatus = z.infer<typeof deliverabilityRolloutStatusSchema>

export const deliverabilityCapabilitiesResponseSchema = z.object({
  supportsDeliverabilityRollout: z.literal(true),
  supportsDeliverabilityAdminTools: z.literal(true),
  supportsBillingNotificationDeliverabilitySignals: z.literal(true),
  supportsBillingWebhookDeliverabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DeliverabilityCapabilitiesResponse = z.infer<
  typeof deliverabilityCapabilitiesResponseSchema
>

export const deliverabilityRolloutResponseSchema = z.object({
  status: deliverabilityRolloutStatusSchema,
  checks: z.array(deliverabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeliverabilityRolloutResponse = z.infer<
  typeof deliverabilityRolloutResponseSchema
>

export function getDeliverabilityRolloutGuidance() {
  return 'Production deliverability rollout validates billing notification deliverability, billing webhook deliverability signals, usage event coverage, and delivery readiness before production deliverability tooling.'
}
