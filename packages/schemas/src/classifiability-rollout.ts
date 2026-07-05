import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const classifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ClassifiabilityRolloutCheckStatus = z.infer<
  typeof classifiabilityRolloutCheckStatusSchema
>

export const classifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: classifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ClassifiabilityRolloutCheck = z.infer<typeof classifiabilityRolloutCheckSchema>

export const classifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ClassifiabilityRolloutStatus = z.infer<typeof classifiabilityRolloutStatusSchema>

export const classifiabilityCapabilitiesResponseSchema = z.object({
  supportsClassifiabilityRollout: z.literal(true),
  supportsClassifiabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyClassifiabilitySignals: z.literal(true),
  supportsUsageEventClassifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ClassifiabilityCapabilitiesResponse = z.infer<
  typeof classifiabilityCapabilitiesResponseSchema
>

export const classifiabilityRolloutResponseSchema = z.object({
  status: classifiabilityRolloutStatusSchema,
  checks: z.array(classifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ClassifiabilityRolloutResponse = z.infer<
  typeof classifiabilityRolloutResponseSchema
>

export function getClassifiabilityRolloutGuidance() {
  return 'Production classifiability rollout validates idempotency key classifiability, usage event classifiability signals, billing webhook coverage, and classification readiness before production classifiability tooling.'
}
