import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const adaptabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AdaptabilityRolloutCheckStatus = z.infer<
  typeof adaptabilityRolloutCheckStatusSchema
>

export const adaptabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: adaptabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AdaptabilityRolloutCheck = z.infer<typeof adaptabilityRolloutCheckSchema>

export const adaptabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AdaptabilityRolloutStatus = z.infer<typeof adaptabilityRolloutStatusSchema>

export const adaptabilityCapabilitiesResponseSchema = z.object({
  supportsAdaptabilityRollout: z.literal(true),
  supportsAdaptabilityAdminTools: z.literal(true),
  supportsBillingWebhookAdaptabilitySignals: z.literal(true),
  supportsBillingNotificationAdaptabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AdaptabilityCapabilitiesResponse = z.infer<
  typeof adaptabilityCapabilitiesResponseSchema
>

export const adaptabilityRolloutResponseSchema = z.object({
  status: adaptabilityRolloutStatusSchema,
  checks: z.array(adaptabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AdaptabilityRolloutResponse = z.infer<
  typeof adaptabilityRolloutResponseSchema
>

export function getAdaptabilityRolloutGuidance() {
  return 'Production adaptability rollout validates billing webhook adaptability, billing notification adaptability signals, idempotency coverage, and adaptation readiness before production adaptability tooling.'
}
