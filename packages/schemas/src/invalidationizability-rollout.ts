import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const invalidationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InvalidationizabilityRolloutCheckStatus = z.infer<
  typeof invalidationizabilityRolloutCheckStatusSchema
>

export const invalidationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: invalidationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InvalidationizabilityRolloutCheck = z.infer<typeof invalidationizabilityRolloutCheckSchema>

export const invalidationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InvalidationizabilityRolloutStatus = z.infer<typeof invalidationizabilityRolloutStatusSchema>

export const invalidationizabilityCapabilitiesResponseSchema = z.object({
  supportsInvalidationizabilityRollout: z.literal(true),
  supportsInvalidationizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyInvalidationizabilitySignals: z.literal(true),
  supportsUsageEventInvalidationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InvalidationizabilityCapabilitiesResponse = z.infer<
  typeof invalidationizabilityCapabilitiesResponseSchema
>

export const invalidationizabilityRolloutResponseSchema = z.object({
  status: invalidationizabilityRolloutStatusSchema,
  checks: z.array(invalidationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InvalidationizabilityRolloutResponse = z.infer<
  typeof invalidationizabilityRolloutResponseSchema
>

export function getInvalidationizabilityRolloutGuidance() {
  return 'Production invalidationizability rollout validates idempotency key invalidationizability, usage event invalidationizability signals, billing webhook coverage, and invalidationization readiness before production invalidationizability tooling.'
}
