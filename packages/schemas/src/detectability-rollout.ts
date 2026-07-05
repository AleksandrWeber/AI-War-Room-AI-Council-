import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const detectabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DetectabilityRolloutCheckStatus = z.infer<
  typeof detectabilityRolloutCheckStatusSchema
>

export const detectabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: detectabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DetectabilityRolloutCheck = z.infer<typeof detectabilityRolloutCheckSchema>

export const detectabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DetectabilityRolloutStatus = z.infer<typeof detectabilityRolloutStatusSchema>

export const detectabilityCapabilitiesResponseSchema = z.object({
  supportsDetectabilityRollout: z.literal(true),
  supportsDetectabilityAdminTools: z.literal(true),
  supportsBillingWebhookDetectabilitySignals: z.literal(true),
  supportsBillingNotificationDetectabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DetectabilityCapabilitiesResponse = z.infer<
  typeof detectabilityCapabilitiesResponseSchema
>

export const detectabilityRolloutResponseSchema = z.object({
  status: detectabilityRolloutStatusSchema,
  checks: z.array(detectabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DetectabilityRolloutResponse = z.infer<
  typeof detectabilityRolloutResponseSchema
>

export function getDetectabilityRolloutGuidance() {
  return 'Production detectability rollout validates billing webhook detectability, billing notification detectability signals, idempotency key coverage, and detection readiness before production detectability tooling.'
}
