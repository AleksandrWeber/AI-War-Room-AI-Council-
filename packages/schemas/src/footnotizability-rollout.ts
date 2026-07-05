import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const footnotizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FootnotizabilityRolloutCheckStatus = z.infer<
  typeof footnotizabilityRolloutCheckStatusSchema
>

export const footnotizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: footnotizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FootnotizabilityRolloutCheck = z.infer<typeof footnotizabilityRolloutCheckSchema>

export const footnotizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FootnotizabilityRolloutStatus = z.infer<typeof footnotizabilityRolloutStatusSchema>

export const footnotizabilityCapabilitiesResponseSchema = z.object({
  supportsFootnotizabilityRollout: z.literal(true),
  supportsFootnotizabilityAdminTools: z.literal(true),
  supportsBillingNotificationFootnotizabilitySignals: z.literal(true),
  supportsBillingWebhookFootnotizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FootnotizabilityCapabilitiesResponse = z.infer<
  typeof footnotizabilityCapabilitiesResponseSchema
>

export const footnotizabilityRolloutResponseSchema = z.object({
  status: footnotizabilityRolloutStatusSchema,
  checks: z.array(footnotizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FootnotizabilityRolloutResponse = z.infer<
  typeof footnotizabilityRolloutResponseSchema
>

export function getFootnotizabilityRolloutGuidance() {
  return 'Production footnotizability rollout validates billing notification footnotizability, billing webhook footnotizability signals, usage event coverage, and footnotization readiness before production footnotizability tooling.'
}
