import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const confirmabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConfirmabilityRolloutCheckStatus = z.infer<
  typeof confirmabilityRolloutCheckStatusSchema
>

export const confirmabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: confirmabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConfirmabilityRolloutCheck = z.infer<typeof confirmabilityRolloutCheckSchema>

export const confirmabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConfirmabilityRolloutStatus = z.infer<typeof confirmabilityRolloutStatusSchema>

export const confirmabilityCapabilitiesResponseSchema = z.object({
  supportsConfirmabilityRollout: z.literal(true),
  supportsConfirmabilityAdminTools: z.literal(true),
  supportsBillingNotificationConfirmabilitySignals: z.literal(true),
  supportsUsageLimitConfirmabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConfirmabilityCapabilitiesResponse = z.infer<
  typeof confirmabilityCapabilitiesResponseSchema
>

export const confirmabilityRolloutResponseSchema = z.object({
  status: confirmabilityRolloutStatusSchema,
  checks: z.array(confirmabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConfirmabilityRolloutResponse = z.infer<
  typeof confirmabilityRolloutResponseSchema
>

export function getConfirmabilityRolloutGuidance() {
  return 'Production confirmability rollout validates billing notification confirmability, usage limit confirmability signals, meter usage reporting coverage, and acknowledgment readiness before production confirmability tooling.'
}
